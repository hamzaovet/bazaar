"use client";

import React, { useEffect, useState } from "react";
import { Download, Monitor, CheckCircle, Sparkles, X, Smartphone, Info, Apple, QrCode } from "lucide-react";

interface PwaInstallButtonProps {
  className?: string;
  variant?: "button" | "banner" | "compact";
  showPlatformLabel?: boolean;
}

export default function PwaInstallButton({
  className = "",
  variant = "button",
  showPlatformLabel = true,
}: PwaInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"MOBILE" | "WINDOWS">("MOBILE");
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already in standalone app mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallSuccess(true);
      setDeferredPrompt(null);
      setTimeout(() => setInstallSuccess(false), 5000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleMobileInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setIsInstalled(true);
          setInstallSuccess(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else {
      setActiveTab("MOBILE");
      setShowHelpModal(true);
    }
  };

  const openModal = (tab: "MOBILE" | "WINDOWS" = "MOBILE") => {
    setActiveTab(tab);
    setShowHelpModal(true);
  };

  // If already running inside installed standalone app, hide button
  if (isInstalled && !installSuccess) {
    return null;
  }

  return (
    <>
      {variant === "compact" ? (
        <button
          type="button"
          onClick={() => openModal("MOBILE")}
          className={`px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer ${className}`}
          title="تثبيت تطبيق بازار على الهاتف أو الكمبيوتر"
        >
          <Smartphone size={14} />
          <span>تثبيت التطبيق (موبايل وديسكتوب) 📲</span>
        </button>
      ) : variant === "banner" ? (
        <div
          className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#181510] via-[#12121a] to-[#181510] border border-amber-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 ${className}`}
        >
          <div className="flex items-center gap-3.5 text-right w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/50 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Smartphone size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-black text-white">
                  تطبيق بازار كاجوال وير VIP (موبايل وكمبيوتر)
                </h4>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40 font-bold">
                  أندرويد • آيفون • ويندوز
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1">
                تصفح الكاتالوج واطلب أونلاين أو افتح الكاشير مباشرة من شاشة هاتفك أو سطح المكتب بدون متصفح!
              </p>
            </div>
          </div>

          {/* Action Buttons for Mobile AND Windows */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
            {/* Phone App Button */}
            <button
              type="button"
              onClick={() => openModal("MOBILE")}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Smartphone size={16} />
              <span>📱 تثبيت تطبيق الموبايل</span>
            </button>

            {/* Windows Desktop App Button */}
            <button
              type="button"
              onClick={() => openModal("WINDOWS")}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Monitor size={16} />
              <span>💻 برنامج الكمبيوتر (ويندوز)</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => openModal("MOBILE")}
          className={`px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer ${className}`}
        >
          <Smartphone size={15} />
          <span>تنزيل تطبيق بازار (موبايل وديسكتوب) 📲</span>
        </button>
      )}

      {/* Success Notification */}
      {installSuccess && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-white flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <CheckCircle className="text-emerald-400" size={20} />
          <div>
            <div className="text-xs font-black text-white">تم تثبيت التطبيق بنجاح! 🎉</div>
            <div className="text-[10px] text-white/70">
              أيقونة بازار كاجوال وير أصبحت الآن على شاشتك الرئيسية.
            </div>
          </div>
        </div>
      )}

      {/* Multi-Platform Install Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-amber-500/40 rounded-3xl w-full max-w-lg p-6 shadow-2xl text-white relative space-y-4 animate-in fade-in zoom-in-95 duration-200 text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Smartphone size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    تنزيل تطبيق بازار كاجوال وير VIP
                  </h3>
                  <p className="text-[11px] text-white/50">اختر نوع جهازك لتثبيت التطبيق فوراً</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Platform Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-black/50 p-1.5 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("MOBILE")}
                className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "MOBILE"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Smartphone size={16} />
                <span>تطبيق الموبايل (أندرويد وآيفون)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("WINDOWS")}
                className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "WINDOWS"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Monitor size={16} />
                <span>برنامج الويندوز (سطح المكتب)</span>
              </button>
            </div>

            {/* Tab 1: MOBILE INSTALLATION */}
            {activeTab === "MOBILE" && (
              <div className="space-y-3.5 text-xs text-white/80 animate-in fade-in duration-150">
                {/* Android Direct One-click Install */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="font-black text-emerald-400 flex items-center gap-2">
                    <Smartphone size={16} />
                    <span>لأجهزة أندرويد (Samsung, Xiaomi, Oppo...):</span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    اضغط الزر أدناه لتثبيت تطبيق بازار فوراً على شاشتك الرئيسية، أو اضغط قائمة المتصفح (⋮) واختر <strong>"تثبيت التطبيق"</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={handleMobileInstall}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download size={15} />
                    <span>تثبيت التطبيق على هاتف أندرويد الآن 📱</span>
                  </button>
                </div>

                {/* iPhone / iOS Direct Guidance */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="font-black text-amber-300 flex items-center gap-2">
                    <Apple size={16} />
                    <span>لأجهزة الآيفون والآيباد (Apple iOS):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-white/75 pr-1">
                    <li>افتح رابط الموقع في متصفح <strong>Safari</strong> الرسمي.</li>
                    <li>اضغط على زر <strong>المشاركة (Share ⬆️)</strong> في شريط سفلي بالمتصفح.</li>
                    <li>مرر للأسفل واضغط على <strong>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen ➕)</strong>.</li>
                    <li>اضغط <strong>إضافة (Add)</strong>، وسيظهر تطبيق بازار فوراً بجوار تطبيقاتك!</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Tab 2: WINDOWS DESKTOP INSTALLATION */}
            {activeTab === "WINDOWS" && (
              <div className="space-y-3.5 text-xs text-white/80 animate-in fade-in duration-150">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-black/60 border border-amber-500/30 space-y-2.5">
                  <div className="font-black text-amber-300 text-xs flex items-center gap-2">
                    <Monitor size={16} />
                    <span>أداة تثبيت الويندوز الفورية (Install-Bazaar-VIP.bat):</span>
                  </div>
                  <p className="text-[11px] text-white/70 leading-relaxed">
                    حمل أداة التثبيت بنقرة واحدة، وبمجرد تشغيلها ستنشئ أيقونة <strong>بازار كاجوال وير VIP</strong> الرسمية على سطح المكتب وقائمة Start، وتفتح المتجر في نافذة مستقلة كاملة الشاشة بدون شريط متصفح!
                  </p>
                  <a
                    href="/api/desktop-installer"
                    download="Install-Bazaar-VIP.bat"
                    className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-center cursor-pointer"
                  >
                    <Download size={16} />
                    <span>تحميل أداة تثبيت الديسكتوب (Install-Bazaar-VIP.bat) 💻</span>
                  </a>
                </div>

                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1 text-[11px] text-white/70">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Info size={14} />
                    <span>أو التثبيت المباشر من متصفح Chrome / Edge:</span>
                  </div>
                  <p>
                    اضغط على أيقونة التثبيت الصغيرة <strong>(شاشة كمبيوتر مع سهم 💻)</strong> الموجودة في نهاية شريط العنوان (URL bar) بالأعلى، ثم اختر <strong>"تثبيت (Install)"</strong>.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}
    </>
  );
}
