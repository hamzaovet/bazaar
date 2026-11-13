import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: { purchaseInvoices: true, transactions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ suppliers });
  } catch (error) {
    console.error("Suppliers GET error:", error);
    return NextResponse.json({ error: "فشل استرجاع بيانات الموردين" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contactName, phone, address, openingBalance = 0, openingBalanceDate, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "اسم المورد أو المصنع حقل إلزامي" }, { status: 400 });
    }

    const openBal = parseFloat(openingBalance) || 0;

    const newSupplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        contactName: contactName || null,
        phone: phone || null,
        address: address || null,
        openingBalance: openBal,
        openingBalanceDate: openingBalanceDate ? new Date(openingBalanceDate) : new Date(),
        totalDebt: openBal, // Initial debt equals opening balance
        notes: notes || null,
      },
    });

    if (openBal > 0) {
      await prisma.supplierTransaction.create({
        data: {
          supplierId: newSupplier.id,
          type: "OPENING_BALANCE",
          amount: openBal,
          notes: "رصيد أول المدة عند تسجيل المورد",
        },
      });
    }

    return NextResponse.json({ success: true, supplier: newSupplier });
  } catch (error: any) {
    console.error("Supplier POST error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "اسم المورد مسجل مسبقاً، يرجى اختيار اسم مميز" }, { status: 400 });
    }
    return NextResponse.json({ error: "فشل إضافة المورد الجديد" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, contactName, phone, address, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف المورد مطلوب" }, { status: 400 });
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        contactName: contactName !== undefined ? contactName : undefined,
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json({ success: true, supplier: updated });
  } catch (error) {
    console.error("Supplier PUT error:", error);
    return NextResponse.json({ error: "فشل تحديث بيانات المورد" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف المورد مطلوب" }, { status: 400 });
    }

    const count = await prisma.purchaseInvoice.count({ where: { supplierId: id } });
    if (count > 0) {
      return NextResponse.json({ error: "لا يمكن حذف مورد مرتبط بفواتير مشتريات مسجلة" }, { status: 400 });
    }

    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "تم حذف المورد بنجاح" });
  } catch (error) {
    console.error("Supplier DELETE error:", error);
    return NextResponse.json({ error: "فشل حذف المورد" }, { status: 500 });
  }
}
