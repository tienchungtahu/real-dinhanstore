import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";

// GET user's cart
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ items: [], discountCode: "", discountPercent: 0 });
    }

    const cart = await prisma.cart.findFirst({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      return NextResponse.json({ items: [], discountCode: "", discountPercent: 0 });
    }

    // Transform cart items to match frontend format
    const items = cart.items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: Number(item.product.price),
      salePrice: item.product.salePrice ? Number(item.product.salePrice) : undefined,
      image: item.product.images?.split(",")[0] || "",
      brand: item.product.brand || "",
      quantity: item.quantity,
      stock: item.product.stock,
    }));

    return NextResponse.json({
      items,
      discountCode: cart.discountCode || "",
      discountPercent: Number(cart.discountPercent) || 0,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}


// POST - Save/Update cart
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, discountCode, discountPercent } = body;

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find or create cart
    let cart = await prisma.cart.findFirst({
      where: { userId: user.id },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id,
          discountCode: discountCode || "",
          discountPercent: discountPercent || 0,
        },
        include: { items: true },
      });
    } else {
      // Remove existing items
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      
      // Update discount info
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          discountCode: discountCode || "",
          discountPercent: discountPercent || 0,
        },
      });
    }

    // Add new items
    if (items && items.length > 0) {
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.id } });
        if (product) {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: item.id,
              quantity: item.quantity,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving cart:", error);
    return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
  }
}

// DELETE - Clear cart
export async function DELETE() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ success: true });
    }

    await prisma.cart.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
