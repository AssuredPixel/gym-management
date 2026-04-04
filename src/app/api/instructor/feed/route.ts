import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import StaffFeed from "@/models/StaffFeed";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    const gymId = (session?.user as any)?.gymId;

    if (!session || !gymId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const posts = await StaffFeed.find({ 
      gymId: new mongoose.Types.ObjectId(String(gymId)) 
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("authorId", "name role");

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("GET /api/instructor/feed error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const gymId = (session?.user as any)?.gymId;
    const userId = session?.user?.id;

    if (!session || !gymId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    await dbConnect();
    const newPost = await StaffFeed.create({
      gymId: new mongoose.Types.ObjectId(String(gymId)),
      authorId: new mongoose.Types.ObjectId(userId),
      content
    });

    // Populate author before returning
    const populatedPost = await newPost.populate("authorId", "name role");

    return NextResponse.json(populatedPost);
  } catch (error: any) {
    console.error("POST /api/instructor/feed error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("id");
    const userId = session?.user?.id;
    const role = (session?.user as any)?.role;

    if (!session || !postId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const post = await StaffFeed.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Only owner or the author can delete
    if (role !== "owner" && post.authorId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await StaffFeed.findByIdAndDelete(postId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/instructor/feed error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
