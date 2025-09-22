import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authSeller from "@/middlewares/authSeller";

// toggle stock of a product
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const productId = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Missing details: productId" },
        { status: 400 }
      );
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json(
        { error: "You are not Authorized" },
        { status: 401 }
      );
    }

    // check if product exists
    const product = await prisma.product.findFirst({
      where: { id: productId, storeId: storeId },
    });

    if (!product) {
      return NextResponse.json({ error: "No product found" }, { status: 404 });
    }

    await prisma.product.update({
      where: { id: productId },
      data: { inStock: !product.inStock },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product stock updated successfully" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 500 }
    );
  }
}
