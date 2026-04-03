import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import mongoose from "mongoose";

export async function GET(
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

    const bookings = await Booking.find({ 
      wodClassId: id,
      gymId: new mongoose.Types.ObjectId(gymId) 
    }).populate("userId", "name email");

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("GET /api/classes/[id]/bookings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
