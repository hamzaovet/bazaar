import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.systemSettings.findFirst();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "فشل استرجاع إعدادات النظام" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      brandNameAr,
      brandNameEn,
      hotline,
      whatsappNumber,
      facebookUrl,
      facebookUrl2,
      tiktokUrl,
      instagramUrl,
      receiptFooterText,
      heroBannerImage,
      heroTagline,
      heroDescription,
      // Master Lock controls
      isMasterLocked,
      masterLockMessage,
      ownerPin, // Required to toggle master lockout!
    } = body;

    // If master lockout is being modified, verify PIN
    if (typeof isMasterLocked === "boolean") {
      const owner = await prisma.user.findFirst({
        where: { role: "owner", username: "maestro" },
      });

      if (!owner || ownerPin !== owner.pin) {
        return NextResponse.json(
          { error: "عفواً! زر الطوارئ وتعطيل الحسابات مخصص حصرياً للمالك (Maestro) مع التحقق من الرمز السري الخاص به." },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.systemSettings.upsert({
      where: { id: 1 },
      update: {
        brandNameAr: brandNameAr || undefined,
        brandNameEn: brandNameEn || undefined,
        hotline: hotline || undefined,
        whatsappNumber: whatsappNumber || undefined,
        facebookUrl: facebookUrl || undefined,
        facebookUrl2: facebookUrl2 || undefined,
        tiktokUrl: tiktokUrl || undefined,
        instagramUrl: instagramUrl || undefined,
        receiptFooterText: receiptFooterText || undefined,
        heroBannerImage: heroBannerImage || undefined,
        heroTagline: heroTagline || undefined,
        heroDescription: heroDescription || undefined,
        isMasterLocked: typeof isMasterLocked === "boolean" ? isMasterLocked : undefined,
        masterLockMessage: masterLockMessage || undefined,
      },
      create: {
        id: 1,
        brandNameAr: brandNameAr || "بزار كاجوال وير",
        brandNameEn: brandNameEn || "BAZAAR Casual Wear",
        hotline: hotline || "01008038041",
        whatsappNumber: whatsappNumber || "01008038041",
        facebookUrl: facebookUrl || "https://www.facebook.com/share/1Dq8mYkoij/",
        facebookUrl2: facebookUrl2 || "https://www.facebook.com/profile.php?id=100090095202108&mibextid=wwXIfr",
        tiktokUrl: tiktokUrl || "https://www.tiktok.com/@mohamed_ashraf327?_r=1&_t=ZS-9BMGDqeFbr2",
        instagramUrl: instagramUrl || "https://www.instagram.com/bazaar_casual_wear",
        receiptFooterText: receiptFooterText || "شكراً لزيارتكم بزار كاجوال وير",
        heroBannerImage: heroBannerImage || "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=80",
        heroTagline: heroTagline || "طقم الأوفر سايز والكارجو التكتيكال",
        heroDescription: heroDescription || "قطن مصري 100% هيفي ويت معالج ضد الانكماش مع نسيج كارجو ووتر بروف",
        isMasterLocked: Boolean(isMasterLocked),
        masterLockMessage: masterLockMessage || "النظام في وضع الصيانة والتحديث الإداري العام.",
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "فشل حفظ التعديلات" }, { status: 500 });
  }
}
