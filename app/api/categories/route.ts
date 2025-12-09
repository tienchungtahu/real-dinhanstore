import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    
    // Convert subcategories from string to array
    const categoriesWithSubcategories = categories.map((c) => ({
      ...c,
      subcategories: c.subcategories ? c.subcategories.split(",") : [],
    }));
    
    return NextResponse.json(categoriesWithSubcategories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subcategories, ...categoryData } = body;
    
    const category = await prisma.category.create({
      data: {
        ...categoryData,
        subcategories: Array.isArray(subcategories) ? subcategories.join(",") : subcategories,
      },
    });
    
    return NextResponse.json(
      { ...category, subcategories: category.subcategories ? category.subcategories.split(",") : [] },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
