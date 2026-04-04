import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function GET() {
  try {
    const session = await auth();
    const gymId = (session?.user as any)?.gymId;
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== "owner" || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const instructors = await User.find({ 
      gymId: new mongoose.Types.ObjectId(gymId), 
      role: "instructor" 
    }).sort({ createdAt: -1 });

    return NextResponse.json(instructors);
  } catch (error) {
    console.error("GET /api/instructors error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const gymId = (session?.user as any)?.gymId;
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== "owner" || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, phone } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    // Generate onboarding token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log("Creating instructor for gym:", gymId);

    const newInstructor = await User.create({
      name,
      email,
      phone,
      role: "instructor",
      gymId: new mongoose.Types.ObjectId(String(gymId)),
      isActive: true,
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    console.log("Instructor created successfully");

    // Send Onboarding Email
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey !== "dummy_key") {
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
      
      try {
        await resend.emails.send({
          from: "Boxos <onboarding@resend.dev>",
          to: email,
          subject: "Welcome to the Team!",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #E8541A;">Welcome to the Gym, ${name.split(' ')[0]}!</h1>
              <p>You have been added as an instructor. To get started and set up your portal access, please create your password by clicking the button below:</p>
              <div style="margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #E8541A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Setup Your Account</a>
              </div>
              <p style="font-size: 12px; color: #666;">This link will expire in 24 hours.</p>
              <p style="font-size: 12px; color: #666;">If you have any issues, please contact your gym manager.</p>
            </div>
          `,
        });
        console.log("Onboarding email sent to:", email);
      } catch (emailError) {
        console.error("Failed to send onboarding email:", emailError);
        // We don't fail the whole request if just the email fails, 
        // as the user is already created in the DB.
      }
    } else {
      console.warn("RESEND_API_KEY missing or dummy. Skipping onboarding email.");
    }

    return NextResponse.json(newInstructor, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/instructors error detail:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error",
      detail: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    const gymId = (session?.user as any)?.gymId;
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== "owner" || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, email, phone, isActive, password } = await request.json();

    if (!id || !name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // 1. Find the current instructor to check for email change
    const currentInstructor = await User.findOne({ _id: id, gymId: new mongoose.Types.ObjectId(String(gymId)) });
    
    if (!currentInstructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }

    const isEmailChanged = currentInstructor.email !== email;
    const updateData: any = { name, email, phone, isActive };

    // If email changed, generate a new setup token to ensure they can set up the new identity
    let newToken: string | null = null;
    if (isEmailChanged) {
      newToken = crypto.randomBytes(32).toString("hex");
      updateData.resetPasswordToken = newToken;
      updateData.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    if (password) {
      updateData.hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedInstructor = await User.findOneAndUpdate(
      { _id: id, gymId: new mongoose.Types.ObjectId(String(gymId)), role: "instructor" },
      { $set: updateData },
      { new: true }
    );

    // 2. If email was changed, send a fresh onboarding email to the new address
    const apiKey = process.env.RESEND_API_KEY;
    if (isEmailChanged && updatedInstructor && apiKey && apiKey !== "dummy_key") {
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${newToken}`;
      
      try {
        await resend.emails.send({
          from: "Boxos <onboarding@resend.dev>",
          to: email,
          subject: "Email Updated - Setup Your Account",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #E8541A;">Hello, ${name.split(' ')[0]}!</h1>
              <p>Your staff account email has been updated to this address. To ensure you have access to your portal, please set up a new password using the link below:</p>
              <div style="margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #E8541A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Verify & Setup Account</a>
              </div>
              <p style="font-size: 12px; color: #666;">This link will expire in 24 hours.</p>
              <p style="font-size: 12px; color: #666;">If you didn't expect this change, please contact your gym manager immediately.</p>
            </div>
          `,
        });
        console.log("Email change notification/onboarding sent to:", email);
      } catch (emailError) {
        console.error("Failed to send updated email notification:", emailError);
      }
    }

    return NextResponse.json(updatedInstructor);
  } catch (error: any) {
    console.error("PUT /api/instructors error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error",
      detail: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const gymId = (session?.user as any)?.gymId;
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== "owner" || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await dbConnect();
    const deletedInstructor = await User.findOneAndDelete({ 
      _id: id, 
      gymId: new mongoose.Types.ObjectId(gymId), 
      role: "instructor" 
    });

    if (!deletedInstructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Instructor deleted" });
  } catch (error) {
    console.error("DELETE /api/instructors error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
