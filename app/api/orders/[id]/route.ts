import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { sendOrderStatusUpdateEmail } from "@/lib/email/mailer";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

// GET single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// UPDATE order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const oldStatus = existing.status;
    const updateData: { status?: string; note?: string } = {};

    if (body.status) {
      const validStatuses: OrderStatus[] = [
        "pending", "processing", "shipped", "delivered", "cancelled",
      ];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updateData.status = body.status;
    }

    if (body.note !== undefined) {
      updateData.note = body.note;
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Send email notification if status changed
    if (body.status && oldStatus !== body.status && order.customerEmail) {
      sendOrderStatusUpdateEmail({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        oldStatus,
        newStatus: body.status,
        total: Number(order.total),
        updatedAt: new Date(),
      }).catch((err) => {
        console.error("Failed to send status update email:", err);
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE order (soft delete by cancelling)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "Can only cancel pending orders" },
        { status: 400 }
      );
    }

    await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
