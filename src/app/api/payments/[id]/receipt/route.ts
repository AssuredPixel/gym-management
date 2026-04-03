import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Gym from "@/models/Gym";
import User from "@/models/User";
import { auth } from "@/auth";
import { renderToStream } from "@react-pdf/renderer";
import ReceiptPDF from "@/components/ReceiptPDF";
import React from "react";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await dbConnect();

    // Fetch Payment and populate user
    const payment = await Payment.findById(id).populate("userId");
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Fetch Gym
    const gym = await Gym.findById(payment.gymId);
    if (!gym) {
      return NextResponse.json({ error: "Gym not found" }, { status: 404 });
    }

    // Auth check: Is current user the owner of the gym OR the member who owns the payment?
    const currentUserId = (session.user as any).id;
    const isOwner = (session.user as any).role === "owner" && (session.user as any).gymId === payment.gymId.toString();
    const isMember = payment.userId._id.toString() === currentUserId;

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate PDF stream
    const stream = await renderToStream(
      React.createElement(ReceiptPDF, { payment, gym }) as any
    );

    // Return stream as response
    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=receipt-${payment.invoiceNumber}.pdf`,
      },
    });
  } catch (error) {
    console.error("GET /api/payments/[id]/receipt error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
