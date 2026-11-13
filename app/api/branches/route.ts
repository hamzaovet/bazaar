import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        _count: {
          select: {
            branchStocks: true,
            invoices: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ branches });
  } catch (error) {
    console.error("Branches GET error:", error);
    return NextResponse.json({ error: "فشل تحميل قائمة الفروع" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, isDayOffEnabled, weeklyDayOff, dayOffMessage, phone, whatsapp, googleMapsUrl } = body;

    const updated = await prisma.branch.update({
      where: { id },
      data: {
        isDayOffEnabled,
        weeklyDayOff,
        dayOffMessage,
        phone,
        whatsapp,
        googleMapsUrl,
      },
    });

    return NextResponse.json({ success: true, branch: updated });
  } catch (error) {
    console.error("Branch PUT error:", error);
    return NextResponse.json({ error: "فشل تحديث بيانات الفرع" }, { status: 500 });
  }
}
