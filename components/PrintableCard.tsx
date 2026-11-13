"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Printer, Download, X, Sparkles } from "lucide-react";
import BrandLogo from "./BrandLogo";

interface PrintableCardProps {
  onClose?: () => void;
}

export default function PrintableCard({ onClose }: PrintableCardProps) {
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    const cardTarget = typeof window !== "undefined" ? `${window.location.origin}/card` : "https://bazaar.vercel.app/card";
    QRCode.toDataURL(cardTarget, {
      width: 260,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => setQrUrl(url))
      .catch((e) => console.error(e));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#101018] border border-amber-500/30 rounded-3xl p-6 w-full max-w-xl shadow-2xl text-white relative my-6">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 transition-all"
          >
            <X size={20} />
          </button>
        )}

        <div className="text-center pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold mb-2">
            <Sparkles size={14} />
            <span>تصميم كارت المحل الذكي VIP المخصص للطباعة</span>
          </div>
          <h3 className="text-xl font-black text-white">بطاقة عملاء بزار كاجوال وير 1-QR</h3>
          <p className="text-xs text-white/50">جاهزة للطباعة على ورق مقوى أو كروت بلاستيك NFC</p>
        </div>

        {/* Printable Card Container (Front & Back) */}
        <div id="printable-receipt" className="space-y-4 my-2">
          {/* Card Front */}
          <div className="w-[340px] sm:w-[380px] h-[210px] sm:h-[230px] mx-auto rounded-2xl bg-gradient-to-br from-[#12121c] via-[#0a0a0f] to-[#12121c] border-2 border-[#ffb703]/60 shadow-2xl p-5 flex flex-col justify-between relative overflow-hidden text-right">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00ff66]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono font-black text-[#00ff66] bg-black/50 border border-[#00ff66]/40 px-2 py-0.5 rounded-full">
                VIP SMART CARD
              </span>
              <span className="text-xs text-[#ffb703] font-bold">THE ROYAL PASS</span>
            </div>

            {/* Central Neon Logo */}
            <div className="my-auto text-center">
              <BrandLogo size="lg" />
              <p className="text-[10px] text-white/60 font-semibold tracking-wider mt-2">
                براند الشارع المصري الفاخر • عباس العقاد
              </p>
            </div>

            <div className="flex justify-between items-end text-[9px] text-white/50 font-mono border-t border-white/10 pt-2">
              <span>01008038041 • 01210520500</span>
              <span className="text-[#00ff66] font-bold">BAZAAR CASUAL WEAR</span>
            </div>
          </div>

          {/* Card Back */}
          <div className="w-[340px] sm:w-[380px] h-[210px] sm:h-[230px] mx-auto rounded-2xl bg-[#09090e] border-2 border-[#00ff66]/50 shadow-2xl p-5 flex items-center justify-between relative overflow-hidden">
            {/* Left: QR Code */}
            <div className="bg-white p-2 rounded-xl shadow-lg border border-black/20 text-center flex-shrink-0">
              {qrUrl ? (
                <img src={qrUrl} alt="Bazaar QR" className="w-28 h-28 object-contain" />
              ) : (
                <div className="w-28 h-28 flex items-center justify-center text-black font-bold text-xs">
                  جاري التوليد...
                </div>
              )}
              <span className="block text-[8px] font-black text-black tracking-wider uppercase mt-1">
                SCAN FOR SMART PROFILE
              </span>
            </div>

            {/* Right: Info & Branches */}
            <div className="text-right flex-1 pr-4 space-y-1.5 text-white">
              <h4 className="text-xs font-black text-[#ffb703]">فروع بزار كاجوال وير:</h4>
              <div className="text-[9px] text-white/80 leading-snug space-y-1">
                <p>📍 <strong>فرع 1:</strong> عباس العقاد بجوار أبو العز وسنتر علم الدين</p>
                <p>📍 <strong>فرع 2:</strong> أول عباس شارع كشري التحرير بجوار كافيه طاولة</p>
              </div>

              <div className="pt-1 border-t border-white/10 text-[8px] text-white/50 space-y-0.5">
                <p>📱 واتساب ومبيعات: 01008038041</p>
                <p>📸 فيسبوك وانستجرام وتيك توك: @bazaar_casual_wear</p>
              </div>

              <div className="pt-1 text-[8px] text-[#00ff66] font-bold">
                امسح الرمز لفتح الكتالوج وخرائط الفروع والطلب الفوري!
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-[#00ff66] hover:brightness-110 text-black font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-xs"
          >
            <Printer size={18} />
            <span>طباعة وجهي الكارت الآن (Print Card)</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-4 rounded-xl text-xs"
            >
              إغلاق
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
