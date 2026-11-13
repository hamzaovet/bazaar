import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") || "OPEN";

    const where: Record<string, unknown> = {};
    if (branchId) where.branchId = branchId;
    if (userId) where.openedById = userId;
    if (status !== "ALL") where.status = status;

    const shift = await prisma.shift.findFirst({
      where,
      orderBy: { startTime: "desc" },
      include: {
        openedByUser: true,
        branch: true,
        invoices: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({
      shift: shift
        ? {
            ...shift,
            user: shift.openedByUser,
            startCash: shift.openingCash,
          }
        : null,
    });
  } catch (error) {
    console.error("Shift GET error:", error);
    return NextResponse.json({ error: "فشل استرجاع بيانات الوردية" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, shiftId, branchId, userId, startCash, actualCash, notes } = body;

    if (action === "OPEN") {
      // Check if user already has an open shift
      const existing = await prisma.shift.findFirst({
        where: { openedById: userId, status: "OPEN" },
      });
      if (existing) {
        return NextResponse.json({
          shift: {
            ...existing,
            startCash: existing.openingCash,
          },
          message: "يوجد وردية مفتوحة بالفعل",
        });
      }

      const shiftNumber = `SHF-${Date.now().toString().slice(-6)}`;
      const newShift = await prisma.shift.create({
        data: {
          shiftNumber,
          branchId,
          openedById: userId,
          status: "OPEN",
          openingCash: parseFloat(startCash) || 0,
          expectedCash: parseFloat(startCash) || 0,
        },
        include: { openedByUser: true, branch: true },
      });

      return NextResponse.json({
        success: true,
        shift: {
          ...newShift,
          user: newShift.openedByUser,
          startCash: newShift.openingCash,
        },
      });
    }

    if (action === "CLOSE" && shiftId) {
      const shift = await prisma.shift.findUnique({
        where: { id: shiftId },
      });

      if (!shift) {
        return NextResponse.json({ error: "الوردية غير موجودة" }, { status: 404 });
      }

      const actCash = parseFloat(actualCash) || 0;
      const expected = shift.openingCash + shift.cashSales;
      const difference = actCash - expected;

      const closed = await prisma.shift.update({
        where: { id: shiftId },
        data: {
          status: "CLOSED",
          endTime: new Date(),
          closedById: userId,
          expectedCash: expected,
          actualCash: actCash,
          cashDifference: difference,
          notes: notes || shift.notes,
        },
      });

      return NextResponse.json({
        success: true,
        shift: {
          ...closed,
          startCash: closed.openingCash,
        },
      });
    }

    return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
  } catch (error) {
    console.error("Shift POST error:", error);
    return NextResponse.json({ error: "فشل معالجة الوردية" }, { status: 500 });
  }
}
