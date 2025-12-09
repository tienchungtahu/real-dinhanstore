import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, secretKey } = body;

    const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || "dinhanstore-setup-2024";
    
    if (secretKey !== SETUP_SECRET) {
      return NextResponse.json({ error: "Invalid secret key" }, { status: 403 });
    }

    let user;

    if (email) {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: `User with email ${email} not found` }, { status: 404 });
      }
    } else {
      user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
      if (!user) {
        return NextResponse.json({ error: "No users found in database" }, { status: 404 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    });

    return NextResponse.json({
      success: true,
      message: `User ${updated.email} is now admin`,
      user: {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error("Error setting up admin:", error);
    return NextResponse.json({ error: "Failed to setup admin" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get("secretKey");

    const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || "dinhanstore-setup-2024";
    
    if (secretKey !== SETUP_SECRET) {
      return NextResponse.json({ error: "Invalid secret key" }, { status: 403 });
    }

    const [admins, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: { role: "admin" },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      admins,
      message: admins.length === 0 
        ? "No admins found. Use POST to set up an admin." 
        : `Found ${admins.length} admin(s)`,
    });
  } catch (error) {
    console.error("Error checking admins:", error);
    return NextResponse.json({ error: "Failed to check admins" }, { status: 500 });
  }
}
