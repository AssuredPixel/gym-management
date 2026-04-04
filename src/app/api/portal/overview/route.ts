import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Membership from "@/models/Membership";
import Booking from "@/models/Booking";
import WODClass from "@/models/WODClass";
import Payment from "@/models/Payment";
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

    const now = new Date();
    
    // 1. Membership Details
    const membership = await Membership.findOne({ 
      userId: new mongoose.Types.ObjectId(userId) 
    }).lean();

    let membershipData = null;
    if (membership) {
        const endDate = new Date(membership.endDate);
        const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        membershipData = {
          ...membership,
          daysRemaining: Math.max(0, diffDays)
        };
    }

    // 2. Next Booked Class
    const nextBooking = await Booking.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      status: "booked"
    })
    .populate({
      path: "wodClassId",
      match: { dateTime: { $gte: now } },
      options: { sort: { dateTime: 1 } }
    })
    .lean();

    // 3. Upcoming Bookings (Next 3)
    const upcomingBookings = await Booking.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: "booked"
    })
    .populate({
      path: "wodClassId",
      match: { dateTime: { $gte: now } }
    })
    .sort({ "wodClassId.dateTime": 1 })
    .limit(3)
    .lean();

    const filteredUpcoming = upcomingBookings
      .filter((b: any) => b.wodClassId)
      .map((b: any) => b.wodClassId);

    // 4. This Month Attendance
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthAttendance = await Booking.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      status: "attended",
      updatedAt: { $gte: monthStart }
    });

    // 5. Weekly Attendance (Sparkline - Last 4 Weeks)
    const weeklyAttendance = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - (i * 7 + 7));
      const end = new Date();
      end.setDate(end.getDate() - (i * 7));
      
      const count = await Booking.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        status: "attended",
        updatedAt: { $gte: start, $lt: end }
      });
      weeklyAttendance.push({ week: 4 - i, count });
    }

    // 6. Recent Payment
    const recentPayment = await Payment.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      status: "paid"
    })
    .sort({ createdAt: -1 })
    .lean();

    // 7. Tomorrow's WOD (Low Capacity Alert)
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const tomorrowClasses = await WODClass.find({
      gymId: new mongoose.Types.ObjectId(gymId),
      dateTime: { $gte: tomorrowStart, $lt: tomorrowEnd }
    }).sort({ dateTime: 1 }).lean(); 

    // Find the first class tomorrow that has <= 5 spots left AND is not full
    const tomorrowWOD = tomorrowClasses.find(cls => {
      const spotsLeft = cls.capacity - cls.bookedCount;
      return spotsLeft > 0 && spotsLeft <= 5;
    }) || null;

    return NextResponse.json({
      membership: membershipData,
      nextBookedClass: nextBooking?.wodClassId || null,
      upcomingBookings: filteredUpcoming,
      thisMonthAttendance,
      weeklyAttendance,
      recentPayment,
      tomorrowWOD
    });
  } catch (error) {
    console.error("GET /api/portal/overview error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
