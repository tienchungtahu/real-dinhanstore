import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    // Test connection by running a simple query
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: "connected",
      message: "Database connection successful!",
      database: "TiDB Cloud",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to connect to database";
    return NextResponse.json({
      status: "error",
      message: errorMessage,
      hint: "Check your DATABASE_URL in .env.local",
    }, { status: 500 });
  }
}
