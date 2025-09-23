import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authAdmin from "@/middlewares/authAdmin";
import prisma from "@/lib/prisma";

// Add new coupon
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { coupon } = await request.json();
    coupon.code = coupon.code.toUpperCase();

    await prisma.coupon.create({ data: coupon }).then(async (coupon) => {
      // Trigger inngest function to delete coupon on expiry
      await inngest.send({
        name: "delete-coupon-on-expiry",
        data: {
          code: coupon.code,
          expires_at: coupon.expiresAt,
        },
      });
    });

    return NextResponse.json(
      { message: "Coupon created successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error?.code || error?.message || "Server error" },
      { status: 500 }
    );
  }
}

// Delete coupon /api/admin/coupon?id = couponId
export async function DELETE(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");

    await prisma.coupon.delete({
      where: { code },
    });

    return NextResponse.json(
      { message: "Coupon deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error?.code || error?.message || "Server error" },
      { status: 500 }
    );
  }
}

// Get all coupons
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({});

    return NextResponse.json({ coupons }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error?.code || error?.message || "Server error" },
      { status: 500 }
    );
  }
}
