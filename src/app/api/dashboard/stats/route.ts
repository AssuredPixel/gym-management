import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Payment from "@/models/Payment";
import WODClass from "@/models/WODClass";
import ActivityLog from "@/models/ActivityLog";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gymId = session.user.gymId;
    const gymObjectId = new mongoose.Types.ObjectId(gymId);
    
    await dbConnect();

    const now = new Date();
    
    // Start/End of current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Start/End of current day
    const dayStart = new Date(now.setHours(0, 0, 0, 0));
    const dayEnd = new Date(now.setHours(23, 59, 59, 999));
    
    // Start/End of current week (assuming Sunday start)
    const currentDay = new Date();
    const weekStart = new Date(currentDay.setDate(currentDay.getDate() - currentDay.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Expiry threshold (7 days from now)
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + 7);

    // Parallel queries for performance
    const [
      totalMembers,
      activeMembers,
      revenueStats,
      classesThisWeek,
      classesToday,
      expiringMembers,
      recentActivity
    ] = await Promise.all([
      User.countDocuments({ gymId, role: "member" }),
      Membership.countDocuments({ gymId, status: "active" }),
      Payment.aggregate([
        { 
          $match: { 
            gymId: gymObjectId,
            createdAt: { $gte: monthStart, $lte: monthEnd },
            status: "completed"
          } 
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      WODClass.countDocuments({ 
        gymId, 
        dateTime: { $gte: weekStart, $lte: weekEnd } 
      }),
      WODClass.find({ 
        gymId, 
        dateTime: { $gte: dayStart, $lte: dayEnd } 
      }).sort({ dateTime: 1 }),
      Membership.find({ 
        gymId, 
        status: "expiring",
        endDate: { $lte: expiryThreshold }
      }).populate("userId", "name"),
      ActivityLog.find({ gymId })
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Format revenue
    const revenueThisMonth = revenueStats.length > 0 ? revenueStats[0].total : 0;

    return NextResponse.json({
      totalMembers,
      activeMembers,
      revenueThisMonth,
      classesThisWeek,
      classesTodayCount: classesToday.length,
      classesToday,
      expiringMembers: expiringMembers.map((m: any) => ({
        id: m._id,
        name: m.userId.name,
        endDate: m.endDate
      })),
      recentActivity
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
