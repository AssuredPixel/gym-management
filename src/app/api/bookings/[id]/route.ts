import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import WODClass from "@/models/WODClass";
import mongoose from "mongoose";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const gymId = (session?.user as any)?.gymId;

    if (!session || userRole !== "owner" || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    if (!['booked', 'cancelled', 'attended', 'no-show'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await dbConnect();

    const booking = await Booking.findOne({ 
      _id: id,
      gymId: new mongoose.Types.ObjectId(gymId) 
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const oldStatus = booking.status;

    // Handle bookedCount sync
    if (oldStatus === 'booked' && status === 'cancelled') {
      await WODClass.findByIdAndUpdate(booking.wodClassId, {
        $inc: { bookedCount: -1 }
      });
    } else if (oldStatus === 'cancelled' && status === 'booked') {
      await WODClass.findByIdAndUpdate(booking.wodClassId, {
        $inc: { bookedCount: 1 }
      });
    }

    booking.status = status;
    await booking.save();

    return NextResponse.json(booking);
  } catch (error) {
    console.error("PUT /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
