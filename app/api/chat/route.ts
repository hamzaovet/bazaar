import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const conversationId = searchParams.get("conversationId");

    const where: Record<string, unknown> = {};
    if (branchId) where.branchId = branchId;
    if (conversationId) where.conversationId = conversationId;

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: "فشل تحميل المحادثة" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sender, senderName, customerPhone, customerName, message, branchId, conversationId } = body;

    if (!message || !senderName) {
      return NextResponse.json({ error: "الرسالة واسم المرسل مطلوبان" }, { status: 400 });
    }

    const created = await prisma.chatMessage.create({
      data: {
        conversationId: conversationId || customerPhone || "global",
        customerPhone: customerPhone || "01000000000",
        customerName: customerName || senderName,
        sender: sender || "CUSTOMER",
        senderName,
        message,
        branchId: branchId || null,
      },
    });

    return NextResponse.json({ success: true, message: created });
  } catch (error) {
    console.error("Chat POST error:", error);
    return NextResponse.json({ error: "فشل إرسال الرسالة" }, { status: 500 });
  }
}
