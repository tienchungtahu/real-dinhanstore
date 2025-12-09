import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/db/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const clerkId = session.metadata?.clerkId;

      if (orderId) {
        const order = await prisma.order.findUnique({
          where: { id: parseInt(orderId) },
          include: { items: true },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "paid",
              status: "processing",
              stripeSessionId: session.id,
            },
          });

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

          // Update user points
          const pointsUsed = parseInt(session.metadata?.pointsUsed || "0");
          if (clerkId) {
            const user = await prisma.user.findUnique({ where: { clerkId } });
            if (user) {
              const pointsToAdd = Math.round(Number(order.total) * 0.15);
              const currentPoints = Number(user.points || 0);
              await prisma.user.update({
                where: { clerkId },
                data: { points: Math.max(0, currentPoints - pointsUsed + pointsToAdd) },
              });
              console.log(`User ${user.email}: -${pointsUsed} used, +${pointsToAdd} earned`);
            }
          }

          console.log(`Order ${order.orderNumber} payment completed`);
        }
      }
    }

    if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });
        if (order && order.paymentStatus === "pending") {
          await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: "failed", status: "cancelled" },
          });
          console.log(`Order ${order.orderNumber} payment failed/expired`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
