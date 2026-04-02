import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Membership from "@/models/Membership";
import ActivityLog from "@/models/ActivityLog";
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

    // Verify user belongs to this gym
    const user = await User.findOne({
      _id: params.id,
      gymId: new mongoose.Types.ObjectId(gymId),
    });

    if (!user) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Set user.isActive = false
    await User.findByIdAndUpdate(params.id, { isActive: false });

    // Set membership.status = 'expired'
    await Membership.findOneAndUpdate(
      { userId: params.id },
      { status: "expired" }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/members/[id]/deactivate error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
