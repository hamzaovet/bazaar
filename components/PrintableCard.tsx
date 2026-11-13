"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Printer,
  X,
  Sparkles,
  Radio,
  ShieldCheck,
  MapPin,
  Star,
  Layers,
  Check,
} from "lucide-react";
import BrandLogo from "./BrandLogo";

interface PrintableCardProps {
  settings?: any;
  onClose?: () => void;
}

export default function PrintableCard({ settings, onClose }: PrintableCardProps) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [viewMode, setViewMode] = useState<"stand" | "pocket">("stand");

  useEffect(() => {
    const cardTarget =
      typeof window !== "undefined"
        ? `${window.location.origin}/card`
        : "https://bazaar.vercel.app/card";

    QRCode.toDataURL(cardTarget, {
      width: 400,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 overflow-y-auto">
      {/* ── Dynamic Embedded Print CSS for Stand & Card ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @page {
          size: ${viewMode === "stand" ? "148mm 210mm" : "85mm 55mm"};
          margin: 0 !important;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #000000 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: hidden !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-stand-target,
          #printable-stand-target * {
            visibility: visible !important;
          }
          #printable-stand-target {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: #0a0a0f !important;
          }
        }
      `,
        }}
      />

      <div className="bg-[#101018] border border-amber-500/40 rounded-3xl w-full max-w-2xl shadow-2xl text-white relative my-auto flex flex-col max-h-[95vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-black text-base text-white">
                تصميم ستاند الكاشير وكارت الـ NFC & QR الذكي
              </h3>
              <p className="text-xs text-white/50">
                مطابق لمعايير ستاندات الأكريليك وكروت PVC للدفع الفوري والتواصل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="bg-black/60 border border-white/10 p-1 rounded-xl flex gap-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("stand")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === "stand"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "text-white/60 hover:text-white"
                }`}
              >
                ستاند كاشير NFC
              </button>
              <button
                type="button"
                onClick={() => setViewMode("pocket")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === "pocket"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "text-white/60 hover:text-white"
                }`}
              >
                كارت جيب بلاستيك
              </button>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Realistic Visual Preview Box */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-[#181824]/40">
          {viewMode === "stand" ? (
            /* ── REALISTIC ACRYLIC STAND (مطابق للصورة 2 بالمللي) ── */
            <div
              id="printable-stand-target"
              className="w-[300px] sm:w-[340px] rounded-3xl bg-gradient-to-b from-[#161622] via-[#0b0b12] to-[#050508] border-2 border-white/20 shadow-2xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden"
              style={{
                aspectRatio: "1 / 1.55",
                boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 183, 3, 0.15)",
              }}
            >
              {/* Glossy Acrylic Reflections */}
              <div className="absolute top-0 right-0 w-full h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-[#00ff66]/15 rounded-full blur-3xl pointer-events-none" />

              {/* TOP: Headline & NFC Wave */}
              <div className="space-y-1 relative z-10 w-full">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  إدفع بسرعة وسهولة
                </h2>

                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <div className="w-6 h-[1.5px] bg-gradient-to-r from-transparent to-amber-400" />
                  <Radio size={16} className="text-amber-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-amber-300 tracking-wide">
                    قرب هاتفك للوصول السريع
                  </span>
                  <div className="w-6 h-[1.5px] bg-gradient-to-l from-transparent to-amber-400" />
                </div>
              </div>

              {/* CENTER: High-Res QR Code Card */}
              <div className="my-auto relative z-10">
                <div className="bg-white p-3.5 rounded-2xl shadow-2xl border-2 border-black/10 inline-block">
                  {qrUrl ? (
                    <img
                      src={qrUrl}
                      alt="Bazaar NFC QR"
                      className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                    />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center text-black font-bold text-xs">
                      جاري التوليد...
                    </div>
                  )}
                </div>
                <div className="text-[10px] font-black text-amber-300 font-sans tracking-widest uppercase mt-2">
                  BAZAAR CASUAL WEAR
                </div>
              </div>

              {/* BOTTOM: 5 Mini App Icons Row (Socials, Maps, Reviews, InstaPay, Wallets) */}
              <div className="w-full relative z-10 space-y-3">
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {/* Social Media */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xs shadow-md">
                      📸
                    </div>
                    <span className="text-[7.5px] text-white/70 leading-tight">وسائل التواصل</span>
                  </div>

                  {/* Google Maps */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-xs shadow-md">
                      📍
                    </div>
                    <span className="text-[7.5px] text-white/70 leading-tight">خرائط GPS</span>
                  </div>

                  {/* Google Reviews */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-xl bg-white text-black font-black flex items-center justify-center text-xs shadow-md">
                      G★
                    </div>
                    <span className="text-[7.5px] text-white/70 leading-tight">تقييمات</span>
                  </div>

                  {/* InstaPay */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-600 font-black text-white flex items-center justify-center text-[10px] shadow-md">
                      IP
                    </div>
                    <span className="text-[7.5px] text-white/70 leading-tight">InstaPay</span>
                  </div>

                  {/* Wallets */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-xl bg-red-600 font-black text-white flex items-center justify-center text-[10px] shadow-md">
                      VC
                    </div>
                    <span className="text-[7.5px] text-white/70 leading-tight">المحافظ</span>
                  </div>
                </div>

                {/* Footer Warning Note */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-[9.5px] text-white/80 font-bold">
                  <ShieldCheck size={13} className="text-[#00ff66]" />
                  <span>يرجى إظهار الشاشة بعد التحويل للكاشير</span>
                </div>
              </div>
            </div>
          ) : (
            /* ── POCKET PVC CARD (وجهين) ── */
            <div className="space-y-4 my-2">
              {/* Front */}
              <div className="w-[320px] sm:w-[360px] h-[200px] rounded-2xl bg-gradient-to-br from-[#12121c] via-[#0a0a0f] to-[#12121c] border-2 border-[#ffb703]/60 shadow-2xl p-4 flex flex-col justify-between text-right relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-mono font-black text-[#00ff66] bg-black/60 border border-[#00ff66]/40 px-2 py-0.5 rounded-full">
                    VIP PASS & NFC TAP
                  </span>
                  <span className="text-xs text-[#ffb703] font-bold">THE ROYAL PASS</span>
                </div>

                <div className="my-auto text-center">
                  <BrandLogo size="lg" />
                  <p className="text-[10px] text-white/70 font-semibold mt-2">
                    براند الشارع المصري الفاخر • ملابس كاجوال وأوفر سايز
                  </p>
                </div>

                <div className="flex justify-between items-end text-[9px] text-white/50 font-mono border-t border-white/10 pt-1.5">
                  <span>01008038041 • 01210520500</span>
                  <span className="text-[#00ff66] font-bold">BAZAAR CASUAL WEAR</span>
                </div>
              </div>

              {/* Back */}
              <div className="w-[320px] sm:w-[360px] h-[200px] rounded-2xl bg-[#09090e] border-2 border-[#00ff66]/50 shadow-2xl p-4 flex items-center justify-between text-right">
                <div className="bg-white p-2 rounded-xl shadow-lg shrink-0 text-center">
                  {qrUrl && <img src={qrUrl} alt="Bazaar QR" className="w-24 h-24 object-contain" />}
                  <span className="block text-[7.5px] font-black text-black tracking-wider uppercase mt-0.5">
                    SCAN FOR NFC PROFILE
                  </span>
                </div>

                <div className="flex-1 pr-3 space-y-1 text-white">
                  <h4 className="text-xs font-black text-[#ffb703]">فروع بزار كاجوال وير:</h4>
                  <div className="text-[9px] text-white/80 space-y-0.5 leading-tight">
                    <p>📍 <strong>فرع 1:</strong> عباس العقاد بجوار أبو العز وسنتر علم الدين</p>
                    <p>📍 <strong>فرع 2:</strong> أول عباس شارع كشري التحرير بجوار طاولة</p>
                  </div>
                  <div className="pt-1 text-[8px] text-[#00ff66] font-bold">
                    قرب هاتفك أو امسح الرمز للدفع الفوري وفتح الكتالوج!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-xs"
          >
            <Printer size={16} />
            <span>طباعة {viewMode === "stand" ? "ستاند الكاشير الأكريليك" : "كارت الـ VIP"} الآن</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-5 rounded-xl text-xs"
            >
              إلغاء
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
