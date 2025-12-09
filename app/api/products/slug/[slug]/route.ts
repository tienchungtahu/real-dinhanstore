import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findFirst({
      where: { slug, isActive: true },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get related products from same category
    let relatedProducts: typeof product[] = [];
    if (product.categoryId) {
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          isActive: true,
        },
        include: { category: true },
        take: 4,
      });
    }

    // Convert images from string to array
    const productWithImages = {
      ...product,
      images: product.images ? product.images.split(",") : [],
    };

    const relatedWithImages = relatedProducts.map((p) => ({
      ...p,
      images: p.images ? p.images.split(",") : [],
    }));

    return NextResponse.json({
      product: productWithImages,
      relatedProducts: relatedWithImages,
    });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
