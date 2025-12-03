import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { Product } from "@/lib/db/entities/Product";

// GET product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const dataSource = await getDataSource();
    const productRepo = dataSource.getRepository(Product);

    const product = await productRepo.findOne({
      where: { slug, isActive: true },
      relations: ["category"],
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get related products from same category
    let relatedProducts: Product[] = [];
    if (product.category) {
      relatedProducts = await productRepo
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.category", "category")
        .where("category.id = :categoryId", { categoryId: product.category.id })
        .andWhere("product.id != :productId", { productId: product.id })
        .andWhere("product.isActive = :isActive", { isActive: true })
        .orderBy("RAND()")
        .take(4)
        .getMany();
    }

    return NextResponse.json({
      product,
      relatedProducts,
    });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
