import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const barcode = searchParams.get("barcode");
    const branchId = searchParams.get("branchId");
    const isFeatured = searchParams.get("featured");

    // Quick Barcode / Scanner lookup (Exact match for POS)
    if (barcode) {
      const variant = await prisma.productVariant.findUnique({
        where: { barcode },
        include: {
          product: {
            include: { category: true },
          },
          branchStocks: {
            include: { branch: true },
          },
        },
      });

      if (!variant) {
        return NextResponse.json({ error: "لم يتم العثور على أي قطعة بهذا الباركود" }, { status: 404 });
      }

      return NextResponse.json({ variant });
    }

    const where: Record<string, unknown> = { isActive: true };

    if (categorySlug && categorySlug !== "all") {
      where.category = { slug: categorySlug };
    }

    if (isFeatured === "true") {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          variants: {
            some: {
              OR: [
                { barcode: { contains: search } },
                { color: { contains: search, mode: "insensitive" } },
                { size: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: {
          include: {
            branchStocks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "فشل تحميل المنتجات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nameAr,
      sku,
      categoryId,
      basePrice,
      costPrice,
      material,
      variants, // array of { size, color, colorHex, barcode, centralStock, branchStock1, branchStock2 }
    } = body;

    const newProduct = await prisma.product.create({
      data: {
        nameAr,
        sku,
        categoryId: categoryId || null,
        basePrice: parseFloat(basePrice) || 0,
        costPrice: parseFloat(costPrice) || 0,
        material,
      },
    });

    if (Array.isArray(variants)) {
      for (const v of variants) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: newProduct.id,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex || "#111111",
            barcode: v.barcode || `200${Date.now().toString().slice(-8)}`,
            priceOverride: v.price ? parseFloat(v.price) : newProduct.basePrice,
            costPriceOverride: v.costPrice ? parseFloat(v.costPrice) : newProduct.costPrice,
            stockCentral: parseInt(v.stockCentral || v.centralStock || "0", 10),
          },
        });

        if (v.branchStocks && typeof v.branchStocks === "object") {
          for (const [bId, qty] of Object.entries(v.branchStocks)) {
            await prisma.branchStock.create({
              data: {
                variantId: variant.id,
                branchId: bId,
                quantity: parseInt(String(qty), 10) || 0,
                alertLowQuantity: 2,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Product POST error:", error);
    return NextResponse.json({ error: "فشل حفظ المنتج الجديد" }, { status: 500 });
  }
}
