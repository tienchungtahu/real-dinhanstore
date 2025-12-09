import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 404 });
    }

    return NextResponse.json({
      isAdmin: user.role === "admin",
      role: user.role,
    });
  } catch (error) {
    console.error("Error checking admin:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
