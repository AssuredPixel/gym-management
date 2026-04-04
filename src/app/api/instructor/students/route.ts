import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import WODClass from "@/models/WODClass";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    const userName = session?.user?.name;
    const gymId = (session?.user as any)?.gymId;

    if (!session || !gymId || !userName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find all classes coached by this instructor in this gym
    const classes = await WODClass.find({
      gymId: new mongoose.Types.ObjectId(String(gymId)),
      coach: userName
    });

    const classIds = classes.map(c => c._id);

    // Find all unique user IDs from bookings for these classes
    const uniqueUserIds = await Booking.distinct("userId", {
      wodClassId: { $in: classIds },
      status: { $ne: "cancelled" }
    });

    // Fetch user details for these IDs
    const students = await User.find({
      _id: { $in: uniqueUserIds }
    }).select("name email phone role createdAt");

    // Augment with booking stats (optional but nice)
    const formattedStudents = await Promise.all(students.map(async (student) => {
        const bookingCount = await Booking.countDocuments({
            userId: student._id,
            wodClassId: { $in: classIds }
        });
        
        return {
            ...student.toObject(),
            attendanceCount: bookingCount,
            lastAttended: (await Booking.findOne({ 
                userId: student._id, 
                wodClassId: { $in: classIds } 
            }).sort({ createdAt: -1 }))?.createdAt
        };
    }));

    return NextResponse.json(formattedStudents);
  } catch (error: any) {
    console.error("GET /api/instructor/students error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
