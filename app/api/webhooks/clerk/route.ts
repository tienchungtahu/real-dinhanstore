import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env.local");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = evt.type;

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url, phone_numbers } = evt.data;

      const primaryEmail = email_addresses?.find((e) => e.id === evt.data.primary_email_address_id);
      const primaryPhone = phone_numbers?.find((p) => p.id === evt.data.primary_phone_number_id);

      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          firstName: first_name || "",
          lastName: last_name || "",
          email: primaryEmail?.email_address || "",
          phone: primaryPhone?.phone_number || "",
          avatar: image_url || "",
        },
        create: {
          clerkId: id,
          firstName: first_name || "",
          lastName: last_name || "",
          email: primaryEmail?.email_address || "",
          phone: primaryPhone?.phone_number || "",
          avatar: image_url || "",
          role: "customer",
          isActive: true,
        },
      });

      console.log(`User ${eventType === "user.created" ? "created" : "updated"}:`, primaryEmail?.email_address);
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;
      
      await prisma.user.update({
        where: { clerkId: id },
        data: { isActive: false },
      });
      console.log("User deactivated:", id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
