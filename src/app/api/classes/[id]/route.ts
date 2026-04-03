import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import WODClass from "@/models/WODClass";
import Booking from "@/models/Booking";
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
    const body = await request.json();
    await dbConnect();

    const existingClass = await WODClass.findOne({ _id: id, gymId: new mongoose.Types.ObjectId(gymId) });
    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Constraint: Cannot change dateTime if bookedCount > 0
    if (body.dateTime) {
      const newDate = new Date(body.dateTime).getTime();
      const oldDate = new Date(existingClass.dateTime).getTime();
      
      if (newDate !== oldDate && existingClass.bookedCount > 0) {
        return NextResponse.json({ 
          error: "Cannot change the date/time of a class that already has bookings. Please cancel and re-schedule if necessary." 
        }, { status: 400 });
      }
    }

    const updatedClass = await WODClass.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("PUT /api/classes/[id] error:", error);
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
    const gymId = (session?.user as any)?.gymId;

    if (!session || userRole !== "owner" || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await dbConnect();

    const existingClass = await WODClass.findOne({ _id: id, gymId: new mongoose.Types.ObjectId(gymId) });
    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    let action = 'deleted';
    if (existingClass.bookedCount > 0) {
      // Soft delete / Cancel
      existingClass.status = 'cancelled';
      await existingClass.save();
      action = 'cancelled';

      // Notification Logic (Stubbed for Resend)
      const bookings = await Booking.find({ wodClassId: id }).populate("userId", "name email");
      bookings.forEach(booking => {
        const user = booking.userId as any;
        console.log(`[STUB] Sending cancellation email to ${user.email} for class: ${existingClass.title}`);
      });
    } else {
      // Hard delete
      await WODClass.deleteOne({ _id: id });
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("DELETE /api/classes/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
