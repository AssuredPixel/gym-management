import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Membership from '@/models/Membership';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';

export async function POST(req: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = req.headers.get('x-paystack-signature');
    const body = await req.text();

    if (!hash || !secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Verify Signature
    const expectedHash = crypto.createHmac('sha512', secret).update(body).digest('hex');
    if (hash !== expectedHash) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('Paystack Webhook Event Received:', event.event);

    await dbConnect();

    // 2. Handle relevant events
    if (event.event === 'subscription.create' || event.event === 'charge.success') {
      const { customer, metadata, amount, reference, plan } = event.data;
      
      // Paystack metadata is often in data.metadata for initial charges, 
      // but might be missing for recurring charges. 
      // We can use the customer's email to find the user if metadata is missing.
      let userId = metadata?.userId;
      let gymId = metadata?.gymId;
      let planType = metadata?.planType;

      const user = await User.findOne({ email: customer.email });
      if (user) {
        userId = user._id;
        gymId = user.gymId;
      }

      if (!userId || !gymId) {
        console.error('Missing userId/gymId in webhook data for:', customer.email);
        return NextResponse.json({ success: true }); // Acknowledge to Paystack anyway
      }

      // 3. Create/Update Payment record
      await Payment.create({
        userId,
        gymId,
        amount: amount,
        method: 'paystack',
        status: 'paid',
        paystackReference: reference,
        description: `Subscription Payment - ${plan?.name || 'Plan'}`,
      });

      // 4. Update Membership
      const startDate = new Date();
      const endDate = new Date();
      
      // Calculate End Date based on interval
      if (plan?.interval === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
      else if (plan?.interval === 'quarterly') endDate.setMonth(endDate.getMonth() + 3);
      else if (plan?.interval === 'annually') endDate.setFullYear(endDate.getFullYear() + 1);
      else {
          // Default to 30 days if plan details are sparse
          endDate.setDate(endDate.getDate() + 30);
      }

      await Membership.findOneAndUpdate(
        { userId },
        {
          userId,
          gymId,
          plan: planType || 'monthly',
          startDate,
          endDate,
          status: 'active',
          paystackSubscriptionCode: event.data.subscription_code,
          paystackCustomerCode: customer.customer_code,
          autoRenew: true,
        },
        { upsert: true, new: true }
      );

      // 5. Log Activity
      await ActivityLog.create({
        gymId,
        type: 'payment_received',
        description: `Auto-payment of NGN ${(amount / 100).toLocaleString()} received from ${user?.name || customer.email}`,
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Paystack Webhook Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
