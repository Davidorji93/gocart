import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Update cart data
export async function POST(request) {
  try {
    const { userId } = await getAuth(request);

    const { cart } = await request.json();

    await prisma.user.update({
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
    const { userId } = await getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cart: true },
    });

    return NextResponse.json(
      { cart: user?.cart || {} },
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
