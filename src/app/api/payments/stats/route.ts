import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Membership from "@/models/Membership";
import User from "@/models/User";
import { auth } from "@/auth";
import mongoose from "mongoose";

export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const gymId = (session?.user as any)?.gymId;

    if (!session || userRole !== "owner" || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 1. revenueThisMonth
    const revenueThisMonthResult = await Payment.aggregate([
      {
        $match: {
          gymId: new mongoose.Types.ObjectId(gymId),
          status: "paid",
          createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const revenueThisMonth = revenueThisMonthResult[0]?.total || 0;

    // 2. revenueByMonth (last 12 months)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const revenueByMonthResult = await Payment.aggregate([
      {
        $match: {
          gymId: new mongoose.Types.ObjectId(gymId),
          status: "paid",
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = months[d.getMonth()];
      const year = d.getFullYear();
      const month = d.getMonth() + 1;

      const record = revenueByMonthResult.find(
        (r) => r._id.year === year && r._id.month === month
      );
      revenueByMonth.push({
        month: monthLabel,
        revenue: record ? record.revenue : 0,
      });
    }

    // 3. overdueMembers: array of members with expired membership + amount owed
    const overdueMemberships = await Membership.find({
      gymId: new mongoose.Types.ObjectId(gymId),
      endDate: { $lt: now },
      // status: { $ne: "expired" }, // If we want to find members who just expired
    }).populate("userId", "name email");

    const overdueMembers = overdueMemberships.map((m: any) => {
      // Logic for "amount owed": Typically the price of their next cycle
      let amountOwed = 0;
      if (m.plan === "monthly") amountOwed = 8900;
      else if (m.plan === "quarterly") amountOwed = 24000;
      else if (m.plan === "annual") amountOwed = 84000;

      return {
        _id: m.userId._id,
        name: m.userId.name,
        email: m.userId.email,
        endDate: m.endDate,
        amountOwed,
      };
    });

    // 4. upcomingPayments: members with endDate in next 7 days
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);

    const upcomingMemberships = await Membership.find({
      gymId: new mongoose.Types.ObjectId(gymId),
      endDate: { $gte: now, $lte: next7Days },
    }).populate("userId", "name email");

    const upcomingPayments = upcomingMemberships.map((m: any) => ({
      _id: m.userId._id,
      name: m.userId.name,
      email: m.userId.email,
      endDate: m.endDate,
      plan: m.plan,
    }));

    return NextResponse.json({
      revenueThisMonth,
      revenueByMonth,
      overdueMembers,
      upcomingPayments,
    });
  } catch (error) {
    console.error("GET /api/payments/stats error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
