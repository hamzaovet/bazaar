"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  X,
  Share2,
  Download,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";

interface CardQRModalProps {
  onClose: () => void;
}

export default function CardQRModal({ onClose }: CardQRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"card" | "branches" | "social">("card");

  const branch1Maps = "https://maps.app.goo.gl/MzCnj5n3mP29uurK6?g_st=ic";
  const branch2Maps = "https://maps.app.goo.gl/SV4L5Xeksm1GTPxGA?g_st=com.google.maps.preview.copy";

  const fb1 = "https://www.facebook.com/share/1Dq8mYkoij/";
  const fb2 = "https://www.facebook.com/profile.php?id=100090095202108&mibextid=wwXIfr";
  const tiktok = "https://www.tiktok.com/@mohamed_ashraf327?_r=1&_t=ZS-9BMGDqeFbr2";
  const instagram = "https://www.instagram.com/bazaar_casual_wear";
  const whatsapp = "https://wa.me/201008038041?text=مرحباً%20بزار%20كاجوال%20وير";

  useEffect(() => {
    const cardUrl = typeof window !== "undefined" ? `${window.location.origin}/card` : "https://bazaar.vercel.app/card";
    QRCode.toDataURL(cardUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#0a0a0f",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code Error:", err));
  }, []);

  const handleCopyLink = () => {
    const cardUrl = typeof window !== "undefined" ? `${window.location.origin}/card` : "https://bazaar.vercel.app/card";
    navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    const cardUrl = typeof window !== "undefined" ? `${window.location.origin}/card` : "https://bazaar.vercel.app/card";
    if (navigator.share) {
      try {
        await navigator.share({
          title: "بزار كاجوال وير | BAZAAR Casual Wear",
          text: "كارت بزار كاجوال وير الذكي 1-QR • الفروع، العناوين، والكتالوج العصري",
          url: cardUrl,
        });
      } catch (e) {
        // Ignored
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#101015] border border-amber-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white relative my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 transition-all"
        >
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold mb-2">
            <Sparkles size={14} />
            <span>كارت العلامة التجارية الذكي 1-QR</span>
          </div>
          <h2 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
            BAZAAR CASUAL WEAR
          </h2>
          <p className="text-xs text-white/60 mt-1">بزار كاجوال وير • براند ملابس الشارع الفاخر</p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-5 border border-white/5">
          <button
            onClick={() => setActiveTab("card")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "card"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "text-white/60 hover:text-white"
            }`}
          >
            رمز الـ 1-QR
          </button>
          <button
            onClick={() => setActiveTab("branches")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "branches"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "text-white/60 hover:text-white"
            }`}
          >
            الفروع واللوكيشن
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "social"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "text-white/60 hover:text-white"
            }`}
          >
            السوشيال والتواصل
          </button>
        </div>

        {/* Tab 1: 1-QR Code View */}
        {activeTab === "card" && (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-3xl shadow-2xl border-4 border-amber-400/40 relative group">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="BAZAAR 1-QR Smart Card"
                  className="w-52 h-52 object-contain rounded-xl"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-black font-bold">
                  جاري تجهيز الرمز...
                </div>
              )}
              <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                <span className="bg-[#0a0a0f] text-amber-400 text-[10px] font-black px-3 py-0.5 rounded-full border border-amber-500/50 shadow-md">
                  SCAN FOR EVERYTHING
                </span>
              </div>
            </div>

            <p className="text-xs text-white/60 text-center mt-5 mb-5 px-4 leading-relaxed">
              وجّه كاميرا أي هاتف لمسح الرمز ضوئياً وفتح بطاقة بزار الرقمية الذكية فورياً مع إمكانية تثبيت التطبيق والوصول المباشر للفروع.
            </p>

            <div className="flex gap-2 w-full">
              <button
                onClick={handleShare}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 text-xs transition-all active:scale-95"
              >
                <Share2 size={16} />
                مشاركة الكارت الذكي
              </button>
              <button
                onClick={handleCopyLink}
                className="bg-white/10 hover:bg-white/15 text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                {copied ? "تم النسخ" : "نسخ الرابط"}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Branches & Maps */}
        {activeTab === "branches" && (
          <div className="space-y-4">
            {/* Branch 1 */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-amber-400 text-sm">فرع عباس العقاد الرئيسي</h4>
                  <p className="text-xs text-white/70 mt-1 leading-snug">
                    عباس العقاد بجوار أبو العز السوري وصالون صدام وسنتر علم الدين
                  </p>
                </div>
                <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">📍</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                <a
                  href={branch1Maps}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-[120px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <MapPin size={14} />
                  خرائط جوجل GPS
                </a>
                <a
                  href="tel:01008038041"
                  className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Phone size={14} />
                  اتصال 01008038041
                </a>
              </div>
            </div>

            {/* Branch 2 */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-amber-400 text-sm">فرع أول عباس - كشري التحرير</h4>
                  <p className="text-xs text-white/70 mt-1 leading-snug">
                    أول عباس العقاد شارع كشري التحرير بجوار كافيه طاولة وحلاق طه منصور
                  </p>
                </div>
                <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">📍</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                <a
                  href={branch2Maps}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-[120px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <MapPin size={14} />
                  خرائط جوجل GPS
                </a>
                <a
                  href="tel:01008183647"
                  className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Phone size={14} />
                  اتصال 01008183647
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Social & WhatsApp */}
        {activeTab === "social" && (
          <div className="grid grid-cols-2 gap-3">
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 text-sm transition-all"
            >
              <MessageCircle size={18} />
              واتساب خدمة العملاء والطلبات
            </a>

            <a
              href={fb1}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 text-blue-300 text-xs font-bold flex flex-col items-center justify-center gap-1.5 text-center transition-all"
            >
              <span className="text-xl">📘</span>
              <span>فيسبوك - بزار 1</span>
            </a>

            <a
              href={fb2}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 text-blue-300 text-xs font-bold flex flex-col items-center justify-center gap-1.5 text-center transition-all"
            >
              <span className="text-xl">📘</span>
              <span>فيسبوك - الصفحة 2</span>
            </a>

            <a
              href={tiktok}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 text-center transition-all"
            >
              <span className="text-xl">🎵</span>
              <span>تيك توك @mohamed_ashraf327</span>
            </a>

            <a
              href={instagram}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-pink-500/40 text-pink-300 text-xs font-bold flex flex-col items-center justify-center gap-1.5 text-center transition-all"
            >
              <span className="text-xl">📸</span>
              <span>انستجرام @bazaar_casual_wear</span>
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <a
            href="/card"
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1 font-bold underline underline-offset-4"
          >
            <span>فتح صفحة الكارت الذكي المستقلة الكاملة</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
