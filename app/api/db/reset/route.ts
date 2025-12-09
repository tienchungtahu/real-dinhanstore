import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST() {
  try {
    // Delete in correct order due to foreign keys
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.address.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    return NextResponse.json({
      success: true,
      message: "Database reset successfully! Now run seed to add new data.",
    });
  } catch (error: unknown) {
    console.error("Reset error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      error: "Failed to reset database",
      message: errorMessage,
    }, { status: 500 });
  }
}
