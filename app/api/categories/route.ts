import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ error: "فشل تحميل الأقسام" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nameAr, nameEn, slug, icon, sortOrder } = body;

    if (!nameAr) {
      return NextResponse.json({ error: "اسم القسم بالعربي مطلوب" }, { status: 400 });
    }

    const generatedSlug =
      slug ||
      nameAr
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/(^-|-$)/g, "") ||
      `cat-${Date.now().toString().slice(-6)}`;

    const newCategory = await prisma.category.create({
      data: {
        nameAr,
        nameEn: nameEn || null,
        slug: generatedSlug,
        icon: icon || "Layers",
        sortOrder: sortOrder ? parseInt(String(sortOrder), 10) : 0,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error) {
    console.error("Category POST error:", error);
    return NextResponse.json({ error: "فشل إضافة القسم الجديد" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nameAr, nameEn, slug, icon, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف القسم مطلوب" }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(nameAr && { nameAr }),
        ...(nameEn !== undefined && { nameEn }),
        ...(slug && { slug }),
        ...(icon && { icon }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(String(sortOrder), 10) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error("Category PUT error:", error);
    return NextResponse.json({ error: "فشل تحديث بيانات القسم" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف القسم مطلوب" }, { status: 400 });
    }

    // Soft delete
    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return NextResponse.json({ error: "فشل حذف القسم" }, { status: 500 });
  }
}
