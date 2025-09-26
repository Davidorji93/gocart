import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// update cart data
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { cart } = await request.json();

    await prisma.cart.user.update({
      where: { id: userId },
      data: { cart: cart },
    });

    return NextResponse.json(
      { message: "Cart updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 500 }
    );
  }
}

// Get user cart
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const user = await prisma.cart.user.findUnique({
      where: { id: userId },
    });

    return NextResponse.json(
      {  cart: user.cart },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 500 }
    );
  }
}