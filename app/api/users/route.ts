import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        branch: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Users GET error:", error);
    return NextResponse.json({ error: "فشل استرجاع بيانات المستخدمين" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, pin, name, role, branchId, phone } = body;

    if (!username || !password || !name) {
      return NextResponse.json({ error: "الاسم واسم المستخدم وكلمة المرور حقول إلزامية" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "اسم المستخدم هذا مسجل مسبقاً، يرجى اختيار اسم آخر" }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        username: username.trim().toLowerCase(),
        password,
        pin: pin || "1234",
        name,
        role: role || "cashier",
        branchId: branchId || null,
        phone: phone || null,
        isActive: true,
      },
      include: { branch: true },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("User POST error:", error);
    return NextResponse.json({ error: "فشل إنشاء حساب المستخدم" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, password, pin, role, branchId, phone, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف المستخدم مطلوب" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name || undefined,
        password: password || undefined,
        pin: pin || undefined,
        role: role || undefined,
        branchId: branchId !== undefined ? branchId : undefined,
        phone: phone !== undefined ? phone : undefined,
        isActive: typeof isActive === "boolean" ? isActive : undefined,
      },
      include: { branch: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("User PUT error:", error);
    return NextResponse.json({ error: "فشل تحديث بيانات المستخدم" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف المستخدم مطلوب" }, { status: 400 });
    }

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (userToDelete?.role === "owner") {
      return NextResponse.json({ error: "غير مسموح بحذف حساب المالك Maestro الأساسي" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    console.error("User DELETE error:", error);
    return NextResponse.json({ error: "فشل حذف المستخدم" }, { status: 500 });
  }
}
