import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ products: [] });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ products: [] });
    }

    // Get user's orders with items
    const orders = await prisma.order.findMany({
      where: { userId: user.id.toString() },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    // Extract unique product IDs from orders
    const productIds = new Set<number>();
    const productPurchaseCount: Record<number, number> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.productId) {
          productIds.add(item.productId);
          productPurchaseCount[item.productId] = (productPurchaseCount[item.productId] || 0) + item.quantity;
        }
      });
    });

    if (productIds.size === 0) {
      return NextResponse.json({ products: [] });
    }

    // Fetch products that still exist
    const products = await prisma.product.findMany({
      where: {
        id: { in: Array.from(productIds) },
        isActive: true,
      },
      include: { category: true },
    });

    // Sort by purchase count (most purchased first)
    const sortedProducts = products
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
        images: p.images ? p.images.split(",") : [],
        brand: p.brand,
        category: p.category,
        purchaseCount: productPurchaseCount[p.id] || 0,
      }))
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 10);

    return NextResponse.json({ products: sortedProducts });
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    return NextResponse.json({ products: [] });
  }
}
