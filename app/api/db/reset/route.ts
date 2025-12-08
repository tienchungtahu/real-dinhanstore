import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { Product } from "@/lib/db/entities/Product";
import { Category } from "@/lib/db/entities/Category";

export async function POST() {
  try {
    const dataSource = await getDataSource();
    const productRepo = dataSource.getRepository(Product);
    const categoryRepo = dataSource.getRepository(Category);

    // Delete all products first (due to foreign key)
    await productRepo.createQueryBuilder().delete().execute();
    
    // Delete all categories
    await categoryRepo.createQueryBuilder().delete().execute();

    return NextResponse.json({
      success: true,
      message: "Database reset successfully! Now run seed to add new data.",
    });
  } catch (error: unknown) {
    console.error("Reset error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      error: "Failed to reset database",
      message: errorMessage,
    }, { status: 500 });
  }
}
