import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import WODClass from "@/models/WODClass";
import ActivityLog from "@/models/ActivityLog";
import mongoose from "mongoose";
import { z } from "zod";

const ClassSchema = z.object({
  title: z.string().min(1, "Title is required"),
  coach: z.string().min(1, "Coach is required"),
  dateTime: z.coerce.date().refine(d => d > new Date(), "Date must be in the future"),
  durationMinutes: z.number().default(60),
  capacity: z.number().min(1).max(100),
  classType: z.enum(['wod', 'strength', 'competition', 'open']).default('wod'),
  description: z.string().optional(),
  publishImmediately: z.boolean().optional()
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const gymId = (session?.user as any)?.gymId;

    if (!session || userRole !== "owner" || !gymId) {
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

    const classes = await WODClass.find({
      gymId: new mongoose.Types.ObjectId(gymId),
      dateTime: { $gte: weekStart, $lt: weekEnd }
    }).sort({ dateTime: 1 }).lean();

    return NextResponse.json(classes);
  } catch (error) {
    console.error("GET /api/classes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const gymId = (session?.user as any)?.gymId;

    if (!session || userRole !== "owner" || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = ClassSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;
    await dbConnect();

    const newClass = await WODClass.create({
      ...data,
      gymId: new mongoose.Types.ObjectId(gymId),
      bookedCount: 0,
      status: 'scheduled'
    });

    // Log the activity
    await ActivityLog.create({
      gymId: new mongoose.Types.ObjectId(gymId),
      type: 'class_created',
      description: `WOD ${newClass.title} created for ${new Date(newClass.dateTime).toLocaleDateString()}`
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("POST /api/classes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
