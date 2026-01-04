import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// PUT - Update promotion
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, discountType, discountValue, startDate, endDate, productIds, isActive } = body;

    const promotion = await prisma.promotion.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(discountType && { discountType }),
        ...(discountValue !== undefined && { discountValue }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(isActive !== undefined && { isActive }),
        ...(productIds !== undefined && { productIds: productIds ? JSON.stringify(productIds) : null }),
      },
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("Error updating promotion:", error);
    return NextResponse.json({ error: "Failed to update promotion" }, { status: 500 });
  }
}

// DELETE - Delete promotion
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.promotion.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return NextResponse.json({ error: "Failed to delete promotion" }, { status: 500 });
  }
}
