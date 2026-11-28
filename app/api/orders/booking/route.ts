import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      address,
      city = "القاهرة",
      items,
      depositAmount = 100,
      depositReceiptUrl,
      notes = "",
    } = body;

    if (!customerPhone || !items || !items.length) {
      return NextResponse.json({ error: "بيانات الحجز غير مكتملة (الهاتف والأصناف مطلوبة)" }, { status: 400 });
    }

    const cleanPhone = customerPhone.trim();
    const deposit = parseFloat(depositAmount) || 0;

    // 1. Calculate subtotal
    let subtotal = 0;
    for (const item of items) {
      const q = parseInt(item.quantity, 10) || 1;
      const p = parseFloat(item.price || item.unitPrice) || 0;
      subtotal += q * p;
    }

    const fullAddress = city ? `${city} - ${address}` : address;

    // 2. Upsert Customer
    const customer = await prisma.customer.upsert({
      where: { phone: cleanPhone },
      update: {
        name: customerName || undefined,
        address: fullAddress || undefined,
      },
      create: {
        phone: cleanPhone,
        name: customerName || "عميل حجز أونلاين",
        address: fullAddress || "",
        totalSpent: 0,
        loyaltyPoints: 10,
      },
    });

    // 3. Find default branch
    const branch = await prisma.branch.findFirst();

    // 4. Create Invoice
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `BK-${dateStr}-${randomSuffix}`;

    const bookingDetails = {
      orderType: "ONLINE_BOOKING",
      deliveryAddress: address,
      deliveryCity: city,
      depositAmount: deposit,
      depositReceiptUrl: depositReceiptUrl || null,
      remainingAmount: Math.max(0, subtotal - deposit),
      clientNotes: notes,
    };

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        branchId: branch?.id || "",
        customerId: customer.id,
        customerName: customerName || customer.name,
        customerPhone: cleanPhone,
        orderType: "ONLINE_DELIVERY",
        subTotal: subtotal,
        discountAmount: 0,
        finalTotal: subtotal,
        paidAmount: deposit,
        paymentMethod: "INSTAPAY",
        status: "DEPOSIT_PENDING",
        notes: JSON.stringify(bookingDetails),
        lines: {
          create: items.map((item: any) => ({
            variantId: item.variantId,
            productName: item.name || "قطعة كاجوال بازار",
            color: item.color || "",
            size: item.size || "",
            barcode: item.barcode || "",
            quantity: parseInt(item.quantity, 10) || 1,
            unitPrice: parseFloat(item.price || item.unitPrice) || 0,
            costPrice: 0,
            total: (parseInt(item.quantity, 10) || 1) * (parseFloat(item.price || item.unitPrice) || 0),
          })),
        },
      },
      include: {
        lines: true,
        customer: true,
      },
    });

    // 5. Notify Mohamed Ashraf via OwnerAlert
    await prisma.ownerAlert.create({
      data: {
        type: "BOOKING_DEPOSIT_SUBMITTED",
        title: `📦 حجز أونلاين جديد #${invoiceNumber} بديبوزيت ${deposit} ج.م`,
        message: `طلب حجز دليفري جديد للعميل ${customerName} (${cleanPhone}) في ${city} - ${address}. إجمالي الطلب: ${subtotal} ج.م (المتبقي عند الاستلام: ${Math.max(0, subtotal - deposit)} ج.م). ${depositReceiptUrl ? "تم إرفاق إيصال التحويل." : "في انتظار مراجعة التحويل."}`,
        data: JSON.stringify({
          invoiceNumber,
          customerName,
          customerPhone: cleanPhone,
          address,
          city,
          subtotal,
          deposit,
          depositReceiptUrl,
          itemsCount: items.length,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل طلب الحجز بنجاح وجارٍ مراجعة الديبوزيت للتجهيز والتوصيل!",
      invoice,
    });
  } catch (error) {
    console.error("Booking POST error:", error);
    return NextResponse.json({ error: "فشل تسجيل طلب الحجز" }, { status: 500 });
  }
}
