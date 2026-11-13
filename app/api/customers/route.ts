import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const search = searchParams.get("search");

    if (phone) {
      const customer = await prisma.customer.findUnique({
        where: { phone: phone.trim() },
        include: {
          invoices: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: { branch: true },
          },
        },
      });

      return NextResponse.json({
        customer: customer
          ? {
              ...customer,
              points: customer.loyaltyPoints,
              totalPurchases: customer.totalSpent,
            }
          : null,
      });
    }

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { totalSpent: "desc" },
      take: 100,
    });

    const mapped = customers.map((c) => ({
      ...c,
      points: c.loyaltyPoints,
      totalPurchases: c.totalSpent,
    }));

    return NextResponse.json({ customers: mapped });
  } catch (error) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ error: "فشل استرجاع بيانات العملاء" }, { status: 500 });
  }
}
