import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const barcode = searchParams.get("barcode");
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
          orderBy: { size: "asc" },
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
      featuredImage,
      variants, // array of { size, color, colorHex, image, barcode, centralStock, branchStocks }
    } = body;

    const newProduct = await prisma.product.create({
      data: {
        nameAr,
        sku: sku || `BAZ-${Date.now().toString().slice(-6)}`,
        categoryId: categoryId || null,
        basePrice: parseFloat(basePrice) || 0,
        costPrice: parseFloat(costPrice) || 0,
        material,
        featuredImage: featuredImage || null,
      },
    });

    if (Array.isArray(variants)) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const variant = await prisma.productVariant.create({
          data: {
            productId: newProduct.id,
            size: v.size || "FREE",
            color: v.color || "أسود",
            colorHex: v.colorHex || "#111111",
            image: v.image || featuredImage || null,
            barcode: v.barcode || `200${Date.now().toString().slice(-8)}${i}`,
            priceOverride: v.price ? parseFloat(v.price) : newProduct.basePrice,
            costPriceOverride: v.costPrice ? parseFloat(v.costPrice) : newProduct.costPrice,
            stockCentral: parseInt(v.stockCentral || v.central || "0", 10),
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Quick inline stock update for a variant in Central or Branch
    if (action === "UPDATE_STOCK") {
      const { variantId, location, quantity } = body;
      const q = parseInt(quantity, 10) || 0;

      if (location === "CENTRAL_WAREHOUSE") {
        await prisma.productVariant.update({
          where: { id: variantId },
          data: { stockCentral: q },
        });
      } else {
        // location is a branchId
        await prisma.branchStock.upsert({
          where: {
            variantId_branchId: {
              variantId,
              branchId: location,
            },
          },
          update: { quantity: q },
          create: {
            variantId,
            branchId: location,
            quantity: q,
            alertLowQuantity: 2,
          },
        });
      }

      return NextResponse.json({ success: true, message: "تم تحديث الرصيد بنجاح" });
    }

    // 1.5 Update variant image directly
    if (action === "UPDATE_VARIANT_IMAGE") {
      const { variantId, image } = body;
      const updatedVariant = await prisma.productVariant.update({
        where: { id: variantId },
        data: { image },
      });
      return NextResponse.json({ success: true, variant: updatedVariant });
    }

    // 1.6 Update all variants of a product (color, image, sizes)
    if (action === "UPDATE_VARIANTS_BATCH") {
      const { variants } = body;
      if (Array.isArray(variants)) {
        for (const v of variants) {
          if (v.id) {
            await prisma.productVariant.update({
              where: { id: v.id },
              data: {
                color: v.color || undefined,
                colorHex: v.colorHex || undefined,
                image: v.image || undefined,
                size: v.size || undefined,
              },
            });
          }
        }
      }
      return NextResponse.json({ success: true, message: "تم تحديث ألوان وصور الموديل بنجاح" });
    }

    // 1.7 Add new color/size variant to existing product
    if (action === "ADD_VARIANT") {
      const { productId, size, color, colorHex, image, barcode, stockCentral, branchStocks } = body;
      const newVar = await prisma.productVariant.create({
        data: {
          productId,
          size: size || "FREE",
          color: color || "أسود",
          colorHex: colorHex || "#111111",
          image: image || null,
          barcode: barcode || `200${Date.now().toString().slice(-8)}`,
          stockCentral: parseInt(stockCentral, 10) || 0,
        },
      });

      if (branchStocks && typeof branchStocks === "object") {
        for (const [bId, qty] of Object.entries(branchStocks)) {
          await prisma.branchStock.create({
            data: {
              variantId: newVar.id,
              branchId: bId,
              quantity: parseInt(String(qty), 10) || 0,
              alertLowQuantity: 2,
            },
          });
        }
      }

      return NextResponse.json({ success: true, variant: newVar });
    }

    // 2. Full product update
    const { id, nameAr, basePrice, costPrice, material, featuredImage, categoryId } = body;
    const updated = await prisma.product.update({
      where: { id },
      data: {
        nameAr: nameAr || undefined,
        basePrice: basePrice !== undefined ? parseFloat(basePrice) : undefined,
        costPrice: costPrice !== undefined ? parseFloat(costPrice) : undefined,
        material: material || undefined,
        featuredImage: featuredImage || undefined,
        categoryId: categoryId || undefined,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Product PUT error:", error);
    return NextResponse.json({ error: "فشل تحديث بيانات المنتج" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "تم حذف المنتج بنجاح" });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json({ error: "فشل حذف المنتج" }, { status: 500 });
  }
}
