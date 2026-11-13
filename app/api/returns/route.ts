import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lookupInvoice = searchParams.get("lookupInvoice");

    // Lookup original invoice by invoice number or phone for returns/exchanges
    if (lookupInvoice) {
      const q = lookupInvoice.trim();
      const invoice = await prisma.invoice.findFirst({
        where: {
          OR: [
            { invoiceNumber: { equals: q, mode: "insensitive" } },
            { customerPhone: q },
          ],
        },
        include: {
          lines: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
          customer: true,
          branch: true,
          returns: {
            include: { lines: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!invoice) {
        return NextResponse.json({ error: "لم يتم العثور على أي فاتورة بهذا الرقم أو الهاتف" }, { status: 404 });
      }

      // Compute returned quantity per variant
      const returnedMap: Record<string, number> = {};
      invoice.returns.forEach((ret) => {
        ret.lines.forEach((l) => {
          returnedMap[l.variantId] = (returnedMap[l.variantId] || 0) + l.quantity;
        });
      });

      const processedLines = invoice.lines.map((line) => {
        const alreadyReturned = returnedMap[line.variantId] || 0;
        const availableToReturn = Math.max(0, line.quantity - alreadyReturned);
        return {
          ...line,
          alreadyReturned,
          availableToReturn,
        };
      });

      return NextResponse.json({ invoice: { ...invoice, lines: processedLines } });
    }

    // Otherwise, return all return invoices
    const branchId = searchParams.get("branchId");
    const returns = await prisma.returnInvoice.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        customer: true,
        branch: true,
        originalInvoice: true,
        lines: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ returns });
  } catch (error) {
    console.error("Returns GET error:", error);
    return NextResponse.json({ error: "فشل استرجاع بيانات المردودات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      originalInvoiceId,
      customerId,
      branchId,
      type = "RETURN", // "RETURN" | "EXCHANGE"
      settlementType = "CASH_REFUND", // "CASH_REFUND" | "DEBT_CREDIT" | "EXCHANGE"
      refundAmount = 0,
      reason,
      notes,
      lines, // array of { variantId, quantity, unitPrice }
    } = body;

    if (!branchId) {
      return NextResponse.json({ error: "الفرع مطلوب لتسجيل المرتجع وإرجاع البضاعة لمخزونه" }, { status: 400 });
    }

    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: "يرجى تحديد الأصناف المراد إرجاعها أو استبدالها" }, { status: 400 });
    }

    const returnNumber = `RET-${Date.now().toString().slice(-8)}`;

    const returnInvoice = await prisma.returnInvoice.create({
      data: {
        returnNumber,
        originalInvoiceId: originalInvoiceId || null,
        customerId: customerId || null,
        branchId,
        type,
        settlementType,
        refundAmount: parseFloat(refundAmount) || 0,
        reason: reason || null,
        notes: notes || null,
        lines: {
          create: lines.map((l: any) => ({
            variantId: l.variantId,
            quantity: parseInt(l.quantity, 10) || 1,
            unitPrice: parseFloat(l.unitPrice) || 0,
            total: (parseInt(l.quantity, 10) || 1) * (parseFloat(l.unitPrice) || 0),
          })),
        },
      },
      include: {
        lines: {
          include: { variant: { include: { product: true } } },
        },
        customer: true,
        branch: true,
      },
    });

    // Return items to branch stock
    for (const line of lines) {
      const q = parseInt(line.quantity, 10) || 1;
      await prisma.branchStock.upsert({
        where: {
          variantId_branchId: {
            variantId: line.variantId,
            branchId,
          },
        },
        update: { quantity: { increment: q } },
        create: {
          variantId: line.variantId,
          branchId,
          quantity: q,
          alertLowQuantity: 2,
        },
      });
    }

    // Handle Customer debt credit if settlementType === "DEBT_CREDIT" and customerId exists
    if (settlementType === "DEBT_CREDIT" && customerId && refundAmount > 0) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          totalDebt: { decrement: parseFloat(refundAmount) },
        },
      });

      await prisma.customerTransaction.create({
        data: {
          customerId,
          type: "RETURN",
          amount: parseFloat(refundAmount),
          referenceNumber: returnNumber,
          notes: `تسوية مردودات مبيعات بموجب الإذن ${returnNumber}`,
        },
      });
    }

    // Update original invoice status if provided
    if (originalInvoiceId) {
      await prisma.invoice.update({
        where: { id: originalInvoiceId },
        data: {
          status: type === "EXCHANGE" ? "EXCHANGED" : "RETURNED",
        },
      });
    }

    return NextResponse.json({ success: true, returnInvoice });
  } catch (error) {
    console.error("Returns POST error:", error);
    return NextResponse.json({ error: "فشل تسجيل إذن المردودات" }, { status: 500 });
  }
}
