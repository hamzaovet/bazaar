import { NextResponse } from "next/server";
import { generateOtp, sendOtpEmail } from "@/lib/mail";

// In-memory or cached OTP store (with 15 min expiry)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, phone, code } = body;

    const identifier = (email || phone || "").trim().toLowerCase();

    if (!identifier) {
      return NextResponse.json({ error: "البريد الإلكتروني أو رقم الهاتف مطلوب" }, { status: 400 });
    }

    if (action === "SEND") {
      const generatedCode = generateOtp();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

      otpStore.set(identifier, { code: generatedCode, expiresAt });

      if (email && email.includes("@")) {
        const mailResult = await sendOtpEmail(email, generatedCode);
        if (!mailResult.success) {
          console.warn("Mail sending warning, using dev code:", generatedCode);
        }
      }

      return NextResponse.json({
        success: true,
        message: "تم إرسال كود التحقق بنجاح",
        // In local/dev or as fallback
        code: process.env.NODE_ENV !== "production" ? generatedCode : undefined,
      });
    }

    if (action === "VERIFY") {
      const record = otpStore.get(identifier);
      if (!record) {
        return NextResponse.json({ error: "كود التحقق منتهي أو لم يتم طلبه" }, { status: 400 });
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(identifier);
        return NextResponse.json({ error: "انتهت صلاحية كود التحقق، يرجى طلب كود جديد" }, { status: 400 });
      }

      if (record.code !== String(code).trim()) {
        return NextResponse.json({ error: "كود التحقق غير صحيح، يرجى إعادة المحاولة" }, { status: 400 });
      }

      // Success
      otpStore.delete(identifier);
      return NextResponse.json({ success: true, message: "تم التحقق بنجاح" });
    }

    return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
  } catch (error) {
    console.error("OTP API error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء معالجة كود التحقق" }, { status: 500 });
  }
}
