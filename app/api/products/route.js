import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    let products = await prisma.product.findMany({
      where: { isStock: true },
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

    // remove products with store isActive false
    products = products.filter((product) => product.store?.isActive);
    return NextResponse(products, { status: 200 });
  } catch (error) {
    return NextResponse.json(
          { error: error.message || "Something went wrong" },
          { status: 500 }
        );  
  }
}
