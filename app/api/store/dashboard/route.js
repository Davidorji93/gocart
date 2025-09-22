import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import authSeller from "@/middlewares/authSeller";
import prisma from "@/lib/prisma";

// Get dashboard data for seller (total orders, total earnings, total products)
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    //  Get all orders for seller
    const orders = await prisma.order.findMany({ where: { storeId } });

    // Get all poducts with rattigs or seller
    const products = await prisma.product.findMany({ where: { storeId } });

    const ratings = await prisma.rating.findMany({
      where: { productId: { in: products.map((product) => product.id) } },
      include: { user: true, product: true },
    });

    const dashboardData = {
      ratings,
      totalOrders: orders.length,
      totalEarnings: Math.round(
        orders.reduce((acc, order) => acc + order.total, 0)
      ),
      totalProducts: products.length,
    };
    return NextResponse.json(
      {dashboardData },
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
 