import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");

    if (!supplierId) {
      return NextResponse.json({ error: "معرف المورد مطلوب" }, { status: 400 });
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
    }

    const transactions = await prisma.supplierTransaction.findMany({
      where: { supplierId },
      orderBy: { createdAt: "asc" },
    });

    // Calculate running balance:
    // PURCHASE / OPENING_BALANCE increases debt (positive)
    // PAYMENT / RETURN decreases debt (negative)
    let runningBalance = 0;
    const ledger = transactions.map((tx) => {
      if (tx.type === "PURCHASE" || tx.type === "OPENING_BALANCE") {
        runningBalance += tx.amount;
      } else if (tx.type === "PAYMENT" || tx.type === "RETURN") {
        runningBalance -= tx.amount;
      }
      return {
        ...tx,
        runningBalance,
      };
    });

    return NextResponse.json({ supplier, transactions: ledger });
  } catch (error) {
    console.error("Supplier Transactions GET error:", error);
    return NextResponse.json({ error: "فشل استرجاع كشف حساب المورد" }, { status: 500 });
  }
}

// Record a Payment / Debt Settlement to Supplier
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supplierId, amount, paymentMethod = "CASH", notes } = body;

    const amt = parseFloat(amount);
    if (!supplierId || !amt || amt <= 0) {
      return NextResponse.json({ error: "يرجى تحديد المورد وإدخال مبلغ دفع صحيح أكبر من صفر" }, { status: 400 });
    }

    const refNumber = `PAY-SUP-${Date.now().toString().slice(-8)}`;

    // Create transaction
    const tx = await prisma.supplierTransaction.create({
      data: {
        supplierId,
        type: "PAYMENT",
        amount: amt,
        referenceNumber: refNumber,
        paymentMethod,
        notes: notes || "سداد دفعة نقدية من حساب المورد",
      },
    });

    // Decrement supplier totalDebt
    const updatedSupplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        totalDebt: { decrement: amt },
      },
    });

    return NextResponse.json({ success: true, transaction: tx, supplier: updatedSupplier });
  } catch (error) {
    console.error("Supplier Payment POST error:", error);
    return NextResponse.json({ error: "فشل تسجيل دفعة السداد للمورد" }, { status: 500 });
  }
}
