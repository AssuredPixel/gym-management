import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Membership from '@/models/Membership';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const gymId = (session?.user as any)?.gymId;

    if (!session || userRole !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, amount, planType, description } = await req.json();

    if (!userId || !amount || !planType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Create Payment record (in cents)
    const paymentAmount = Number(amount) * 100; // Convert to cents/kobo
    const payment = await Payment.create({
      userId,
      gymId,
      amount: paymentAmount,
      method: 'cash',
      status: 'paid',
      description: description || `Manual Payment - ${planType} Plan`,
    });

    // 2. Update Membership
    const startDate = new Date();
    const endDate = new Date();
    
    if (planType === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
    else if (planType === 'quarterly') endDate.setMonth(endDate.getMonth() + 3);
    else if (planType === 'annual') endDate.setFullYear(endDate.getFullYear() + 1);

    await Membership.findOneAndUpdate(
      { userId },
      {
        userId,
        gymId,
        plan: planType,
        startDate,
        endDate,
        status: 'active',
        autoRenew: false, // Cash payments typically aren't auto-recurring
      },
      { upsert: true, new: true }
    );

    // 3. Log Activity
    await ActivityLog.create({
      gymId,
      type: 'payment_received',
      description: `Cash payment of ${(paymentAmount / 100).toLocaleString()} recorded for ${user.name}`,
    });

    return NextResponse.json({ success: true, paymentId: payment._id });

  } catch (error: any) {
    console.error('Cash Payment API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
