import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";
import { sendOrderConfirmationEmail, OrderEmailData } from "@/lib/email/mailer";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "paid", status: "processing" },
    });

    // Send order confirmation email
    if (order.customerEmail) {
      const emailData: OrderEmailData = {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        items: order.items.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.total),
        })),
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        discount: Number(order.discount),
        total: Number(order.total),
        paymentMethod: order.paymentMethod || "vietqr",
        note: order.note || undefined,
        createdAt: order.createdAt,
      };

      sendOrderConfirmationEmail(emailData).catch((err) => {
        console.error("Failed to send order confirmation email:", err);
      });
    }

    // Update user points (15% of total)
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (user) {
      const pointsToAdd = Math.round(Number(order.total) * 0.15);
      const newPoints = Number(user.points || 0) + pointsToAdd;
      
      await prisma.user.update({
        where: { clerkId },
        data: { points: newPoints },
      });

      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        pointsAdded: pointsToAdd,
        totalPoints: newPoints,
      });
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("VietQR verify error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
