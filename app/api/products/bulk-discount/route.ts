import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// POST - Apply discount to multiple products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds, discountType, discountValue, clearDiscount } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "Product IDs required" }, { status: 400 });
    }

    // Clear discount
    if (clearDiscount) {
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { salePrice: null },
      });
      return NextResponse.json({ message: "Cleared discounts", updated: productIds.length });
    }

    if (!discountValue || discountValue <= 0) {
      return NextResponse.json({ error: "Invalid discount value" }, { status: 400 });
    }

    // Get products
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let updatedCount = 0;

    for (const product of products) {
      const originalPrice = Number(product.price);
      let newSalePrice: number;

      if (discountType === "percent") {
        newSalePrice = Math.round(originalPrice * (1 - discountValue / 100));
      } else {
        newSalePrice = Math.max(0, originalPrice - discountValue);
      }

      await prisma.product.update({
        where: { id: product.id },
        data: { salePrice: newSalePrice },
      });
      updatedCount++;
    }

    return NextResponse.json({ 
      message: `Updated ${updatedCount} products`,
      updated: updatedCount 
    });
  } catch (error) {
    console.error("Error applying bulk discount:", error);
    return NextResponse.json({ error: "Failed to apply discount" }, { status: 500 });
  }
}
