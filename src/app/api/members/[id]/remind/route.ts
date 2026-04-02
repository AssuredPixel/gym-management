import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Membership from "@/models/Membership";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await dbConnect();

    // Check if membership exists for this gym
    const membership = await Membership.findOne({ 
      _id: id, 
      gymId: session.user.gymId 
    }).populate("userId", "name email");

    if (!membership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    // Skeleton for Resend email integration
    // In production, use: await resend.emails.send({ ... })
    
    console.log(`[STUB] Sending reminder to ${membership.userId.email} for membership ending ${membership.endDate}`);

    return NextResponse.json({ 
      success: true, 
      message: `Reminder sent to ${membership.userId.name}` 
    });

  } catch (error) {
    console.error("Remind error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
