import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import WODClass from "@/models/WODClass";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    const gymId = (session?.user as any)?.gymId;
    const coachName = session?.user?.name;

    if (!session || !gymId || !coachName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Today's classes
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayClasses = await WODClass.countDocuments({
      gymId: new mongoose.Types.ObjectId(String(gymId)),
      coach: coachName,
      dateTime: { $gte: startOfDay, $lte: endOfDay },
      status: "scheduled"
    });

    // Total unique student bookings (sum of bookedCount across coach's classes)
    const allCoachClasses = await WODClass.find({
      gymId: new mongoose.Types.ObjectId(String(gymId)),
      coach: coachName
    });

    const totalStudents = allCoachClasses.reduce((acc, curr) => acc + (curr.bookedCount || 0), 0);
    
    // Session hours (assuming durationMinutes is in the model)
    const totalMinutes = allCoachClasses.reduce((acc, curr) => acc + (curr.durationMinutes || 60), 0);
    const sessionHours = (totalMinutes / 60).toFixed(1);

    // Active ratio (Calculate based on bookedCount / capacity)
    let activeRatio = 0;
    if (allCoachClasses.length > 0) {
      const totalCapacity = allCoachClasses.reduce((acc, curr) => acc + (curr.capacity || 20), 0);
      const totalBooked = allCoachClasses.reduce((acc, curr) => acc + (curr.bookedCount || 0), 0);
      activeRatio = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;
    }

    return NextResponse.json({
      todayClasses,
      totalStudents,
      sessionHours,
      activeRatio: `${activeRatio}%`
    });
  } catch (error: any) {
    console.error("GET /api/instructor/stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
