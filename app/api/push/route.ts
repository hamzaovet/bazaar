import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWebPushNotification } from "@/lib/push";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, subscription, role, branchId, title, message } = body;

    if (action === "SUBSCRIBE" && subscription?.endpoint) {
      const { endpoint, keys } = subscription;
      const sub = await prisma.pushSubscription.upsert({
        where: { endpoint },
        update: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          userRole: role || "CUSTOMER",
          branchId: branchId || null,
        },
        create: {
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userRole: role || "CUSTOMER",
          branchId: branchId || null,
        },
      });

      return NextResponse.json({ success: true, sub });
    }

    if (action === "BROADCAST") {
      const res = await sendWebPushNotification({
        title: title || "بزار كاجوال وير",
        body: message || "تنبيه جديد من المتجر",
        role,
        branchId,
      });

      return NextResponse.json(res);
    }

    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  } catch (error) {
    console.error("Push API error:", error);
    return NextResponse.json({ error: "فشل تفعيل الإشعارات" }, { status: 500 });
  }
}
