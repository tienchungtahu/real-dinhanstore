import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const addressId = parseInt(id);

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Unset all defaults for this user
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });

    // Set this address as default
    const updated = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error setting default address:", error);
    return NextResponse.json({ error: "Failed to set default address" }, { status: 500 });
  }
}
