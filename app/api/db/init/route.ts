import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST() {
  try {
    // Test connection and run migrations
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      success: true,
      message: "Database connection successful! Use Prisma migrate to set up tables.",
      nextStep: "Run 'npx prisma db push' to sync schema, then POST /api/db/seed to add sample data",
    });
  } catch (error: unknown) {
    console.error("Init error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to connect to database",
        message: errorMessage,
        hint: "Check your DATABASE_URL in .env.local",
      },
      { status: 500 }
    );
  }
}
