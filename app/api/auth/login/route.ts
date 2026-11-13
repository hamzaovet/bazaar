import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, pin, branchId, loginType } = body;

    // Fetch system settings to check for Emergency Master Lock
    const settings = await prisma.systemSettings.findFirst();
    const isLocked = settings?.isMasterLocked || false;

    let user = null;

    if (loginType === "pin" && pin) {
      // Fast PIN login for POS Cashiers or staff
      if (branchId) {
        user = await prisma.user.findFirst({
          where: { pin, branchId, isActive: true },
          include: { branch: true },
        });
      } else {
        user = await prisma.user.findFirst({
          where: { pin, isActive: true },
          include: { branch: true },
        });
      }
    } else if (username && password) {
      // Standard credentials login
      user = await prisma.user.findUnique({
        where: { username },
        include: { branch: true },
      });

      if (user && user.password !== password) {
        user = null;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة، يرجى التحقق من اسم المستخدم أو الرمز السري" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "هذا الحساب معطل حالياً من الإدارة، يرجى مراجعة المالك" },
        { status: 403 }
      );
    }

    // Emergency Master Lockout check:
    // If locked, ONLY the owner (Maestro) can access!
    if (isLocked && user.role !== "owner") {
      return NextResponse.json(
        {
          error:
            settings?.masterLockMessage ||
            "تم تفعيل وضع الإغلاق الإداري للطوارئ من قبل المالك Maestro. جميع صلاحيات الدخول معطلة مؤقتاً لضمان الأمان.",
          isMasterLocked: true,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        phone: user.phone,
        branchId: user.branchId,
        branch: user.branch,
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}
