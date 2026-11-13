import * as webpush from "web-push";
import { prisma } from "./prisma";

export async function sendWebPushNotification(payload: {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  role?: string;
  branchId?: string | null;
}) {
  try {
    const vapidPublicKey =
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      "BOx0aWJzaMSfTndfZhUujbJemh6JzQswf6UV144PETCxWlFGqeLB1QD0KgT7mKrtXBCMkjlQfSfbfJQxlO2UF3o";
    const vapidPrivateKey =
      process.env.VAPID_PRIVATE_KEY || "jy8_woqGDnRtYDGe0kdeN3-XPvzoohBY-Bi07_NvMjs";
    const vapidSubject =
      process.env.VAPID_SUBJECT || "mailto:bazaar.casual.wear@gmail.com";

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    }

    const whereClause: Record<string, unknown> = {};
    if (payload.role) whereClause.userRole = payload.role;
    if (payload.branchId) whereClause.branchId = payload.branchId;

    const subscriptions = await prisma.pushSubscription.findMany({
      where: whereClause,
    });

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: payload.badge || "/icons/badge-72x72.png",
      data: {
        url: payload.url || "/",
        timestamp: Date.now(),
      },
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          notificationPayload
        );
      } catch (err: unknown) {
        const error = err as { statusCode?: number };
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Expired subscription, remove it
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    });

    await Promise.all(sendPromises);
    return { success: true, count: subscriptions.length };
  } catch (err) {
    console.error("WebPush broadcast error:", err);
    return { success: false, error: String(err) };
  }
}
