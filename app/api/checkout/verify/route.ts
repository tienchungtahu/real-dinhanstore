import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import prisma from "@/lib/db/prisma";
import { sendOrderConfirmationEmail, OrderEmailData } from "@/lib/email/mailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, orderId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Verify session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // Find order
    const orderIdToFind = orderId || session.metadata?.orderId;
    if (!orderIdToFind) {
      return NextResponse.json({ error: "Order ID not found" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderIdToFind) },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if already processed
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // Update order
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "paid", status: "processing", stripeSessionId: sessionId },
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
        paymentMethod: order.paymentMethod || "stripe",
        note: order.note || undefined,
        createdAt: order.createdAt,
      };

      sendOrderConfirmationEmail(emailData).catch((err) => {
        console.error("Failed to send order confirmation email:", err);
      });
    }

    // Update product stock
    for (const item of order.items) {
      if (item.productId) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product) {
          await prisma.product.update({
            where: { id: product.id },
            data: { stock: Math.max(0, product.stock - item.quantity) },
          });
        }
      }
    }

    // Get points used from session metadata
    const pointsUsed = parseInt(session.metadata?.pointsUsed || "0");

    // Update user points
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (user) {
      const pointsToAdd = Math.round(Number(order.total) * 0.15);
      const currentPoints = Number(user.points || 0);
      const newPoints = Math.max(0, currentPoints - pointsUsed + pointsToAdd);
      
      await prisma.user.update({
        where: { clerkId },
        data: { points: newPoints },
      });

      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        pointsUsed,
        pointsAdded: pointsToAdd,
        totalPoints: newPoints,
      });
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
