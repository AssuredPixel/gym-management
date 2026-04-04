import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });

    // For security, don't reveal if user exists or not
    if (!user) {
      return NextResponse.json({ message: "If an account exists with that email, a reset link has been sent." });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send Reset Email
    if (process.env.RESEND_API_KEY) {
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
      
      await resend.emails.send({
        from: "Boxos <auth@resend.dev>",
        to: email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #E8541A;">Reset Your Password</h2>
            <p>You requested a password reset for your BoxOS account. Click the button below to set a new password:</p>
            <div style="margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #E8541A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 12px; color: #666;">This link will expire in 1 hour.</p>
            <p style="font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ message: "If an account exists with that email, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
