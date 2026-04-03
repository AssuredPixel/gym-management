import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Membership from "@/models/Membership";
import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Verify Paystack Signature
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET || "";
    const hash = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    await dbConnect();

    if (event.event === "charge.success") {
      const data = event.data;
      const metadata = data.metadata;

      const userId = metadata.userId;
      const gymId = metadata.gymId;
      const membershipId = metadata.membershipId;
      const planType = metadata.planType;
      const amount = data.amount; // in kobo/cents
      const reference = data.reference;

      // Create Payment record
      const payment = await Payment.create({
        userId,
        gymId,
        amount,
        method: "paystack",
        status: "paid",
        description: `Paystack Payment - ${planType} Plan`,
        paystackReference: reference,
        membershipId,
      });

      // Update Membership
      const membership = await Membership.findById(membershipId);
      if (membership) {
        const currentEndDate = new Date(membership.endDate);
        const now = new Date();
        const startBase = currentEndDate > now ? currentEndDate : now;
        const newEndDate = new Date(startBase);

        if (planType === "monthly") newEndDate.setDate(newEndDate.getDate() + 30);
        else if (planType === "quarterly") newEndDate.setDate(newEndDate.getDate() + 90);
        else if (planType === "annual") newEndDate.setDate(newEndDate.getDate() + 365);

        membership.endDate = newEndDate;
        membership.status = "active";
        await membership.save();
      }

      // Log activity
      const member = await User.findById(userId);
      await ActivityLog.create({
        gymId,
        type: "payment_received",
        description: `Online payment of $${(amount / 100).toFixed(2)} received from ${member?.name || 'unknown member'}`,
      });

      // Send confirmation email
      if (member?.email) {
        await resend.emails.send({
          from: "Boxos <payments@resend.dev>",
          to: member.email,
          subject: "Payment Confirmation",
          html: `
            <h1>Thank you for your payment, ${member.name}!</h1>
            <p>Your <strong>${planType}</strong> membership has been extended.</p>
            <p>New end date: ${membership ? new Date(membership.endDate).toLocaleDateString() : 'N/A'}</p>
            <p>Amount paid: $${(amount / 100).toFixed(2)}</p>
          `,
        }).catch(err => console.error("Email send error:", err));
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("POST /api/paystack/webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
