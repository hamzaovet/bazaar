import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const where = unreadOnly ? { isRead: false } : {};

    const [alerts, unreadCount] = await Promise.all([
      prisma.ownerAlert.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.ownerAlert.count({
        where: { isRead: false },
      }),
    ]);

    return NextResponse.json({ alerts, unreadCount });
  } catch (error) {
    console.error("Owner Alerts GET error:", error);
    return NextResponse.json({ error: "فشل استرجاع تنبيهات المالك" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, alertId, type, title, message, data } = body;

    if (action === "MARK_ALL_READ") {
      await prisma.ownerAlert.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "تم تحديد جميع التنبيهات كمقروءة" });
    }

    if (action === "MARK_READ" && alertId) {
      await prisma.ownerAlert.update({
        where: { id: alertId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    // Otherwise create custom alert
    if (!title || !message) {
      return NextResponse.json({ error: "عنوان ونص التنبيه مطلوبان" }, { status: 400 });
    }

    const created = await prisma.ownerAlert.create({
      data: {
        type: type || "INFO",
        title,
        message,
        data: data ? (typeof data === "string" ? data : JSON.stringify(data)) : null,
      },
    });

    return NextResponse.json({ success: true, alert: created });
  } catch (error) {
    console.error("Owner Alerts POST error:", error);
    return NextResponse.json({ error: "فشل معالجة التنبيه" }, { status: 500 });
  }
}
