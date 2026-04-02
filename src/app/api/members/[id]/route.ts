import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Payment from "@/models/Payment";
import WODClass from "@/models/WODClass";
import { auth } from "@/auth";
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

    await dbConnect();

    // Fetch user and membership
    const user = await User.findOne({
      _id: params.id,
      gymId: new mongoose.Types.ObjectId(gymId),
    });

    if (!user) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const membership = await Membership.findOne({ userId: user._id });

    // Fetch last 10 payments
    const payments = await Payment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Fetch last 10 classes
    const classes = await WODClass.find({ attendees: user._id })
      .sort({ dateTime: -1 })
      .limit(10);

    return NextResponse.json({
      member: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
        membership: membership || null,
      },
      recentPayments: payments,
      recentClasses: classes,
    });
  } catch (error) {
    console.error("GET /api/members/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const { name, email, phone, isActive, plan, endDate } = body;

    await dbConnect();

    // Ensure member belongs to this owner's gym
    const userCheck = await User.findOne({
      _id: params.id,
      gymId: new mongoose.Types.ObjectId(gymId),
    });

    if (!userCheck) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const userUpdates: any = {};
    if (name !== undefined) userUpdates.name = name;
    if (email !== undefined) userUpdates.email = email;
    if (phone !== undefined) userUpdates.phone = phone;
    if (isActive !== undefined) userUpdates.isActive = isActive;

    let updatedUser = userCheck;
    if (Object.keys(userUpdates).length > 0) {
      updatedUser = await User.findByIdAndUpdate(params.id, userUpdates, {
        new: true,
      });
    }

    const membershipUpdates: any = {};
    if (plan !== undefined) membershipUpdates.plan = plan;
    if (endDate !== undefined) membershipUpdates.endDate = new Date(endDate);

    let updatedMembership = null;
    if (Object.keys(membershipUpdates).length > 0) {
      updatedMembership = await Membership.findOneAndUpdate(
        { userId: params.id },
        membershipUpdates,
        { new: true }
      );
    } else {
      updatedMembership = await Membership.findOne({ userId: params.id });
    }

    return NextResponse.json({
      message: "Member updated successfully",
      member: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        membership: updatedMembership || null,
      },
    });
  } catch (error) {
    console.error("PUT /api/members/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
