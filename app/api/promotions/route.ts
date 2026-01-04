import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// UTC+7 offset
const VN_OFFSET = 7 * 60 * 60 * 1000;

function getNowVN(): Date {
  return new Date(Date.now() + VN_OFFSET);
}

// GET - List all promotions
export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { startDate: "desc" },
    });

    const now = getNowVN();
    const promotionsWithStatus = promotions.map((p) => ({
      ...p,
      discountValue: Number(p.discountValue),
      productIds: p.productIds ? JSON.parse(p.productIds) : null,
      status: now < p.startDate ? "scheduled" : now > p.endDate ? "ended" : "active",
    }));

    return NextResponse.json(promotionsWithStatus);
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
  }
}

// POST - Create new promotion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, discountType, discountValue, startDate, endDate, productIds, isActive } = body;

    if (!name || !discountValue || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        name,
        description,
        discountType: discountType || "percent",
        discountValue,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive ?? true,
        productIds: productIds ? JSON.stringify(productIds) : null,
      },
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("Error creating promotion:", error);
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 });
  }
}
