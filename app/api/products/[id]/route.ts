import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      images: product.images ? product.images.split(",") : [],
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// UPDATE product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }


    // Update slug if name changed
    let slug = body.slug;
    if (body.name && body.name !== existing.name && !slug) {
      slug = body.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const { categoryId, images, ...updateData } = body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        ...(slug && { slug }),
        ...(images && { images: Array.isArray(images) ? images.join(",") : images }),
        ...(categoryId !== undefined && { categoryId: categoryId ? parseInt(categoryId) : null }),
      },
      include: { category: true },
    });

    return NextResponse.json({
      ...product,
      images: product.images ? product.images.split(",") : [],
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete related cart items first
    await prisma.cartItem.deleteMany({ where: { productId } });

    // Set productId to NULL for order_items (keep order history with productSnapshot)
    await prisma.orderItem.updateMany({
      where: { productId },
      data: { productId: null },
    });

    // Now delete the product
    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
