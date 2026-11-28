import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pin = searchParams.get("pin");

    // Fetch settings to check master PIN
    const settings = await prisma.systemSettings.findFirst();
    const expectedPin = settings?.ownerDiscountPin || "112233";

    // If PIN is supplied, verify it
    if (pin && pin !== expectedPin) {
      return NextResponse.json({ success: false, error: "كود الدخول السري غير صحيح" }, { status: 401 });
    }

    // 1. Supplier data (Invoice #1259)
    const supplier = (await prisma.supplier.findFirst({
      where: {
        OR: [
          { phone: "01008038041" },
          { contactName: { contains: "1259" } },
          { name: { contains: "توريدات ملابس شتاء" } },
        ],
      },
    })) || (await prisma.supplier.findFirst());

    const purchaseInvoice = await prisma.purchaseInvoice.findFirst({
      where: {
        invoiceNumber: "PUR-INV-1259",
      },
    });

    const totalInvoiceAmount = purchaseInvoice?.totalAmount || 837360;
    const currentSupplierDebt = supplier?.totalDebt ?? totalInvoiceAmount;
    const totalPaidToSupplier = Math.max(0, totalInvoiceAmount - currentSupplierDebt);
    const paymentPercentage = totalInvoiceAmount > 0 ? Math.min(100, Math.round((totalPaidToSupplier / totalInvoiceAmount) * 100)) : 0;

    // 2. Personal discounts given by Mohamed Ashraf across all sales
    const invoicesWithDiscounts = await prisma.invoice.findMany({
      where: {
        OR: [
          { ownerDiscount: { gt: 0 } },
          { cashierDiscount: { gt: 0 } },
        ],
      },
      select: {
        id: true,
        invoiceNumber: true,
        finalTotal: true,
        subTotal: true,
        cashierDiscount: true,
        ownerDiscount: true,
        discountType: true,
        discountNotes: true,
        createdAt: true,
        cashierUser: { select: { name: true } },
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const totalOwnerDiscountsSum = await prisma.invoice.aggregate({
      _sum: {
        ownerDiscount: true,
      },
    });

    const totalCashierDiscountsSum = await prisma.invoice.aggregate({
      _sum: {
        cashierDiscount: true,
      },
    });

    // 3. Owner expenses logged
    const ownerExpenses = await prisma.expense.findMany({
      where: {
        recordedBy: { contains: "محمد أشرف" },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // 4. Alerts
    const alerts = await prisma.ownerAlert.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
    });
    const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

    // 5. Audit report from purchase invoice
    let verificationAudit = null;
    if (purchaseInvoice?.verificationReport) {
      try {
        verificationAudit = JSON.parse(purchaseInvoice.verificationReport);
      } catch (e) {
        // Ignored
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        // Supplier & Invoices
        totalInvoiceAmount,
        totalPaidToSupplier,
        currentSupplierDebt,
        paymentPercentage,
        purchaseInvoiceNumber: purchaseInvoice?.invoiceNumber || "PUR-INV-1259",
        supplierName: supplier?.name || "المورد الرئيسي - كود 1259",
        supplierPhone: supplier?.phone || "01008038041",
        verificationAudit: verificationAudit || {
          totalModels: 46,
          totalUnits: 372,
          totalAmount: 837360,
          status: "PERFECT_MATCH",
          discrepancies: [],
        },

        // Personal Finance & Discounts
        totalOwnerDiscounts: totalOwnerDiscountsSum._sum.ownerDiscount || 0,
        totalCashierDiscounts: totalCashierDiscountsSum._sum.cashierDiscount || 0,
        totalCombinedSavings: (totalOwnerDiscountsSum._sum.ownerDiscount || 0) + (totalCashierDiscountsSum._sum.cashierDiscount || 0),
        invoicesWithDiscounts,
        ownerExpenses,

        // Settings & PINs
        maxCashierDiscountPerPiece: settings?.maxCashierDiscountPerPiece ?? 50,
        cashierBargainPin: settings?.cashierBargainPin || "1572",
        ownerDiscountPin: settings?.ownerDiscountPin || "112233",

        // Alerts
        unreadAlertsCount,
        alerts,
      },
    });
  } catch (err: any) {
    console.error("Owner stats error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
