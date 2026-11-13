"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Sparkles,
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  Download,
  ShoppingBag,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

export default function SmartCardPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const branch1Maps = "https://maps.app.goo.gl/MzCnj5n3mP29uurK6?g_st=ic";
  const branch2Maps = "https://maps.app.goo.gl/SV4L5Xeksm1GTPxGA?g_st=com.google.maps.preview.copy";

  const fb1 = "https://www.facebook.com/share/1Dq8mYkoij/";
  const fb2 = "https://www.facebook.com/profile.php?id=100090095202108&mibextid=wwXIfr";
  const tiktok = "https://www.tiktok.com/@mohamed_ashraf327?_r=1&_t=ZS-9BMGDqeFbr2";
  const instagram = "https://www.instagram.com/bazaar_casual_wear";
  const whatsapp = "https://wa.me/201008038041?text=مرحباً%20بزار%20كاجوال%20وير";

  useEffect(() => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "https://bazaar.vercel.app/card";
    QRCode.toDataURL(currentUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#0a0a0f",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("QR Code Error:", err));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "بزار كاجوال وير | BAZAAR Casual Wear",
          text: "كارت بزار كاجوال وير الذكي 1-QR • الفروع، العناوين، والتواصل المباشر",
          url: window.location.href,
        });
      } catch (e) {
        // Ignored
      }
    } else {
      handleCopy();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#121218] to-[#0a0a0f] text-white py-10 px-4 flex justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Top Header & Logo */}
        <div className="text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold mb-3 shadow-lg shadow-amber-500/10">
            <Sparkles size={14} />
            <span>THE ROYAL 1-QR SMART DIGITAL CARD</span>
          </div>
          <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-amber-500 uppercase">
            BAZAAR CASUAL WEAR
          </h1>
          <p className="text-xs text-white/60 mt-1 font-medium">
            براند الشارع المصري الفاخر • خامات قطنية تركي وأوفر سايز عصري
          </p>
        </div>

        {/* 1-QR Code Hero Card */}
        <div className="bg-[#15151e]/80 border border-amber-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl -ml-10 -mb-10" />

          <div className="relative inline-block bg-white p-4 rounded-3xl shadow-2xl border-4 border-amber-400/50 mb-3">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="BAZAAR Casual Wear 1-QR Code"
                className="w-56 h-56 object-contain rounded-xl"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-black font-bold">
                جاري توليد الرمز...
              </div>
            )}
            <div className="absolute inset-x-0 -bottom-3 flex justify-center">
              <span className="bg-[#0a0a0f] text-amber-400 text-[10px] font-black px-4 py-1 rounded-full border border-amber-500 shadow-xl uppercase tracking-wider">
                SCAN FOR EVERYTHING
              </span>
            </div>
          </div>

          <p className="text-xs text-white/70 mt-4 leading-relaxed font-medium">
            امسح الرمز ضوئياً لفتح الكارت الذكي فورياً على هاتفك وحفظ أرقامنا وعناوين فروعنا.
          </p>

          <div className="flex gap-2 mt-5">
            <button
              onClick={handleShare}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Share2 size={16} />
              مشاركة الكارت
            </button>
            <button
              onClick={handleCopy}
              className="bg-white/10 hover:bg-white/15 text-white py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              {copied ? "تم النسخ" : "نسخ الرابط"}
            </button>
          </div>
        </div>

        {/* Action: Open Storefront */}
        <a
          href="/"
          className="w-full bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-xl transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="p-3 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
              <ShoppingBag size={22} />
            </span>
            <div className="text-right">
              <h3 className="font-bold text-sm text-white">تصفح المتجر والكتالوج أونلاين</h3>
              <p className="text-xs text-white/50">شاهد أحدث كولكشن كاجوال وأوفر سايز بالأسعار والمقاسات</p>
            </div>
          </div>
          <ExternalLink size={18} className="text-white/40 group-hover:text-amber-400 transition-colors" />
        </a>

        {/* WhatsApp Direct Order & Customer Care */}
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-emerald-600/20 transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="p-3 bg-black/20 text-white rounded-xl group-hover:scale-110 transition-transform">
              <MessageCircle size={22} />
            </span>
            <div className="text-right">
              <h3 className="font-bold text-sm text-white">شات واتساب المباشر للطلبات والاستفسار</h3>
              <p className="text-xs text-emerald-100/70">تواصل فوري مع فريق المبيعات وخدمة العملاء</p>
            </div>
          </div>
          <ExternalLink size={18} className="text-emerald-200" />
        </a>

        {/* Branches Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <MapPin size={16} />
            <span>فروع بزار كاجوال وير الرسمية</span>
          </h3>

          {/* Branch 1 */}
          <div className="bg-[#14141c] border border-white/10 rounded-2xl p-4 hover:border-amber-500/40 transition-all space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                  الفرع الرئيسي
                </span>
                <h4 className="font-bold text-base text-white mt-1">فرع عباس العقاد</h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1">
                  عباس العقاد بجوار أبو العز السوري وصالون صدام وسنتر علم الدين
                </p>
              </div>
              <span className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl text-lg">🏬</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
              <a
                href={branch1Maps}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[120px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <MapPin size={14} />
                لوكيشن جوجل GPS
              </a>
              <a
                href="tel:01008038041"
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone size={14} />
                01008038041
              </a>
              <a
                href="tel:01210520500"
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone size={14} />
                01210520500
              </a>
            </div>
          </div>

          {/* Branch 2 */}
          <div className="bg-[#14141c] border border-white/10 rounded-2xl p-4 hover:border-amber-500/40 transition-all space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                  الفرع الثاني
                </span>
                <h4 className="font-bold text-base text-white mt-1">فرع أول عباس - كشري التحرير</h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1">
                  أول عباس العقاد شارع كشري التحرير بجوار كافيه طاولة وحلاق طه منصور
                </p>
              </div>
              <span className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl text-lg">🏬</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
              <a
                href={branch2Maps}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[120px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <MapPin size={14} />
                لوكيشن جوجل GPS
              </a>
              <a
                href="tel:01008038041"
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone size={14} />
                01008038041
              </a>
              <a
                href="tel:01008183647"
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone size={14} />
                01008183647
              </a>
            </div>
          </div>
        </div>

        {/* Social Media Channels */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Sparkles size={16} />
            <span>قنوات التواصل والسوشيال ميديا</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={fb1}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/30 text-blue-300 text-xs font-bold flex items-center gap-2.5 transition-all"
            >
              <span className="text-2xl">📘</span>
              <div className="text-right">
                <div>فيسبوك</div>
                <div className="text-[10px] text-white/50">الصفحة الرسمية 1</div>
              </div>
            </a>

            <a
              href={fb2}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/30 text-blue-300 text-xs font-bold flex items-center gap-2.5 transition-all"
            >
              <span className="text-2xl">📘</span>
              <div className="text-right">
                <div>فيسبوك</div>
                <div className="text-[10px] text-white/50">الصفحة الاحتياطية 2</div>
              </div>
            </a>

            <a
              href={tiktok}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2.5 transition-all"
            >
              <span className="text-2xl">🎵</span>
              <div className="text-right">
                <div>تيك توك</div>
                <div className="text-[10px] text-white/50">@mohamed_ashraf327</div>
              </div>
            </a>

            <a
              href={instagram}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-600/15 to-pink-600/15 hover:from-purple-600/25 hover:to-pink-600/25 border border-pink-500/30 text-pink-300 text-xs font-bold flex items-center gap-2.5 transition-all"
            >
              <span className="text-2xl">📸</span>
              <div className="text-right">
                <div>انستجرام</div>
                <div className="text-[10px] text-white/50">@bazaar_casual_wear</div>
              </div>
            </a>
          </div>
        </div>

        {/* Staff & POS Access Portal */}
        <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-white/50">
          <span>© {new Date().getFullYear()} BAZAAR Casual Wear</span>
          <a
            href="/admin"
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold"
          >
            <ShieldCheck size={14} />
            <span>دخول الإدارة ونقاط البيع POS</span>
          </a>
        </div>
      </div>
    </main>
  );
}
