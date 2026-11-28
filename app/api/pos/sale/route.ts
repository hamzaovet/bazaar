import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWebPushNotification } from "@/lib/push";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      branchId,
      userId,
      shiftId,
      customerPhone,
      customerName,
      items, // array of { variantId, quantity, unitPrice, unitCost, barcode, name, color, size }
      paymentMethod = "cash",
      paymentBreakdown, // { cash: 0, visa: 0, instapay: 0, vodafone: 0 }
      discountAmount = 0,
      cashierDiscount = 0,
      ownerDiscount = 0,
      discountType = null,
      discountNotes = null,
      notes = "",
    } = body;

    if (!branchId || !items || !items.length) {
      return NextResponse.json({ error: "بيانات الفاتورة غير مكتملة" }, { status: 400 });
    }

    // 1. Calculate totals
    let subtotal = 0;
    let totalCost = 0;
    for (const item of items) {
      const q = parseInt(item.quantity, 10) || 1;
      const p = parseFloat(item.unitPrice) || 0;
      const c = parseFloat(item.unitCost) || 0;
      subtotal += q * p;
      totalCost += q * c;
    }

    const parsedCashierDisc = parseFloat(cashierDiscount) || 0;
    const parsedOwnerDisc = parseFloat(ownerDiscount) || 0;
    const totalDiscount = (parsedCashierDisc + parsedOwnerDisc) > 0 
      ? (parsedCashierDisc + parsedOwnerDisc) 
      : (parseFloat(discountAmount) || 0);
    const finalTotal = Math.max(0, subtotal - totalDiscount);

    // 2. Customer CRM Loyalty Management
    let customerId: string | null = null;
    if (customerPhone) {
      const cleanPhone = customerPhone.trim();
      const customer = await prisma.customer.upsert({
        where: { phone: cleanPhone },
        update: {
          name: customerName || undefined,
          totalSpent: { increment: finalTotal },
          loyaltyPoints: { increment: Math.floor(finalTotal / 20) }, // 1 point per 20 EGP
          totalVisits: { increment: 1 },
        },
        create: {
          phone: cleanPhone,
          name: customerName || "عميل بازار كاجوال",
          branchId,
          totalSpent: finalTotal,
          loyaltyPoints: Math.floor(finalTotal / 20),
          totalVisits: 1,
        },
      });
      customerId = customer.id;
    }

    // 3. Generate Invoice Serial
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `BAZ-${dateStr}-${randomSuffix}`;

    // 4. Create Invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        branchId,
        cashierId: userId || null,
        shiftId: shiftId || null,
        customerId,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        orderType: "IN_STORE_POS",
        subTotal: subtotal,
        discountAmount: totalDiscount,
        cashierDiscount: parsedCashierDisc > 0 ? parsedCashierDisc : (parsedOwnerDisc === 0 ? totalDiscount : 0),
        ownerDiscount: parsedOwnerDisc,
        discountType: discountType || (parsedOwnerDisc > 0 ? "OWNER_VIP" : (totalDiscount > 0 ? "STANDARD" : null)),
        discountNotes: discountNotes || null,
        finalTotal,
        paidAmount: finalTotal,
        paymentMethod: paymentMethod.toUpperCase(),
        splitDetails: paymentBreakdown ? JSON.stringify(paymentBreakdown) : null,
        status: "PAID",
        notes,
        lines: {
          create: items.map((item: any) => ({
            variantId: item.variantId,
            productName: item.name || "قطعة كاجوال",
            color: item.color || "",
            size: item.size || "",
            barcode: item.barcode || "",
            quantity: parseInt(item.quantity, 10) || 1,
            unitPrice: parseFloat(item.unitPrice) || 0,
            costPrice: parseFloat(item.unitCost) || 0,
            total: (parseInt(item.quantity, 10) || 1) * (parseFloat(item.unitPrice) || 0),
          })),
        },
      },
      include: {
        lines: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        branch: true,
        cashierUser: true,
        customer: true,
      },
    });

    // 5. Decrement Branch Stock and check low stock alert
    for (const item of items) {
      if (item.variantId) {
        const branchStock = await prisma.branchStock.findUnique({
          where: {
            variantId_branchId: {
              variantId: item.variantId,
              branchId,
            },
          },
        });

        if (branchStock) {
          const newQty = Math.max(0, branchStock.quantity - (parseInt(item.quantity, 10) || 1));
          await prisma.branchStock.update({
            where: { id: branchStock.id },
            data: { quantity: newQty },
          });

          // Check low stock trigger
          if (newQty <= branchStock.alertLowQuantity) {
            sendWebPushNotification({
              title: "⚠️ تنبيه مخزون منخفض - بازار كاجوال وير",
              body: `القطعة (${item.name || ""} - مقاس ${item.size || ""}) أوشكت على النفاد في ${invoice.branch?.name || "الفرع"} (المتبقي: ${newQty} فقط!)`,
              role: "storekeeper",
              url: "/admin?tab=inventory",
            }).catch(() => {});
          }
        }
      }
    }

    // 5.b Handle Secret Discounts Auditing & Mohamed Ashraf Expense Ledger
    if (parsedOwnerDisc > 0) {
      await prisma.expense.create({
        data: {
          branchId,
          shiftId: shiftId || null,
          title: `خصم خاص وتكريم من م / محمد أشرف - فاتورة #${invoiceNumber}`,
          amount: parsedOwnerDisc,
          category: "MISC", // Valid enum in current schema, notes specify owner drawing
          paymentMethod: "CASH",
          recordedBy: "محمد أشرف (كود VIP الحصري)",
          notes: discountNotes || `خصم استثنائي بكود المالك للعميل ${customerName || customerPhone || "نقدي"} (صافي الفاتورة: ${finalTotal} ج.م)`,
        },
      }).catch((e) => console.error("Owner discount expense error:", e));

      await prisma.ownerAlert.create({
        data: {
          type: "OWNER_DISCOUNT_APPLIED",
          title: `👑 تم تفعيل كود خصم محمد أشرف: ${parsedOwnerDisc} ج.م`,
          message: `قام الكاشير ${invoice.cashierUser?.name || "المناوب"} بتطبيق خصم خاص من رصيد محمد أشرف بقيمة ${parsedOwnerDisc} ج.م على الفاتورة #${invoiceNumber} (الصافي بعد الخصم: ${finalTotal} ج.م).`,
          data: JSON.stringify({
            invoiceNumber,
            finalTotal,
            ownerDiscount: parsedOwnerDisc,
            cashierDiscount: parsedCashierDisc,
            customerPhone: customerPhone || null,
            customerName: customerName || null,
            cashier: invoice.cashierUser?.name,
            notes: discountNotes,
          }),
        },
      }).catch((e) => console.error("Owner discount alert error:", e));
    }

    if (discountType === "BARGAIN_PIN") {
      await prisma.ownerAlert.create({
        data: {
          type: "BARGAIN_DISCOUNT_APPLIED",
          title: `🏷️ تم تفعيل كود الفصال السري: ${parsedCashierDisc} ج.م`,
          message: `استخدم الكاشير كود الفصال السري لتجاوز الحد الأقصى وخصم ${parsedCashierDisc} ج.م على الفاتورة #${invoiceNumber}.`,
          data: JSON.stringify({
            invoiceNumber,
            cashierDiscount: parsedCashierDisc,
            finalTotal,
            cashier: invoice.cashierUser?.name,
          }),
        },
      }).catch((e) => console.error("Bargain discount alert error:", e));
    }

    // 6. Update Cashier Shift if active
    if (shiftId) {
      const isCash = paymentMethod.toLowerCase() === "cash";
      const isVisa = paymentMethod.toLowerCase() === "visa";
      const isInstapay = paymentMethod.toLowerCase() === "instapay";
      const isVodafone = paymentMethod.toLowerCase() === "vodafone_cash";
      const isSplit = paymentMethod.toLowerCase() === "split";

      const cashInc = isSplit ? paymentBreakdown?.cash || 0 : isCash ? finalTotal : 0;
      const visaInc = isSplit ? paymentBreakdown?.visa || 0 : isVisa ? finalTotal : 0;
      const instaInc = isSplit ? paymentBreakdown?.instapay || 0 : isInstapay ? finalTotal : 0;
      const vodaInc = isSplit ? paymentBreakdown?.vodafone || 0 : isVodafone ? finalTotal : 0;

      await prisma.shift.update({
        where: { id: shiftId },
        data: {
          totalSales: { increment: finalTotal },
          cashSales: { increment: cashInc },
          visaSales: { increment: visaInc },
          instapaySales: { increment: instaInc },
          vodafoneSales: { increment: vodaInc },
        },
      }).catch((e) => console.error("Shift update error:", e));
    }

    return NextResponse.json({
      success: true,
      invoice: {
        ...invoice,
        user: invoice.cashierUser,
        subtotal: invoice.subTotal,
        netTotal: invoice.finalTotal,
      },
    });
  } catch (error) {
    console.error("POS Sale error:", error);
    return NextResponse.json({ error: "فشل إتمام عملية البيع وتسجيل الفاتورة" }, { status: 500 });
  }
}
