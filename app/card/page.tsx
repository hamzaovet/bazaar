"use client";

import React, { useState } from "react";
import {
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  ShoppingBag,
  ExternalLink,
  Smartphone,
  Printer,
  ChevronLeft,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import PrintableCard from "@/components/PrintableCard";

export default function SmartCardLandingPage() {
  const [copied, setCopied] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const branch1Maps = "https://maps.app.goo.gl/MzCnj5n3mP29uurK6?g_st=ic";
  const branch2Maps = "https://maps.app.goo.gl/SV4L5Xeksm1GTPxGA?g_st=com.google.maps.preview.copy";

  const fb1 = "https://www.facebook.com/share/1Dq8mYkoij/";
  const fb2 = "https://www.facebook.com/profile.php?id=100090095202108&mibextid=wwXIfr";
  const tiktok = "https://www.tiktok.com/@mohamed_ashraf327?_r=1&_t=ZS-9BMGDqeFbr2";
  const instagram = "https://www.instagram.com/bazaar_casual_wear";
  const whatsapp = "https://wa.me/201008038041?text=مرحباً%20بزار%20كاجوال%20وير";

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "بزار كاجوال وير | BAZAAR Casual Wear",
          text: "الملف الرقمي الذكي لماركة بزار كاجوال وير • الفروع والتواصل المباشر والكتالوج",
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
    <main className="min-h-screen bg-gradient-to-b from-[#07070b] via-[#101018] to-[#07070b] text-white py-8 px-4 flex justify-center selection:bg-[#00ff66] selection:text-black font-['Cairo',sans-serif]">
      <div className="w-full max-w-md space-y-5">
        {/* Top Floating Controls */}
        <div className="flex items-center justify-between pb-2">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl transition-all"
          >
            <ChevronLeft size={16} className="rotate-180" />
            <span>الرئيسية</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-amber-500/20 transition-all font-bold"
            >
              <Printer size={14} />
              <span>كارت الطباعة VIP</span>
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70"
              title="مشاركة"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Brand Header with Neon Signage Logo */}
        <div className="text-center py-4 px-6 rounded-3xl bg-black/40 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-[#00ff66]/10 rounded-full blur-3xl pointer-events-none" />

          <BrandLogo size="xl" />

          <p className="text-xs text-white/70 mt-3 font-semibold">
            براند الشارع المصري الفاخر • خامات قطنية تركي وأوفر سايز عصري
          </p>

          <div className="flex justify-center gap-2 mt-4">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
              فرع عباس العقاد
            </span>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#00ff66]/15 border border-[#00ff66]/30 text-[#00ff66]">
              فرع كشري التحرير
            </span>
          </div>
        </div>

        {/* Quick Primary Actions: WhatsApp Order & Online Catalog */}
        <div className="space-y-3">
          {/* WhatsApp Direct Chat */}
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:brightness-110 text-white font-black flex items-center justify-between shadow-xl shadow-emerald-600/20 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-black/30 rounded-xl group-hover:scale-110 transition-transform text-xl">
                💬
              </span>
              <div className="text-right">
                <div className="text-sm">شات واتساب المباشر للطلبات والاستفسار</div>
                <div className="text-[10px] text-emerald-100/80 font-normal">01008038041 • رد فوري</div>
              </div>
            </div>
            <ExternalLink size={16} className="text-emerald-200" />
          </a>

          {/* Browse Storefront Catalog */}
          <a
            href="/"
            className="w-full p-4 rounded-2xl bg-[#14141d] hover:bg-[#181824] border border-amber-500/30 hover:border-amber-400 text-white font-bold flex items-center justify-between shadow-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-110 transition-transform text-xl">
                🛍️
              </span>
              <div className="text-right">
                <div className="text-sm text-white">تصفح المتجر والكتالوج أونلاين</div>
                <div className="text-[10px] text-white/50 font-normal">
                  شاهد أحدث كولكشن تيشرتات، كارجو، هوديز، وبليزرات
                </div>
              </div>
            </div>
            <ExternalLink size={16} className="text-amber-400/70" />
          </a>
        </div>

        {/* Branches GPS Locations & Direct Dialing */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2 px-1">
            <MapPin size={14} />
            <span>فروع بزار كاجوال وير الرسمية بالقاهرة</span>
          </h3>

          {/* Branch 1 */}
          <div className="p-4 rounded-2xl bg-[#12121a] border border-white/10 hover:border-amber-500/40 transition-all space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                  الفرع الرئيسي
                </span>
                <h4 className="font-bold text-sm text-white mt-1">فرع عباس العقاد</h4>
                <p className="text-xs text-white/70 leading-relaxed mt-0.5">
                  عباس العقاد بجوار أبو العز السوري وصالون صدام وسنتر علم الدين
                </p>
              </div>
              <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl text-lg">🏬</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
              <a
                href={branch1Maps}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[120px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <MapPin size={14} />
                <span>لوكيشن جوجل GPS</span>
              </a>
              <a
                href="tel:01008038041"
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone size={14} />
                <span>01008038041</span>
              </a>
              <a
                href="tel:01210520500"
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone size={14} />
                <span>01210520500</span>
              </a>
            </div>
          </div>

          {/* Branch 2 */}
          <div className="p-4 rounded-2xl bg-[#12121a] border border-white/10 hover:border-[#00ff66]/40 transition-all space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold bg-[#00ff66]/20 text-[#00ff66] px-2 py-0.5 rounded-full">
                  الفرع الثاني
                </span>
                <h4 className="font-bold text-sm text-white mt-1">فرع أول عباس - كشري التحرير</h4>
                <p className="text-xs text-white/70 leading-relaxed mt-0.5">
                  أول عباس العقاد شارع كشري التحرير بجوار كافيه طاولة وحلاق طه منصور
                </p>
              </div>
              <span className="p-2 bg-[#00ff66]/10 text-[#00ff66] rounded-xl text-lg">🏬</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
              <a
                href={branch2Maps}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[120px] bg-[#00ff66]/20 hover:bg-[#00ff66]/30 text-[#00ff66] text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <MapPin size={14} />
                <span>لوكيشن جوجل GPS</span>
              </a>
              <a
                href="tel:01008038041"
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone size={14} />
                <span>01008038041</span>
              </a>
              <a
                href="tel:01008183647"
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone size={14} />
                <span>01008183647</span>
              </a>
            </div>
          </div>
        </div>

        {/* Social Media Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white/70 flex items-center gap-2 px-1">
            <Sparkles size={14} className="text-[#00ff66]" />
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
                <div className="text-[9px] text-white/50">الصفحة الرسمية 1</div>
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
                <div className="text-[9px] text-white/50">الصفحة الاحتياطية 2</div>
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
                <div className="text-[9px] text-white/50">@mohamed_ashraf327</div>
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
                <div className="text-[9px] text-white/50">@bazaar_casual_wear</div>
              </div>
            </a>
          </div>
        </div>

        {/* Footer & Staff Access */}
        <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-white/50">
          <span>© {new Date().getFullYear()} BAZAAR Casual Wear</span>
          <a
            href="/admin"
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold"
          >
            <ShieldCheck size={14} />
            <span>لوحة الإدارة ونقاط البيع POS</span>
          </a>
        </div>
      </div>

      {/* Printable Card Modal */}
      {showPrintModal && <PrintableCard onClose={() => setShowPrintModal(false)} />}
    </main>
  );
}
