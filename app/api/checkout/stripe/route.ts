import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import prisma from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const VND_TO_USD_RATE = 24500;

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `ORD${year}${month}${day}${random}`;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  salePrice?: number;
  quantity: number;
  image?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, total, discount, discountCode, pointsUsed = 0, addressId, currency = "vnd", locale = "vi" } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const isValidUrl = (url: string): boolean => {
      try {
        new URL(url);
        return url.startsWith("http://") || url.startsWith("https://");
      } catch {
        return false;
      }
    };

    const useCurrency = currency === "usd" || locale === "en" ? "usd" : "vnd";
    
    const lineItems = items.map((item: CartItem) => {
      const productData: { name: string; description?: string; images?: string[] } = {
        name: item.name,
        description: `Dinhan Store - Badminton Equipment`,
      };

      if (item.image && isValidUrl(item.image)) {
        productData.images = [item.image];
      }

      let unitAmount = Math.round(item.salePrice || item.price);
      if (useCurrency === "usd") {
        unitAmount = Math.round((unitAmount / VND_TO_USD_RATE) * 100);
      }

      return {
        price_data: {
          currency: useCurrency,
          product_data: productData,
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    
    let shippingAddress = "";
    let customerName = (user?.firstName || "") + " " + (user?.lastName || "") || "Khách hàng";
    let customerPhone = user?.phone || "";
    const customerEmail = user?.email || "";
    
    if (addressId) {
      const address = await prisma.address.findUnique({ where: { id: addressId } });
      if (address) {
        customerName = address.fullName;
        customerPhone = address.phone;
        shippingAddress = `${address.addressDetail}, ${address.ward || ""}, ${address.district || ""}, ${address.province || ""}`;
      }
    }


    // Calculate totals and create order items
    let subtotal = 0;
    const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (product) {
        const price = Number(item.salePrice || item.price || product.salePrice || product.price);
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        orderItemsData.push({
          productId: product.id,
          productName: item.name || product.name,
          price,
          quantity: item.quantity,
          total: itemTotal,
        });
      }
    }

    const discountAmount = discount ? (subtotal * discount) / 100 : 0;
    const pointsDiscount = pointsUsed || 0;
    const finalTotal = total || Math.max(0, subtotal - discountAmount - pointsDiscount);

    // Validate points if used
    if (pointsUsed > 0 && user) {
      const currentPoints = Number(user.points) || 0;
      if (pointsUsed > currentPoints) {
        return NextResponse.json({ error: "Không đủ điểm thưởng" }, { status: 400 });
      }
    }

    const noteItems: string[] = [];
    if (discountCode) noteItems.push(`Mã giảm giá: ${discountCode}`);
    if (pointsUsed > 0) noteItems.push(`Điểm đã dùng: ${pointsUsed}`);

    // Create order with pending payment status
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        subtotal,
        shippingFee: 0,
        discount: discountAmount + pointsDiscount,
        total: finalTotal,
        paymentMethod: "stripe",
        paymentStatus: "pending",
        status: "pending",
        note: noteItems.join(" | "),
        userId: clerkId,
        items: { create: orderItemsData },
      },
    });

    // Get base URL - use request origin or hardcoded production URL
    const requestUrl = request.headers.get("origin") || request.headers.get("referer");
    let baseUrl = "https://nguyendinhan.id.vn"; // Production URL
    
    if (requestUrl) {
      try {
        const url = new URL(requestUrl);
        baseUrl = url.origin;
      } catch {
        // Keep default
      }
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!baseUrl.startsWith("http")) {
        baseUrl = `https://${baseUrl}`;
      }
    }

    console.log("Using baseUrl for Stripe:", baseUrl);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${baseUrl}/checkout/cancel?order_id=${order.id}`,
      payment_intent_data: {
        description: "Dinhan Store - Badminton Equipment Purchase",
        metadata: { store: "Dinhan Store", clerkId, orderId: order.id.toString() },
      },
      custom_text: {
        submit: { message: "Cảm ơn bạn đã mua hàng tại Dinhan Store! / Thank you for shopping at Dinhan Store!" },
      },
      locale: locale === "en" ? "en" : "vi",
      metadata: {
        clerkId,
        orderId: order.id.toString(),
        addressId: addressId?.toString() || "",
        discount: discount?.toString() || "0",
        discountCode: discountCode || "",
        pointsUsed: pointsUsed?.toString() || "0",
        currency: useCurrency,
      },
      ...(discount > 0 && { discounts: [{ coupon: await getOrCreateCoupon(discount) }] }),
    });

    // Update order with stripe session id
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

async function getOrCreateCoupon(discountPercent: number): Promise<string> {
  const couponId = `DISCOUNT_${discountPercent}`;
  
  try {
    await stripe.coupons.retrieve(couponId);
    return couponId;
  } catch {
    await stripe.coupons.create({
      id: couponId,
      percent_off: discountPercent,
      duration: "once",
    });
    return couponId;
  }
}
