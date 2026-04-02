import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/mongodb/seed";

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { error: "Seeding failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
