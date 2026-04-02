import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Gym from '@/models/Gym';
import { initializeTransaction, listPlans, createPlan } from '@/lib/paystack';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType } = await req.json();
    if (!['monthly', 'quarterly', 'annual'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    await dbConnect();

    // 1. Get Gym and Plan details
    const gym = await Gym.findById(session.user.gymId);
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
    }

    // Define amounts in kobo (NGN 100 = 10000 kobo)
    const planAmounts: Record<string, number> = {
      monthly: 890000,   // NGN 8,900
      quarterly: 2400000, // NGN 24,000
      annual: 8400000,   // NGN 84,000
    };

    const planIntervals: Record<string, 'monthly' | 'quarterly' | 'annually'> = {
      monthly: 'monthly',
      quarterly: 'quarterly',
      annual: 'annually',
    };

    const amount = planAmounts[planType];
    const interval = planIntervals[planType];
    const planName = `${gym.name} - ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`;

    // 2. Find or Create Paystack Plan
    let paystackPlanCode = '';
    const plansResponse = await listPlans();
    const existingPlan = plansResponse.data.find((p: any) => p.name === planName);

    if (existingPlan) {
      paystackPlanCode = existingPlan.plan_code;
    } else {
      const newPlan = await createPlan({
        name: planName,
        amount: amount,
        interval: interval,
      });
      paystackPlanCode = newPlan.data.plan_code;
    }

    // 3. Initialize Transaction
    const callbackUrl = `${process.env.NEXTAUTH_URL}/portal/subscription/verify`;
    const initializeResponse = await initializeTransaction({
      email: session.user.email!,
      amount: amount,
      callback_url: callbackUrl,
      plan: paystackPlanCode,
      metadata: {
        userId: session.user.id,
        gymId: session.user.gymId,
        planType: planType,
      },
    });

    return NextResponse.json({ 
      authorization_url: initializeResponse.data.authorization_url,
      reference: initializeResponse.data.reference 
    });

  } catch (error: any) {
    console.error('Paystack Initialization Error:', error.response?.data || error.message);
    return NextResponse.json({ 
      error: 'Failed to initialize payment',
      details: error.response?.data?.message || error.message 
    }, { status: 500 });
  }
}
