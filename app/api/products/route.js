import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

export async function GET(request) {
  try {
    let products = await prisma.product.findMany({
      where: { inStock: true },
      include: {
        rating: {
          select: {
            createdAt: true,
            rating: true,
            review: true,
            user: { select: { name: true, image: true } },
          },
        },
        store: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // filter out inactive stores
    products = products.filter((product) => product.store?.isActive);

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("API error fetching products:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
