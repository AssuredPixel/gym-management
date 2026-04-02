import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Membership from "@/models/Membership";
import ActivityLog from "@/models/ActivityLog";
import Payment from "@/models/Payment";
import WODClass from "@/models/WODClass";
import { auth } from "@/auth";
import { Resend } from "resend";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function GET(request: Request) {
  try {
    const session = await auth();
    // Use type assertion carefully since session types might not be exported broadly
    const userRole = (session?.user as any)?.role;
    const gymId = (session?.user as any)?.gymId;

    if (!session || userRole !== "owner" || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "8", 10);
    const skip = (page - 1) * limit;

    await dbConnect();

    // Base match for members of this gym
    const baseMatch: any = {
      role: "member",
      gymId: new mongoose.Types.ObjectId(gymId),
    };

    if (search) {
      baseMatch.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Build the aggregation pipeline
    const pipeline: any[] = [
      { $match: baseMatch },
      // Lookup membership
      {
        $lookup: {
          from: "memberships",
          localField: "_id",
          foreignField: "userId",
          as: "membership",
        },
      },
      // Safely handle users who might not have a membership yet (though they should)
      {
        $addFields: {
          membership: { $arrayElemAt: ["$membership", 0] },
        },
      },
    ];

    // Sort by most recently created user
    pipeline.push({ $sort: { createdAt: -1 } });

    // Build the conditional filter for pagination
    const statusFilter = status !== "all" ? [{ $match: { "membership.status": status } }] : [];

    // Use $facet to get both total count and paginated items
    pipeline.push({
      $facet: {
        statusCounts: [
          {
            $group: {
              _id: "$membership.status",
              count: { $sum: 1 }
            }
          }
        ],
        totalFilteredData: [
          ...statusFilter,
          { $count: "count" }
        ],
        paginatedResults: [
          ...statusFilter,
          { $skip: skip },
          { $limit: limit },
          // Now for these specific members, lookup their payments to calculate totalPaid
          {
            $lookup: {
              from: "payments",
              let: { userId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$userId", "$$userId"] },
                        { $eq: ["$status", "completed"] },
                      ],
                    },
                  },
                },
              ],
              as: "payments",
            },
          },
          // And lookup their class attendance to compute classesAttended
          {
            $lookup: {
              from: "wodclasses",
              let: { userId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ["$$userId", { $ifNull: ["$attendees", []] }],
                    },
                  },
                },
              ],
              as: "classes",
            },
          },
          // Format the final output
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              phone: 1,
              createdAt: 1,
              isActive: 1,
              plan: "$membership.plan",
              status: "$membership.status",
              startDate: "$membership.startDate",
              endDate: "$membership.endDate",
              totalPaid: { $sum: "$payments.amount" },
              classesAttended: { $size: "$classes" },
            },
          },
        ],
      },
    });

    const results = await User.aggregate(pipeline);
    
    // Parse status counts
    const statusCountsRaw = results[0]?.statusCounts || [];
    const counts: Record<string, number> = { all: 0, active: 0, expiring: 0, expired: 0 };
    statusCountsRaw.forEach((c: any) => {
      const s = c._id || 'unknown';
      if (counts[s] !== undefined) {
        counts[s] = c.count;
      }
      counts['all'] += c.count;
    });

    const totalFilteredCount = results[0]?.totalFilteredData[0]?.count || 0;
    const members = results[0]?.paginatedResults || [];
    const totalPages = Math.ceil(totalFilteredCount / limit);

    return NextResponse.json({
      members,
      counts,
      total: totalFilteredCount,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("GET /api/members error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
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
    const { firstName, lastName, email, phone, plan, startDate, notes } = body;

    if (!firstName || !lastName || !email || !plan || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    // Generate a secure random default password since users can set it themselves later
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Calculate endDate
    const start = new Date(startDate);
    const endDate = new Date(start);
    if (plan === "monthly") {
      endDate.setDate(endDate.getDate() + 30);
    } else if (plan === "quarterly") {
      endDate.setDate(endDate.getDate() + 90);
    } else if (plan === "annual") {
      endDate.setDate(endDate.getDate() + 365);
    }

    // Create User
    const name = `${firstName} ${lastName}`.trim();
    const newUser = await User.create({
      name,
      email,
      phone,
      hashedPassword,
      role: "member",
      gymId: new mongoose.Types.ObjectId(gymId),
      isActive: true,
    });

    // Create Membership
    const newMembership = await Membership.create({
      userId: newUser._id,
      gymId: new mongoose.Types.ObjectId(gymId),
      plan,
      startDate: start,
      endDate,
      status: "active",
      autoRenew: true,
    });

    // Log activity
    await ActivityLog.create({
      gymId: new mongoose.Types.ObjectId(gymId),
      type: "member_added",
      description: `New member ${name} added`,
    });

    // Send welcome email (non-blocking)
    if (process.env.RESEND_API_KEY) {
      resend.emails.send({
        from: "Boxos <onboarding@resend.dev>", // replace with verified domain if configured
        to: email,
        subject: "Welcome to our Gym!",
        html: `
          <h1>Welcome to our Gym, ${firstName}!</h1>
          <p>We are thrilled to have you as a member.</p>
          <p>Your <strong>${plan}</strong> plan starts on ${start.toLocaleDateString()}.</p>
          <p>Your temporary password is: <strong>${randomPassword}</strong></p>
          <p>Please log in and update your password when you have a moment.</p>
          <p>Important notes (if any): ${notes || "None"}</p>
        `,
      }).catch(err => {
        console.error("Failed to send welcome email:", err);
      });
    } else {
      console.warn("RESEND_API_KEY is not set. Skipping welcome email.");
    }

    return NextResponse.json(
      { 
        message: "Member created successfully",
        member: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          plan: newMembership.plan,
          status: newMembership.status,
          startDate: newMembership.startDate,
          endDate: newMembership.endDate,
          createdAt: newUser.createdAt,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/members error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
