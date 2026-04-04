import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Membership from "@/models/Membership";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;
    const gymId = (session?.user as any)?.gymId;

    if (!session || userRole !== "member" || !userId || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // 1. Fetch last 10 payments
    const payments = await Payment.find({
      userId: new mongoose.Types.ObjectId(userId)
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    // 2. Fetch current membership details
    const membership = await Membership.findOne({ 
      userId: new mongoose.Types.ObjectId(userId) 
    }).lean();

    return NextResponse.json({
      payments,
      membership
    });
  } catch (error) {
    console.error("GET /api/portal/payments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
