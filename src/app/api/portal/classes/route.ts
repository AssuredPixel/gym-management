import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import WODClass from "@/models/WODClass";
import Booking from "@/models/Booking";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;
    const gymId = (session?.user as any)?.gymId;

    if (!session || userRole !== "member" || !userId || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weekStartStr = searchParams.get("weekStart");

    if (!weekStartStr) {
      return NextResponse.json({ error: "weekStart is required" }, { status: 400 });
    }

    await dbConnect();

    const weekStart = new Date(weekStartStr);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // 1. Fetch all classes for this gym in the week range
    const classes = await WODClass.find({
      gymId: new mongoose.Types.ObjectId(gymId),
      dateTime: { $gte: weekStart, $lt: weekEnd }
    }).sort({ dateTime: 1 }).lean();

    // 2. Fetch all bookings by this member for these classes
    const classIds = classes.map(c => c._id);
    const myBookings = await Booking.find({
      userId: new mongoose.Types.ObjectId(userId),
      wodClassId: { $in: classIds },
      status: "booked"
    }).lean();

    const bookedClassIds = new Set(myBookings.map(b => b.wodClassId.toString()));

    // 3. Enrich classes with isBookedByMe
    const enrichedClasses = classes.map(cls => ({
      ...cls,
      isBookedByMe: bookedClassIds.has(cls._id.toString())
    }));

    return NextResponse.json(enrichedClasses);
  } catch (error) {
    console.error("GET /api/portal/classes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
