import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import WODClass from "@/models/WODClass";
import Booking from "@/models/Booking";
import Membership from "@/models/Membership";
import mongoose from "mongoose";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;
    const gymId = (session?.user as any)?.gymId;

    if (!session || userRole !== "member" || !userId || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: classId } = params;
    await dbConnect();

    // 1. Check if class exists and is in the future
    const wodClass = await WODClass.findOne({ 
      _id: classId, 
      gymId: new mongoose.Types.ObjectId(gymId) 
    });

    if (!wodClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    if (new Date(wodClass.dateTime) < new Date()) {
      return NextResponse.json({ error: "Cannot book a class that has already started" }, { status: 400 });
    }

    // 2. Check if class is full
    if (wodClass.bookedCount >= wodClass.capacity) {
      return NextResponse.json({ error: "Class is full" }, { status: 400 });
    }

    // 3. Check if member has an active membership
    const membership = await Membership.findOne({ 
      userId: new mongoose.Types.ObjectId(userId),
      status: { $in: ["active", "expiring"] }
    });

    if (!membership) {
      return NextResponse.json({ error: "You need an active membership to book classes" }, { status: 403 });
    }

    // 4. Check if already booked
    const existingBooking = await Booking.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      wodClassId: new mongoose.Types.ObjectId(classId),
      status: "booked"
    });

    if (existingBooking) {
      return NextResponse.json({ error: "You have already booked this class" }, { status: 400 });
    }

    // 5. Create Booking and increment count atomically
    const booking = await Booking.create({
      userId: new mongoose.Types.ObjectId(userId),
      wodClassId: new mongoose.Types.ObjectId(classId),
      gymId: new mongoose.Types.ObjectId(gymId),
      status: "booked"
    });

    await WODClass.findByIdAndUpdate(classId, { $inc: { bookedCount: 1 } });

    // TODO: Send booking confirmation email via Resend

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error("POST /api/portal/classes/[id]/book error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;
    const gymId = (session?.user as any)?.gymId;

    if (!session || userRole !== "member" || !userId || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: classId } = params;
    await dbConnect();

    // 1. Find the booking
    const booking = await Booking.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      wodClassId: new mongoose.Types.ObjectId(classId),
      status: "booked"
    }).populate("wodClassId");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const wodClass = booking.wodClassId as any;

    // 2. Check 2-hour cancellation rule
    const now = new Date();
    const classTime = new Date(wodClass.dateTime);
    const diffInHours = (classTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 2) {
      return NextResponse.json({ error: "Cancellations must be made 2+ hours before class" }, { status: 400 });
    }

    // 3. Cancel booking and decrement count
    booking.status = "cancelled";
    await booking.save();

    await WODClass.findByIdAndUpdate(classId, { $inc: { bookedCount: -1 } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/portal/classes/[id]/book error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
