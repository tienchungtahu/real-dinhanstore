import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clerkId, firstName, lastName, email, phone, avatar } = body;

    if (!clerkId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        avatar,
      },
      create: {
        clerkId,
        firstName,
        lastName,
        email,
        phone,
        avatar,
        role: "customer",
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
