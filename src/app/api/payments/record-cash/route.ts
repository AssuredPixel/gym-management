import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Membership from "@/models/Membership";
import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";
import { auth } from "@/auth";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const gymId = (session?.user as any)?.gymId;

    if (!session || userRole !== "owner" || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberId, amount, description, date } = await request.json();

    if (!memberId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Verify member belongs to this gym
    const member = await User.findOne({ _id: memberId, gymId: new mongoose.Types.ObjectId(gymId) });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Create Payment record
    const payment = await Payment.create({
      userId: memberId,
      gymId: new mongoose.Types.ObjectId(gymId),
      amount,
      method: "cash",
      status: "paid",
      description: description || "Cash Payment",
      createdAt: date ? new Date(date) : new Date(),
    });

    // Update Membership endDate
    const membership = await Membership.findOne({ userId: memberId });
    if (membership) {
      const currentEndDate = new Date(membership.endDate);
      const now = new Date();
      
      // If membership is already expired, start from now
      const startBase = currentEndDate > now ? currentEndDate : now;
      const newEndDate = new Date(startBase);

      if (membership.plan === "monthly") {
        newEndDate.setDate(newEndDate.getDate() + 30);
      } else if (membership.plan === "quarterly") {
        newEndDate.setDate(newEndDate.getDate() + 90);
      } else if (membership.plan === "annual") {
        newEndDate.setDate(newEndDate.getDate() + 365);
      }

      membership.endDate = newEndDate;
      membership.status = "active";
      await membership.save();
    }

    // Log to ActivityLog
    await ActivityLog.create({
      gymId: new mongoose.Types.ObjectId(gymId),
      type: "payment_received",
      description: `Cash payment of $${(amount / 100).toFixed(2)} recorded for ${member.name}`,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("POST /api/payments/record-cash error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
