import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const shiftId = searchParams.get("shiftId");
    const id = searchParams.get("id");
    const invoiceNumber = searchParams.get("invoiceNumber");

    if (id || invoiceNumber) {
      const invoice = await prisma.invoice.findFirst({
        where: id ? { id } : { invoiceNumber: invoiceNumber! },
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

      return NextResponse.json({
        invoice: invoice
          ? {
              ...invoice,
              user: invoice.cashierUser,
              subtotal: invoice.subTotal,
              netTotal: invoice.finalTotal,
            }
          : null,
      });
    }

    const where: Record<string, unknown> = {};
    if (branchId) where.branchId = branchId;
    if (shiftId) where.shiftId = shiftId;

    const invoices = await prisma.invoice.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const mapped = invoices.map((inv) => ({
      ...inv,
      user: inv.cashierUser,
      subtotal: inv.subTotal,
      netTotal: inv.finalTotal,
    }));

    return NextResponse.json({ invoices: mapped });
  } catch (error) {
    console.error("Invoices GET error:", error);
    return NextResponse.json({ error: "فشل استرجاع الفواتير" }, { status: 500 });
  }
}
