import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get store info and store products
export async function GET(request) {
  try {
    // Get store username from query params
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Missing details: username" },
        { status: 400 }
      );
    }

    // get store info and instock products with ratings
    const store = await prisma.store.findFirst({
      where: {
        username,
        isActive: true,
      },
      include: {
        products: {
          where: { inStock: true },
          include: { ratings: true },
        },
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(store, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 500 }
    );   
  }
}
