import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const seasons = await prisma.season.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ seasons });
  } catch (error) {
    console.error("Seasons GET error:", error);
    return NextResponse.json({ error: "فشل استرجاع بيانات المواسم" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, startDate, endDate, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "اسم الموسم حقل إلزامي" }, { status: 400 });
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

    const season = await prisma.season.create({
      data: {
        name: name.trim(),
        slug,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        notes: notes || null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, season });
  } catch (error: any) {
    console.error("Season POST error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "هذا الموسم مسجل مسبقاً" }, { status: 400 });
    }
    return NextResponse.json({ error: "فشل إضافة الموسم الجديد" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, startDate, endDate, isActive, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف الموسم مطلوب" }, { status: 400 });
    }

    const updated = await prisma.season.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive: typeof isActive === "boolean" ? isActive : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json({ success: true, season: updated });
  } catch (error) {
    console.error("Season PUT error:", error);
    return NextResponse.json({ error: "فشل تحديث بيانات الموسم" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف الموسم مطلوب" }, { status: 400 });
    }

    await prisma.season.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "تم حذف الموسم بنجاح" });
  } catch (error) {
    console.error("Season DELETE error:", error);
    return NextResponse.json({ error: "فشل حذف الموسم" }, { status: 500 });
  }
}
