import { NextResponse } from "next/server";
import { auth } from "@/auth";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { membershipId, planType } = await request.json();

    if (!membershipId || !planType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let amount = 0;
    if (planType === "monthly") amount = 8900;
    else if (planType === "quarterly") amount = 24000;
    else if (planType === "annual") amount = 84000;
    else {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json({ error: "Paystack config error" }, { status: 500 });
    }

    // Initialize Paystack transaction
    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: session.user.email,
        amount: amount, // Paystack amount is in kobo/cents
        callback_url: `${process.env.NEXTAUTH_URL}/portal/payments?success=true`,
        metadata: {
          userId: (session.user as any).id,
          gymId: (session.user as any).gymId,
          membershipId,
          planType,
          cancel_action: `${process.env.NEXTAUTH_URL}/portal/payments?cancelled=true`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (paystackResponse.data.status) {
      return NextResponse.json({ sessionUrl: paystackResponse.data.data.authorization_url });
    } else {
      return NextResponse.json(
        { error: "Paystack session creation failed" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("POST /api/paystack/create-checkout error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
