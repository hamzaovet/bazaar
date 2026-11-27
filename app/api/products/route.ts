import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Map category names or slugs to smart prefixes
function getCategoryPrefix(catNameOrSlug = ""): string {
  const norm = catNameOrSlug.toLowerCase();
  if (norm.includes("بنطلون") || norm.includes("pants") || norm.includes("jeans") || norm.includes("جينز") || norm.includes("كارجو") || norm.includes("جبردين")) {
    return "PNT";
  }
  if (norm.includes("جاكيت") || norm.includes("jacket") || norm.includes("بليزر") || norm.includes("blazer")) {
    return "JKT";
  }
  if (norm.includes("هودي") || norm.includes("hoodie") || norm.includes("سويت شيرت") || norm.includes("sweat")) {
    return "HOD";
  }
  if (norm.includes("اندر") || norm.includes("under")) {
    return "UND";
  }
  if (norm.includes("بوكليت") || norm.includes("pullover") || norm.includes("بلوفر")) {
    return "BOK";
  }
  if (norm.includes("فيست") || norm.includes("vest")) {
    return "VST";
  }
  if (norm.includes("ترينينج") || norm.includes("tracksuit") || norm.includes("ترنج")) {
    return "TRN";
  }
  if (norm.includes("شوز") || norm.includes("shoe") || norm.includes("سنيكرز") || norm.includes("حذاء")) {
    return "SHZ";
  }
  if (norm.includes("تيشرت") || norm.includes("tee") || norm.includes("t-shirt")) {
    return "TEE";
  }
  if (norm.includes("قميص") || norm.includes("shirt")) {
    return "SHR";
  }
  return "BAZ";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const barcode = searchParams.get("barcode") || searchParams.get("code");
    const isFeatured = searchParams.get("featured");
    const action = searchParams.get("action");

    // 1. Smart Code Generator Endpoint: /api/products?action=next-code&categoryId=...
    if (action === "next-code") {
      let prefix = "BAZ";
      let baseNumber = 100;

      if (categoryId) {
        const cat = await prisma.category.findUnique({ where: { id: categoryId } });
        if (cat) {
          prefix = getCategoryPrefix(cat.nameAr + " " + cat.slug);
        }
      }

      // Count existing products with this prefix to get sequential number
      const count = await prisma.product.count({
        where: {
          sku: {
            startsWith: prefix,
          },
        },
      });

      const nextNum = baseNumber + count + 1;
      const nextCode = `${prefix}-${nextNum}`;

      return NextResponse.json({
        prefix,
        nextCode,
        numericCode: String(nextNum),
      });
    }

    // 2. Quick Barcode / Item Code / Scanner lookup (Exact match for POS)
    if (barcode) {
      const trimmedCode = barcode.trim();

      // A. Try exact match on variant barcode
      let variant = await prisma.productVariant.findUnique({
        where: { barcode: trimmedCode },
        include: {
          product: { include: { category: true } },
          branchStocks: { include: { branch: true } },
        },
      });

      // B. Try match on variant SKU or product SKU (Item Code)
      if (!variant) {
        variant = await prisma.productVariant.findFirst({
          where: {
            OR: [
              { sku: { equals: trimmedCode, mode: "insensitive" } },
              { product: { sku: { equals: trimmedCode, mode: "insensitive" } } },
            ],
          },
          include: {
            product: { include: { category: true } },
            branchStocks: { include: { branch: true } },
          },
        });
      }

      // C. Try match on product name (if exact name entered)
      if (!variant) {
        variant = await prisma.productVariant.findFirst({
          where: {
            product: {
              nameAr: { equals: trimmedCode, mode: "insensitive" },
            },
          },
          include: {
            product: { include: { category: true } },
            branchStocks: { include: { branch: true } },
          },
        });
      }

      if (!variant) {
        return NextResponse.json({ error: "لم يتم العثور على أي قطعة بهذا الباركود أو الكود" }, { status: 404 });
      }

      return NextResponse.json({ variant });
    }

    const where: Record<string, unknown> = { isActive: true };

    if (categorySlug && categorySlug !== "all") {
      where.category = { slug: categorySlug };
    }

    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    if (isFeatured === "true") {
      where.isFeatured = true;
    }

    if (search) {
      const cleanSearch = search.trim();
      where.OR = [
        { nameAr: { contains: cleanSearch, mode: "insensitive" } },
        { sku: { contains: cleanSearch, mode: "insensitive" } },
        { description: { contains: cleanSearch, mode: "insensitive" } },
        { category: { nameAr: { contains: cleanSearch, mode: "insensitive" } } },
        {
          variants: {
            some: {
              OR: [
                { barcode: { contains: cleanSearch } },
                { sku: { contains: cleanSearch, mode: "insensitive" } },
                { color: { contains: cleanSearch, mode: "insensitive" } },
                { size: { contains: cleanSearch, mode: "insensitive" } },
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

    // Generate smart SKU if not explicitly provided
    let finalSku = sku?.trim();
    if (!finalSku) {
      let prefix = "BAZ";
      if (categoryId) {
        const cat = await prisma.category.findUnique({ where: { id: categoryId } });
        if (cat) prefix = getCategoryPrefix(cat.nameAr + " " + cat.slug);
      }
      const count = await prisma.product.count({ where: { sku: { startsWith: prefix } } });
      finalSku = `${prefix}-${100 + count + 1}`;
    }

    const newProduct = await prisma.product.create({
      data: {
        nameAr,
        sku: finalSku,
        categoryId: categoryId || null,
        basePrice: parseFloat(basePrice) || 0,
        costPrice: parseFloat(costPrice) || 0,
        material,
        featuredImage: featuredImage || null,
      },
    });

    if (Array.isArray(variants) && variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const variantBarcode = v.barcode?.trim() || `${finalSku}-${v.size || "FREE"}-${i + 1}`;

        const variant = await prisma.productVariant.create({
          data: {
            productId: newProduct.id,
            size: v.size || "FREE",
            color: v.color || "أسود",
            colorHex: v.colorHex || "#111111",
            image: v.image || featuredImage || null,
            barcode: variantBarcode,
            sku: `${finalSku}-${v.size || "F"}`,
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
    } else {
      // Create a default single variant so the product is immediately sellable in POS
      await prisma.productVariant.create({
        data: {
          productId: newProduct.id,
          size: "FREE",
          color: "افتراضي",
          colorHex: "#111111",
          image: featuredImage || null,
          barcode: finalSku,
          sku: finalSku,
          priceOverride: newProduct.basePrice,
          costPriceOverride: newProduct.costPrice,
          stockCentral: 50,
        },
      });
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

    // 2. Full product update
    const { id, nameAr, sku, basePrice, costPrice, material, featuredImage, categoryId } = body;
    const updated = await prisma.product.update({
      where: { id },
      data: {
        nameAr: nameAr || undefined,
        sku: sku !== undefined ? sku.trim() : undefined,
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
