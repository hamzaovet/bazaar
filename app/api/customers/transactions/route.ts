import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "معرف العميل مطلوب" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 });
    }

    const transactions = await prisma.customerTransaction.findMany({
      where: { customerId },
      orderBy: { createdAt: "asc" },
    });

    // Calculate customer running balance:
    // INVOICE / OPENING_BALANCE increases customer debt
    // PAYMENT / RETURN decreases customer debt
    let runningBalance = 0;
    const ledger = transactions.map((tx) => {
      if (tx.type === "INVOICE" || tx.type === "OPENING_BALANCE") {
        runningBalance += tx.amount;
      } else if (tx.type === "PAYMENT" || tx.type === "RETURN") {
        runningBalance -= tx.amount;
      }
      return {
        ...tx,
        runningBalance,
      };
    });

    return NextResponse.json({ customer, transactions: ledger });
  } catch (error) {
    console.error("Customer Transactions GET error:", error);
    return NextResponse.json({ error: "فشل استرجاع كشف حساب العميل" }, { status: 500 });
  }
}

// Record Customer Payment / Debt Collection (تحصيل مديونية من العميل)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, amount, paymentMethod = "CASH", notes } = body;

    const amt = parseFloat(amount);
    if (!customerId || !amt || amt <= 0) {
      return NextResponse.json({ error: "يرجى تحديد العميل وإدخال مبلغ تحصيل صحيح أكبر من صفر" }, { status: 400 });
    }

    const refNumber = `REC-CUST-${Date.now().toString().slice(-8)}`;

    const tx = await prisma.customerTransaction.create({
      data: {
        customerId,
        type: "PAYMENT",
        amount: amt,
        referenceNumber: refNumber,
        paymentMethod,
        notes: notes || "سداد دفعة نقدية من مديونية العميل",
      },
    });

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        totalDebt: { decrement: amt },
      },
    });

    return NextResponse.json({ success: true, transaction: tx, customer: updatedCustomer });
  } catch (error) {
    console.error("Customer Payment POST error:", error);
    return NextResponse.json({ error: "فشل تسجيل دفعة تحصيل العميل" }, { status: 500 });
  }
}
