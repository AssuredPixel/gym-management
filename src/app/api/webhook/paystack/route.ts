import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Membership from "@/models/Membership";

export async function POST(req: Request) {
  try {
    // 1. Fetch raw body for hashing
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing Paystack signature" }, { status: 400 });
    }

    // 2. Validate Signature
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("CRITICAL: PAYSTACK_SECRET_KEY is not defined in environment");
      return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");

    if (hash !== signature) {
      console.warn("Paystack Webhook: Invalid signature detected. Possible tampering attempt.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // 3. Process the Event
    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const data = event.data;
      const { amount, reference, metadata } = data;
      
      await dbConnect();
      
      // Ensure we have custom metadata to map back to our database
      if (metadata && metadata.custom_fields) {
        
        // Extract from our custom structure in checkout
        const customFields = metadata.custom_fields.reduce((acc: any, curr: any) => {
            acc[curr.variable_name] = curr.value;
            return acc;
        }, {});

        const userId = customFields.userId;
        const gymId = customFields.gymId;
        const plan = customFields.plan;

        if (userId && gymId) {
          // Check if payment already recorded (prevent duplicate webhooks)
          const existingPayment = await Payment.findOne({ invoiceNumber: reference });
          
          if (!existingPayment) {
            // Log Payment
            await Payment.create({
              userId,
              gymId,
              amount: amount, // Kobo
              method: "paystack",
              status: "paid",
              description: `Payment for ${plan || 'Membership'} Plan`,
              invoiceNumber: reference
            });

            // Renew Membership
            const membership = await Membership.findOne({ userId });
            if (membership) {
              const now = new Date();
              let newEndDate = new Date(membership.endDate);
              
              // If already expired, start from today
              if (newEndDate < now) {
                newEndDate = new Date(now);
              }

              // Add plan duration
              if (plan === "monthly") newEndDate.setMonth(newEndDate.getMonth() + 1);
              else if (plan === "quarterly") newEndDate.setMonth(newEndDate.getMonth() + 3);
              else if (plan === "annual") newEndDate.setFullYear(newEndDate.getFullYear() + 1);
              else newEndDate.setMonth(newEndDate.getMonth() + 1); // Default to +1 month

              membership.endDate = newEndDate;
              membership.status = "active";
              await membership.save();
              
              console.log(`[Paystack Webhook] Successfully processed payment and extended membership for User: ${userId}`);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed gracefully" });
  } catch (error) {
    console.error("Paystack Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
