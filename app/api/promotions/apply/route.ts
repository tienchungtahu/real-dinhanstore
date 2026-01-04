import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// UTC+7 offset
const VN_OFFSET = 7 * 60 * 60 * 1000;

function getNowVN(): Date {
  return new Date(Date.now() + VN_OFFSET);
}

// POST - Apply active promotions to products
export async function POST() {
  try {
    const now = getNowVN();

    // Get all active promotions that are currently running
    const activePromotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { discountValue: "desc" }, // Higher discount takes priority
    });

    if (activePromotions.length === 0) {
      return NextResponse.json({ message: "No active promotions to apply", updated: 0 });
    }

    let updatedCount = 0;

    for (const promotion of activePromotions) {
      const productIds = promotion.productIds ? JSON.parse(promotion.productIds) as number[] : null;
      
      // Get products to update
      const products = await prisma.product.findMany({
        where: productIds ? { id: { in: productIds } } : {},
      });

      for (const product of products) {
        const originalPrice = Number(product.price);
        let newSalePrice: number;

        if (promotion.discountType === "percent") {
          newSalePrice = Math.round(originalPrice * (1 - Number(promotion.discountValue) / 100));
        } else {
          newSalePrice = Math.max(0, originalPrice - Number(promotion.discountValue));
        }

        // Only update if new sale price is lower than current
        const currentSalePrice = product.salePrice ? Number(product.salePrice) : originalPrice;
        if (newSalePrice < currentSalePrice) {
          await prisma.product.update({
            where: { id: product.id },
            data: { salePrice: newSalePrice },
          });
          updatedCount++;
        }
      }
    }

    return NextResponse.json({ 
      message: `Applied ${activePromotions.length} promotion(s)`, 
      updated: updatedCount 
    });
  } catch (error) {
    console.error("Error applying promotions:", error);
    return NextResponse.json({ error: "Failed to apply promotions" }, { status: 500 });
  }
}
