import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Group products by category
    const categoryMap: Record<
      string,
      {
        categoryId: string;
        categoryName: string;
        slug: string;
        totalProducts: number;
        totalVariants: number;
        minCost: number;
        maxCost: number;
        avgCost: number;
        minPrice: number;
        maxPrice: number;
        products: any[];
      }
    > = {};

    for (const p of products) {
      const catId = p.categoryId || "uncategorized";
      const catName = p.category?.nameAr || "أصناف عامة";
      const catSlug = p.category?.slug || "general";

      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          categoryId: catId,
          categoryName: catName,
          slug: catSlug,
          totalProducts: 0,
          totalVariants: 0,
          minCost: Infinity,
          maxCost: -Infinity,
          avgCost: 0,
          minPrice: Infinity,
          maxPrice: -Infinity,
          products: [],
        };
      }

      categoryMap[catId].totalProducts += 1;
      categoryMap[catId].totalVariants += p.variants.length;
      categoryMap[catId].products.push({
        id: p.id,
        nameAr: p.nameAr,
        sku: p.sku,
        costPrice: p.costPrice,
        basePrice: p.basePrice,
        variantsCount: p.variants.length,
      });

      if (p.costPrice < categoryMap[catId].minCost) categoryMap[catId].minCost = p.costPrice;
      if (p.costPrice > categoryMap[catId].maxCost) categoryMap[catId].maxCost = p.costPrice;
      if (p.basePrice < categoryMap[catId].minPrice) categoryMap[catId].minPrice = p.basePrice;
      if (p.basePrice > categoryMap[catId].maxPrice) categoryMap[catId].maxPrice = p.basePrice;
    }

    const categoriesSummary = Object.values(categoryMap).map((cat) => {
      const totalCost = cat.products.reduce((acc, p) => acc + (p.costPrice || 0), 0);
      return {
        ...cat,
        avgCost: cat.totalProducts > 0 ? Math.round(totalCost / cat.totalProducts) : 0,
        minCost: cat.minCost === Infinity ? 0 : cat.minCost,
        maxCost: cat.maxCost === -Infinity ? 0 : cat.maxCost,
        minPrice: cat.minPrice === Infinity ? 0 : cat.minPrice,
        maxPrice: cat.maxPrice === -Infinity ? 0 : cat.maxPrice,
      };
    });

    return NextResponse.json({ categoriesSummary });
  } catch (error) {
    console.error("Pricing Matrix GET error:", error);
    return NextResponse.json({ error: "فشل استرجاع مصفوفة التسعير" }, { status: 500 });
  }
}

// Bulk update selling price for a category or specific products
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, newSellingPrice, minCostThreshold, maxCostThreshold, productIds } = body;

    const price = parseFloat(newSellingPrice);
    if (!price || price <= 0) {
      return NextResponse.json({ error: "يرجى إدخال سعر بيع صحيح أكبر من صفر" }, { status: 400 });
    }

    const where: any = {};
    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }
    if (Array.isArray(productIds) && productIds.length > 0) {
      where.id = { in: productIds };
    }
    if (minCostThreshold !== undefined || maxCostThreshold !== undefined) {
      where.costPrice = {};
      if (minCostThreshold !== undefined) where.costPrice.gte = parseFloat(minCostThreshold);
      if (maxCostThreshold !== undefined) where.costPrice.lte = parseFloat(maxCostThreshold);
    }

    // Update Products basePrice
    const updatedProducts = await prisma.product.updateMany({
      where,
      data: { basePrice: price },
    });

    // Update ProductVariants priceOverride
    const targetProducts = await prisma.product.findMany({
      where,
      select: { id: true },
    });
    const targetProductIds = targetProducts.map((p) => p.id);

    const updatedVariants = await prisma.productVariant.updateMany({
      where: { productId: { in: targetProductIds } },
      data: { priceOverride: price },
    });

    // Create OwnerAlert
    await prisma.ownerAlert.create({
      data: {
        type: "PRICING_UPDATED",
        title: `🏷️ تم تحديث أسعار البيع إلى ${price} ج.م`,
        message: `قام محمد أشرف بتحديث سعر البيع لعدد ${updatedProducts.count} موديل (${updatedVariants.count} باركود/مقاس) دفعة واحدة.`,
        data: JSON.stringify({ categoryId, newPrice: price, updatedCount: updatedProducts.count }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `تم تحديث سعر البيع بنجاح إلى ${price} ج.م لـ ${updatedProducts.count} منتج!`,
      updatedProducts: updatedProducts.count,
      updatedVariants: updatedVariants.count,
    });
  } catch (error) {
    console.error("Pricing Matrix POST error:", error);
    return NextResponse.json({ error: "فشل تحديث أسعار البيع" }, { status: 500 });
  }
}
