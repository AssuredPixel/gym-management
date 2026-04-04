import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gym from "@/models/Gym";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const gymId = (session?.user as any)?.gymId;

    if (!session || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const gym = await Gym.findById(gymId);

    if (!gym) {
      return NextResponse.json({ error: "Gym not found" }, { status: 404 });
    }

    return NextResponse.json(gym);
  } catch (error) {
    console.error("GET /api/gym/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const gymId = (session?.user as any)?.gymId;

    if (!session || userRole !== "owner" || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await dbConnect();

    const updatedGym = await Gym.findByIdAndUpdate(
      gymId,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedGym) {
      return NextResponse.json({ error: "Gym not found" }, { status: 404 });
    }

    return NextResponse.json(updatedGym);
  } catch (error) {
    console.error("PUT /api/gym/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
