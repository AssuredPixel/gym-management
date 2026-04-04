import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import WODClass from "@/models/WODClass";
import Notification from "@/models/Notification";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userName = session?.user?.name;
    const gymId = (session?.user as any)?.gymId;

    if (!session || !gymId || !userName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId, reason } = await request.json();

    if (!classId || !reason) {
      return NextResponse.json({ error: "Class ID and reason are required" }, { status: 400 });
    }

    await dbConnect();

    const existingClass = await WODClass.findOne({ 
      _id: classId, 
      gymId: new mongoose.Types.ObjectId(String(gymId)) 
    });

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    if (existingClass.coach !== userName) {
      return NextResponse.json({ error: "Forbidden: You are not the coach of this class" }, { status: 403 });
    }

    // Find all owners for this gym
    const owners = await User.find({ 
      gymId: new mongoose.Types.ObjectId(String(gymId)),
      role: 'owner' 
    });

    // Create notifications for each owner
    const notifications = owners.map(owner => ({
      userId: owner._id,
      title: "Unavailability Alert",
      message: `${userName} is unavailable for "${existingClass.title}" on ${new Date(existingClass.dateTime).toLocaleDateString()}. Reason: ${reason}`,
      type: 'alert',
      link: `/owner/dashboard/classes`,
      isRead: false
    }));

    await Notification.insertMany(notifications);

    return NextResponse.json({ success: true, message: "Owner notified" });
  } catch (error: any) {
    console.error("POST /api/instructor/unavailable error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
