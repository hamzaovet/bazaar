import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const transfers = await prisma.stockTransfer.findMany({
      include: {
        lines: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ transfers });
  } catch (error) {
    console.error("Transfers GET error:", error);
    return NextResponse.json({ error: "فشل استرجاع أذون تحويل البضاعة" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fromLocation, toLocation, notes, lines } = body;
    // lines: [{ variantId, quantity }]

    if (!fromLocation || !toLocation || !lines || !lines.length) {
      return NextResponse.json({ error: "بيانات إذن التحويل غير كاملة" }, { status: 400 });
    }

    const transferNumber = `TRF-${Date.now().toString().slice(-6)}`;

    // Create the transfer record
    const transfer = await prisma.stockTransfer.create({
      data: {
        transferNumber,
        fromLocation,
        toLocation,
        status: "COMPLETED", // Instant completion or can be marked received
        notes,
        lines: {
          create: lines.map((l: any) => ({
            variantId: l.variantId,
            quantity: parseInt(l.quantity, 10) || 1,
          })),
        },
      },
      include: {
        lines: {
          include: {
            variant: { include: { product: true } },
          },
        },
      },
    });

    // Execute Stock Movement:
    for (const line of lines) {
      const q = parseInt(line.quantity, 10) || 1;
      const vId = line.variantId;

      // 1. Decrement from source
      if (fromLocation === "CENTRAL_WAREHOUSE") {
        await prisma.productVariant.update({
          where: { id: vId },
          data: { stockCentral: { decrement: q } },
        });
      } else {
        await prisma.branchStock.updateMany({
          where: { variantId: vId, branchId: fromLocation },
          data: { quantity: { decrement: q } },
        });
      }

      // 2. Increment in destination
      if (toLocation === "CENTRAL_WAREHOUSE") {
        await prisma.productVariant.update({
          where: { id: vId },
          data: { stockCentral: { increment: q } },
        });
      } else {
        const existingBranchStock = await prisma.branchStock.findUnique({
          where: {
            variantId_branchId: {
              variantId: vId,
              branchId: toLocation,
            },
          },
        });

        if (existingBranchStock) {
          await prisma.branchStock.update({
            where: { id: existingBranchStock.id },
            data: { quantity: { increment: q } },
          });
        } else {
          await prisma.branchStock.create({
            data: {
              variantId: vId,
              branchId: toLocation,
              quantity: q,
              alertLowQuantity: 2,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, transfer });
  } catch (error) {
    console.error("Transfers POST error:", error);
    return NextResponse.json({ error: "فشل إنشاء وتنفيذ إذن التحويل" }, { status: 500 });
  }
}
