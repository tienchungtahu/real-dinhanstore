import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET - Get products with sales statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "low"; // low = ít bán nhất, high = bán chạy nhất
    const limit = parseInt(searchParams.get("limit") || "50");

    // Get all products with their order counts
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
    });

    // Get sales data from order items
    const salesData = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      _count: { id: true },
      where: {
        order: { status: { not: "cancelled" } },
      },
    });

    // Create a map of productId -> sales info
    const salesMap = new Map<number, { totalSold: number; orderCount: number }>();
    salesData.forEach((item) => {
      if (item.productId) {
        salesMap.set(item.productId, {
          totalSold: item._sum.quantity || 0,
          orderCount: item._count.id,
        });
      }
    });

    // Helper to parse images safely
    const parseImages = (images: string | null): string[] => {
      if (!images) return [];
      // If it's already a path (starts with / or http), wrap in array
      if (images.startsWith("/") || images.startsWith("http")) {
        return [images];
      }
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // If parse fails, treat as single image path
        return images ? [images] : [];
      }
    };

    // Combine products with sales data
    const productsWithSales = products.map((product) => {
      const sales = salesMap.get(product.id) || { totalSold: 0, orderCount: 0 };
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        stock: product.stock,
        images: parseImages(product.images),
        category: product.category?.name || null,
        categoryId: product.categoryId,
        totalSold: sales.totalSold,
        orderCount: sales.orderCount,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      };
    });

    // Sort by sales
    productsWithSales.sort((a, b) => {
      if (sort === "low") {
        return a.totalSold - b.totalSold; // Ít bán nhất trước
      }
      return b.totalSold - a.totalSold; // Bán chạy nhất trước
    });

    return NextResponse.json(productsWithSales.slice(0, limit));
  } catch (error) {
    console.error("Error fetching products with sales:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
