import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const notifications = await Notification.find({ 
      userId: new mongoose.Types.ObjectId(session.user.id) 
    }).sort({ createdAt: -1 }).limit(50);

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, readAll } = await request.json();
    await dbConnect();

    if (readAll) {
      await Notification.updateMany(
        { userId: new mongoose.Types.ObjectId(session.user.id), isRead: false },
        { $set: { isRead: true } }
      );
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
    }

    const updated = await Notification.findOneAndUpdate(
      { _id: id, userId: new mongoose.Types.ObjectId(session.user.id) },
      { $set: { isRead: true } },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, clearAll } = await request.json();
    await dbConnect();

    if (clearAll) {
      await Notification.deleteMany({ userId: new mongoose.Types.ObjectId(session.user.id) });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
    }

    await Notification.findOneAndDelete({ 
      _id: id, 
      userId: new mongoose.Types.ObjectId(session.user.id) 
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
