import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

const placeholderImages = [
  "https://placehold.co/400x400/10b981/white?text=Badminton+1",
  "https://placehold.co/400x400/059669/white?text=Badminton+2",
  "https://placehold.co/400x400/047857/white?text=Badminton+3",
  "https://placehold.co/400x400/065f46/white?text=Badminton+4",
];

export async function POST() {
  try {
    const products = await prisma.product.findMany();
    let updated = 0;

    for (const product of products) {
      if (!product.images) {
        const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
        await prisma.product.update({
          where: { id: product.id },
          data: { images: randomImage },
        });
        updated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added placeholder images to ${updated} products`,
      updated,
    });
  } catch (error: unknown) {
    console.error("Error adding placeholder images:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to add placeholder images", message: errorMessage },
      { status: 500 }
    );
  }
}
