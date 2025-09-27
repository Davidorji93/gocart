import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Update seller order status 
export async function POST(request) {
  try {
    const { userId } = getAuth(request);   
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ message: " you are Unauthorized" }, { status: 401 });
    }

    const { orderId, status } = await request.json();

    const updatedOrder = await prisma.order.update({
      where: { id: orderId, storeId },
      data: { status },
    });

    return NextResponse.json(
      { message: "Order status updated successfully", order: updatedOrder },
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

// Get all orders for a seller
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json(
        { error: "You are not Authorized" },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { storeId },
      include: {
        user: true,      
        address: true,   
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error(error);
     return NextResponse.json(
      { error: error.code || error.message },
      { status: 500 }
    );
  }
}
