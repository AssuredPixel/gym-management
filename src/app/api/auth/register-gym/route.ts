import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import dbConnect from "@/lib/mongodb";
import Gym from "@/models/Gym";
import User from "@/models/User";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  gymName: z.string().min(1, "Gym name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  gymSize: z.string().min(1, "Gym size is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create Gym
    const gym = await Gym.create({
      name: validatedData.gymName,
      ownerName: validatedData.ownerName,
      email: validatedData.email,
      size: validatedData.gymSize,
      plan: "starter", // Default plan
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create Owner User
    await User.create({
      name: validatedData.ownerName,
      email: validatedData.email,
      hashedPassword,
      role: "owner",
      gymId: gym._id,
    });

    return NextResponse.json(
      { success: true, message: "Gym registered" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
