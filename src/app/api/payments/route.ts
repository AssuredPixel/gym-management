import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { auth } from "@/auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const gymId = (session?.user as any)?.gymId;

    if (!session || userRole !== "owner" || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status");
    const memberId = searchParams.get("memberId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    await dbConnect();

    const query: any = { gymId: new mongoose.Types.ObjectId(gymId) };

    if (status && status !== "all") {
      query.status = status;
    }

    const search = searchParams.get("search");
    if (search) {
      // Find matching users first
      const users = await User.find({
        name: { $regex: search, $options: "i" },
        gymId: new mongoose.Types.ObjectId(gymId)
      }).select("_id");
      
      const userIds = users.map(u => u._id);
      
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { userId: { $in: userIds } }
      ];
    }

    if (memberId) {
      query.userId = new mongoose.Types.ObjectId(memberId);
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      payments,
      total,
      totalPages,
      page,
    });
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
