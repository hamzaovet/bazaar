import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");

    const purchases = await prisma.purchaseInvoice.findMany({
      where: supplierId ? { supplierId } : undefined,
      include: {
        supplier: true,
        branch: true,
        lines: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Purchases GET error:", error);
    return NextResponse.json({ error: "فشل استرجاع فواتير المشتريات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      supplierId,
      branchId, // optional: null = central warehouse
      type = "PURCHASE", // "PURCHASE" | "RETURN"
      totalAmount,
      paidAmount = 0,
      notes,
      lines, // array of { variantId, quantity, costPrice }
    } = body;

    if (!supplierId) {
      return NextResponse.json({ error: "يرجى تحديد المورد" }, { status: 400 });
    }

    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: "يرجى إضافة بند واحد على الأقل في فاتورة المشتريات" }, { status: 400 });
    }

    const total = parseFloat(totalAmount) || 0;
    const paid = parseFloat(paidAmount) || 0;
    const remaining = Math.max(0, total - paid);
    const invoiceNumber = type === "RETURN" ? `PUR-RET-${Date.now().toString().slice(-8)}` : `PUR-${Date.now().toString().slice(-8)}`;

    const purchaseInvoice = await prisma.purchaseInvoice.create({
      data: {
        invoiceNumber,
        supplierId,
        branchId: branchId || null,
        type,
        totalAmount: total,
        paidAmount: paid,
        remainingDebt: remaining,
        notes: notes || null,
        lines: {
          create: lines.map((l: any) => {
            const q = parseInt(l.quantity, 10) || 1;
            const cost = parseFloat(l.costPrice) || 0;
            return {
              variantId: l.variantId,
              quantity: q,
              costPrice: cost,
              total: q * cost,
            };
          }),
        },
      },
      include: {
        supplier: true,
        lines: {
          include: { variant: { include: { product: true } } },
        },
      },
    });

    // Stock adjustments:
    for (const l of lines) {
      const q = parseInt(l.quantity, 10) || 1;
      const factor = type === "PURCHASE" ? 1 : -1;

      if (!branchId || branchId === "CENTRAL_WAREHOUSE") {
        // Stock goes to Central Warehouse
        await prisma.productVariant.update({
          where: { id: l.variantId },
          data: { stockCentral: { increment: factor * q } },
        });
      } else {
        // Stock goes directly to specified branch
        await prisma.branchStock.upsert({
          where: {
            variantId_branchId: {
              variantId: l.variantId,
              branchId,
            },
          },
          update: { quantity: { increment: factor * q } },
          create: {
            variantId: l.variantId,
            branchId,
            quantity: Math.max(0, factor * q),
            alertLowQuantity: 2,
          },
        });
      }
    }

    // Supplier debt & ledger adjustments:
    if (type === "PURCHASE") {
      // Record purchase transaction
      await prisma.supplierTransaction.create({
        data: {
          supplierId,
          type: "PURCHASE",
          amount: total,
          referenceNumber: invoiceNumber,
          notes: `فاتورة توريد بضاعة رقم ${invoiceNumber}`,
        },
      });

      // If partial or full cash payment was made at invoice creation
      if (paid > 0) {
        await prisma.supplierTransaction.create({
          data: {
            supplierId,
            type: "PAYMENT",
            amount: paid,
            referenceNumber: `PAY-${invoiceNumber}`,
            notes: `سداد نقدي فوري مع الفاتورة ${invoiceNumber}`,
          },
        });
      }

      // Increment supplier total debt by the remaining unpaid amount
      if (remaining > 0) {
        await prisma.supplier.update({
          where: { id: supplierId },
          data: { totalDebt: { increment: remaining } },
        });
      }
    } else {
      // Purchase return: decreases debt owed to supplier
      await prisma.supplierTransaction.create({
        data: {
          supplierId,
          type: "RETURN",
          amount: total,
          referenceNumber: invoiceNumber,
          notes: `مردودات مشتريات للمورد بموجب ${invoiceNumber}`,
        },
      });

      await prisma.supplier.update({
        where: { id: supplierId },
        data: { totalDebt: { decrement: total } },
      });
    }

    return NextResponse.json({ success: true, purchaseInvoice });
  } catch (error) {
    console.error("Purchases POST error:", error);
    return NextResponse.json({ error: "فشل حفظ فاتورة المشتريات" }, { status: 500 });
  }
}
