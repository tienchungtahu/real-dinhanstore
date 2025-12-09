import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

// Generate unique order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD${year}${month}${day}${random}`;
}

// GET all orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const where: Prisma.OrderWhereInput = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}


// CREATE new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      note,
      userId,
      items,
      total: cartTotal,
      discount,
      discountCode,
      paymentStatus,
    } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Order must have at least one item" },
        { status: 400 }
      );
    }

    // Calculate totals and prepare order items
    let subtotal = 0;
    const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const item of items) {
      const productId = item.productId || item.id;
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${productId} not found` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const price = item.salePrice || item.price || Number(product.salePrice) || Number(product.price);
      const itemTotal = Number(price) * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product.id,
        productName: item.name || product.name,
        price,
        quantity: item.quantity,
        total: itemTotal,
        productSnapshot: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          salePrice: product.salePrice ? Number(product.salePrice) : undefined,
          brand: product.brand,
          image: product.images?.split(",")[0],
        },
      });

      // Update stock
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: product.stock - item.quantity },
      });
    }

    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const discountAmount = discount ? (subtotal * discount) / 100 : 0;
    const total = cartTotal || (subtotal - discountAmount + shippingFee);

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName: customerName || "Khách hàng",
        customerEmail: customerEmail || "",
        customerPhone: customerPhone || "",
        shippingAddress: shippingAddress || "",
        subtotal,
        shippingFee,
        discount: discountAmount,
        total,
        paymentMethod: paymentMethod || "cod",
        note: note || (discountCode ? `Mã giảm giá: ${discountCode}` : ""),
        userId,
        status: paymentStatus === "pending" ? "pending" : "processing",
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
