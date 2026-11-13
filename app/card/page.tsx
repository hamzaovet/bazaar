"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Share2,
  ExternalLink,
  Printer,
  ChevronLeft,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  UserPlus,
  CreditCard,
  Wallet,
  Star,
  Globe,
  Radio,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import PrintableCard from "@/components/PrintableCard";

export default function SmartCardLandingPage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [settings, setSettings] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sRes, bRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/branches"),
        ]);
        const sData = await sRes.json();
        const bData = await bRes.json();

        if (sData.settings) setSettings(sData.settings);
        if (bData.branches) setBranches(bData.branches);
      } catch (e) {
        console.error("Error loading smart card settings:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCopy = (text: string, label: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2500);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://bazaar.vercel.app/card";
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "بزار كاجوال وير | BAZAAR Casual Wear - كارت التواصل والمدفوعات NFC",
          text: "الملف الرقمي الذكي لماركة بزار كاجوال وير • الدفع السريع، الفروع، السوشيال ميديا، والكتالوج",
          url,
        });
      } catch (e) {
        // Ignored
      }
    } else {
      handleCopy(url, "link");
    }
  };

  // Generate & Download vCard (Save Contact directly to smartphone contacts)
  const handleDownloadVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:كاجوال وير;بزار;;;
FN:بزار كاجوال وير - BAZAAR
ORG:BAZAAR Casual Wear
TITLE:ملابس شبابي كاجوال وأوفر سايز
TEL;TYPE=WORK,VOICE:01008038041
TEL;TYPE=CELL,VOICE:01210520500
TEL;TYPE=OTHER,VOICE:01008183647
ADR;TYPE=WORK:;;شارع عباس العقاد بجوار أبو العز السوري;مدينة نصر;القاهرة;;مصر
URL:${typeof window !== "undefined" ? window.location.origin : "https://bazaar.vercel.app"}
NOTE:البراند المصري الفاخر للملابس الرجالي والشبابي • عباس العقاد
END:VCARD`;

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bazaar-casual-wear.vcf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Dynamic links parsing
  const customLinks: any[] = React.useMemo(() => {
    if (!settings?.smartCardCustomLinks) return [];
    try {
      const parsed =
        typeof settings.smartCardCustomLinks === "string"
          ? JSON.parse(settings.smartCardCustomLinks)
          : settings.smartCardCustomLinks;
      return Array.isArray(parsed) ? parsed.filter((l) => l.isActive !== false) : [];
    } catch (e) {
      return [];
    }
  }, [settings?.smartCardCustomLinks]);

  // Standard accounts with dynamic fallback
  const hotline = settings?.hotline || "01008038041";
  const whatsapp = settings?.whatsappNumber || "01008038041";
  const fb1 = settings?.facebookUrl || "https://www.facebook.com/share/1Dq8mYkoij/";
  const fb2 = settings?.facebookUrl2 || "https://www.facebook.com/profile.php?id=100090095202108&mibextid=wwXIfr";
  const tiktok = settings?.tiktokUrl || "https://www.tiktok.com/@mohamed_ashraf327?_r=1&_t=ZS-9BMGDqeFbr2";
  const instagram = settings?.instagramUrl || "https://www.instagram.com/bazaar_casual_wear";
  const instapayHandle = settings?.smartCardInstapay || "bazaar@instapay";
  const vodafoneCash = settings?.smartCardVodafoneCash || "01008038041";
  const googleReviewsUrl = settings?.smartCardGoogleReviews || "https://maps.app.goo.gl/MzCnj5n3mP29uurK6?g_st=ic";

  const branch1Maps = "https://maps.app.goo.gl/MzCnj5n3mP29uurK6?g_st=ic";
  const branch2Maps = "https://maps.app.goo.gl/SV4L5Xeksm1GTPxGA?g_st=com.google.maps.preview.copy";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#07070b] via-[#0d0d14] to-[#07070b] text-white py-6 px-3 sm:px-4 flex justify-center selection:bg-[#00ff66] selection:text-black font-['Cairo',sans-serif]">
      <div className="w-full max-w-md space-y-4">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between pb-1">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl transition-all"
          >
            <ChevronLeft size={16} className="rotate-180" />
            <span>المتجر</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-amber-500/20 transition-all font-bold shadow-sm"
            >
              <Printer size={14} />
              <span>ستاند وكارت NFC</span>
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70"
              title="مشاركة الكارت"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* ── 1. ROYAL PROFILE HEADER CARD ── */}
        <div className="text-center py-5 px-5 rounded-3xl bg-black/40 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-[#00ff66]/10 rounded-full blur-3xl pointer-events-none" />

          {/* NFC Tap Wave Indicator */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60 mb-3">
            <Radio size={12} className="text-[#00ff66] animate-pulse" />
            <span>كارت ستاند NFC & QR الذكي</span>
          </div>

          <BrandLogo size="xl" />

          <h2 className="text-sm font-black text-white mt-3">
            {settings?.smartCardTitle || "بزار كاجوال وير • BAZAAR Casual Wear"}
          </h2>
          <p className="text-xs text-white/70 mt-1 max-w-xs mx-auto leading-relaxed">
            {settings?.smartCardBio ||
              "براند الشارع المصري الفاخر • خامات قطنية تركي وأوفر سايز عصري بفروع عباس العقاد"}
          </p>

          {/* Quick Dual Actions: Save Contact & Direct Call */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={handleDownloadVCard}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <UserPlus size={15} />
              <span>حفظ جهة الاتصال</span>
            </button>

            <a
              href={`tel:${hotline}`}
              className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Phone size={15} className="text-[#00ff66]" />
              <span>اتصال هاتفي</span>
            </a>
          </div>
        </div>

        {/* ── 2. INSTAPAY & CASHLESS QUICK PAY HUB (إدفع بسرعة وسهولة) ── */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#12121a] via-[#101018] to-[#141422] border border-amber-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-xl">⚡</span>
              <div>
                <h3 className="font-black text-xs text-white">إدفع بسرعة وسهولة للكاشير</h3>
                <p className="text-[10px] text-white/50">تحويلات إنستاباي والمحافظ الإلكترونية والفيزا</p>
              </div>
            </div>
            <span className="text-[10px] font-black bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/30 px-2 py-0.5 rounded-full">
              دفع فوري
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* InstaPay */}
            <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-md">
                    IP
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-white block">إنستاباي (InstaPay)</span>
                    <span className="text-[9px] text-white/50 font-mono truncate max-w-[130px] block">
                      {instapayHandle}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={() => handleCopy(instapayHandle, "instapay")}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
                >
                  {copiedText === "instapay" ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>نسخ المعرف</span>
                    </>
                  )}
                </button>
                <a
                  href={`https://instapay.eg`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-bold flex items-center justify-center"
                  title="فتح التطبيق"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Vodafone Cash */}
            <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-xs font-black text-white shadow-md">
                    VC
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-white block">فودافون كاش / محافظ</span>
                    <span className="text-[9px] text-white/50 font-mono truncate block">
                      {vodafoneCash}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={() => handleCopy(vodafoneCash, "voda")}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
                >
                  {copiedText === "voda" ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>نسخ الرقم</span>
                    </>
                  )}
                </button>
                <a
                  href={`tel:*9*7*${vodafoneCash}#`}
                  className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-bold flex items-center justify-center"
                  title="تحويل مباشر"
                >
                  <Phone size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="text-center pt-1 text-[10px] text-amber-300/80 font-bold flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} className="text-[#00ff66]" />
            <span>يرجى إظهار شاشة إشعار التحويل للكاشير بعد الدفع ✓</span>
          </div>
        </div>

        {/* ── 3. MODERN APP-STYLE SOCIAL & LINK GRID (زي الصور 1 بالمللي) ── */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-white/70 flex items-center gap-2 px-1">
            <Sparkles size={14} className="text-[#00ff66]" />
            <span>جميع مواقع وقنوات التواصل الاجتماعي الرسمية</span>
          </h3>

          <div className="grid grid-cols-3 gap-2.5">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/2${whatsapp}?text=مرحباً%20بزار%20كاجوال%20وير`}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 flex flex-col items-center justify-center text-center gap-1.5 group transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-black flex items-center justify-center text-xl shadow-lg shadow-[#25D366]/20 group-hover:scale-110 transition-transform">
                💬
              </div>
              <span className="text-[11px] font-bold text-emerald-300">واتساب</span>
              <span className="text-[9px] text-white/50 font-mono">01008038041</span>
            </a>

            {/* Instagram */}
            <a
              href={instagram}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 hover:from-purple-600/20 hover:to-pink-600/20 border border-pink-500/30 flex flex-col items-center justify-center text-center gap-1.5 group transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                📸
              </div>
              <span className="text-[11px] font-bold text-pink-300">انستجرام</span>
              <span className="text-[9px] text-white/50 truncate max-w-[80px]">@bazaar</span>
            </a>

            {/* TikTok */}
            <a
              href={tiktok}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 flex flex-col items-center justify-center text-center gap-1.5 group transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-black border border-white/20 text-white flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                🎵
              </div>
              <span className="text-[11px] font-bold text-white">تيك توك</span>
              <span className="text-[9px] text-white/50 truncate max-w-[80px]">فيديوهات</span>
            </a>

            {/* Facebook 1 */}
            <a
              href={fb1}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 flex flex-col items-center justify-center text-center gap-1.5 group transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center text-xl shadow-lg shadow-[#1877F2]/20 group-hover:scale-110 transition-transform font-black">
                f
              </div>
              <span className="text-[11px] font-bold text-blue-300">فيسبوك 1</span>
              <span className="text-[9px] text-white/50">الصفحة الرسمية</span>
            </a>

            {/* Facebook 2 */}
            <a
              href={fb2}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 flex flex-col items-center justify-center text-center gap-1.5 group transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center text-xl shadow-lg shadow-[#1877F2]/20 group-hover:scale-110 transition-transform font-black">
                f
              </div>
              <span className="text-[11px] font-bold text-blue-300">فيسبوك 2</span>
              <span className="text-[9px] text-white/50">الاحتياطية</span>
            </a>

            {/* Online Store / Catalog */}
            <a
              href="/"
              className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 hover:from-amber-500/20 border border-amber-500/30 flex flex-col items-center justify-center text-center gap-1.5 group transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                🛍️
              </div>
              <span className="text-[11px] font-bold text-amber-300">المتجر أونلاين</span>
              <span className="text-[9px] text-white/50">تصفح التشكيلة</span>
            </a>

            {/* Google Reviews */}
            <a
              href={googleReviewsUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-amber-500/5 hover:bg-amber-500/15 border border-white/10 flex flex-col items-center justify-center text-center gap-1.5 group transition-all col-span-3 sm:col-span-1"
            >
              <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform font-black">
                ⭐
              </div>
              <span className="text-[11px] font-bold text-white">تقييمات Google</span>
              <span className="text-[9px] text-amber-300 font-bold">5 نجوم ★★★★★</span>
            </a>

            {/* Any Dynamic Custom Links from Dashboard */}
            {customLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center gap-1.5 group transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  {link.icon || "🔗"}
                </div>
                <span className="text-[11px] font-bold text-white truncate max-w-[90px]">
                  {link.title}
                </span>
                <span className="text-[9px] text-white/50">رابط إضافي</span>
              </a>
            ))}
          </div>
        </div>

        {/* ── 4. BRANCHES & GPS LOCATIONS ── */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2 px-1">
            <MapPin size={14} />
            <span>فروع بزار كاجوال وير الرسمية بالقاهرة</span>
          </h3>

          {/* Branch 1 */}
          <div className="p-3.5 rounded-2xl bg-[#12121a] border border-white/10 hover:border-amber-500/40 transition-all space-y-2.5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                  الفرع الرئيسي
                </span>
                <h4 className="font-bold text-xs text-white mt-1">فرع عباس العقاد</h4>
                <p className="text-[11px] text-white/70 leading-relaxed mt-0.5">
                  عباس العقاد بجوار أبو العز السوري وصالون صدام وسنتر علم الدين
                </p>
              </div>
              <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl text-base">🏬</span>
            </div>

            <div className="flex gap-2 pt-1 border-t border-white/5">
              <a
                href={branch1Maps}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <MapPin size={13} />
                <span>لوكيشن GPS</span>
              </a>
              <a
                href="tel:01008038041"
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone size={13} />
                <span>01008038041</span>
              </a>
            </div>
          </div>

          {/* Branch 2 */}
          <div className="p-3.5 rounded-2xl bg-[#12121a] border border-white/10 hover:border-[#00ff66]/40 transition-all space-y-2.5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold bg-[#00ff66]/20 text-[#00ff66] px-2 py-0.5 rounded-full">
                  الفرع الثاني
                </span>
                <h4 className="font-bold text-xs text-white mt-1">فرع أول عباس - كشري التحرير</h4>
                <p className="text-[11px] text-white/70 leading-relaxed mt-0.5">
                  أول عباس العقاد شارع كشري التحرير بجوار كافيه طاولة وحلاق طه منصور
                </p>
              </div>
              <span className="p-2 bg-[#00ff66]/10 text-[#00ff66] rounded-xl text-base">🏬</span>
            </div>

            <div className="flex gap-2 pt-1 border-t border-white/5">
              <a
                href={branch2Maps}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-[#00ff66]/20 hover:bg-[#00ff66]/30 text-[#00ff66] text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <MapPin size={13} />
                <span>لوكيشن GPS</span>
              </a>
              <a
                href="tel:01008183647"
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone size={13} />
                <span>01008183647</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── 5. FOOTER & ORCA TECH SIGNATURE ── */}
        <div className="border-t border-amber-500/20 bg-black/60 py-4 px-3 text-center space-y-1 rounded-2xl">
          <p className="text-[11px] text-amber-300/90 font-medium">
            تصميم وتطوير: <strong className="text-white font-black">م / حمزة عباس</strong> — شركة{" "}
            <strong className="text-amber-400 font-black">أوركا للحلول البرمجية (Orca Tech) 🐬</strong>
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            الدعم الفني المباشر وتطوير الأنظمة: 01018671000
          </p>
        </div>
      </div>

      {/* Printable Card & Acrylic Stand Modal */}
      {showPrintModal && (
        <PrintableCard
          settings={settings}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </main>
  );
}
