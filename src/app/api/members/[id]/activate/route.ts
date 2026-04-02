import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Membership from "@/models/Membership";
import { auth } from "@/auth";
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

    await dbConnect();

    const user = await User.findOne({
      _id: params.id,
      gymId: new mongoose.Types.ObjectId(gymId),
    });

    if (!user) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Reactivate user
    await User.findByIdAndUpdate(params.id, { isActive: true });

    // Set membership back to active, extend end date by 30 days from today
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 30);

    await Membership.findOneAndUpdate(
      { userId: params.id },
      { status: "active", endDate: newEndDate }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/members/[id]/activate error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
