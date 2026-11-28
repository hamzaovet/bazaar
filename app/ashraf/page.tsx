"use client";

import React, { useState, useEffect } from "react";
import {
  Crown,
  Lock,
  Unlock,
  DollarSign,
  Truck,
  Percent,
  Tag,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  CreditCard,
  Layers,
  FileText,
  Sparkles,
  ArrowRight,
  LogOut,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  UserCheck,
  PhoneCall,
  Clock,
  Printer,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import Link from "next/link";

export default function MohamedAshrafExecutivePage() {
  const { showToast } = useToast();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");
  const [authenticating, setAuthenticating] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"purchases" | "discounts" | "settings" | "pricing" | "alerts">("purchases");
  const [loading, setLoading] = useState<boolean>(false);

  // Stats Data
  const [stats, setStats] = useState<any>(null);

  // Settings inputs
  const [maxCashierDiscount, setMaxCashierDiscount] = useState<number>(50);
  const [cashierBargainPin, setCashierBargainPin] = useState<string>("1572");
  const [ownerDiscountPin, setOwnerDiscountPin] = useState<string>("112233");
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [submittingPayment, setSubmittingPayment] = useState<boolean>(false);

  // Pricing Matrix State
  const [categoriesSummary, setCategoriesSummary] = useState<any[]>([]);
  const [categoryPricesInput, setCategoryPricesInput] = useState<Record<string, number>>({});
  const [updatingPricing, setUpdatingPricing] = useState<string | null>(null);

  // Check saved session on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("bazaar_ashraf_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      fetchDashboardData();
    }
  }, []);

  // Fetch all dashboard stats
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, priceRes] = await Promise.all([
        fetch("/api/owner/stats"),
        fetch("/api/owner/pricing"),
      ]);

      const [statsData, priceData] = await Promise.all([
        statsRes.json(),
        priceRes.json(),
      ]);

      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
        setMaxCashierDiscount(statsData.stats.maxCashierDiscountPerPiece ?? 50);
        setCashierBargainPin(statsData.stats.cashierBargainPin || "1572");
        setOwnerDiscountPin(statsData.stats.ownerDiscountPin || "112233");
      }

      if (priceData.categoriesSummary) {
        setCategoriesSummary(priceData.categoriesSummary);
        const initPrices: Record<string, number> = {};
        priceData.categoriesSummary.forEach((cat: any) => {
          initPrices[cat.categoryId] = cat.minPrice > 0 ? cat.minPrice : cat.avgCost > 0 ? Math.round(cat.avgCost * 1.35) : 0;
        });
        setCategoryPricesInput(initPrices);
      }
    } catch (e) {
      console.error(e);
      showToast("فشل تحديث بيانات الإدارة", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle PIN verification
  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput) {
      setPinError("يرجى إدخال الكود السري");
      return;
    }

    try {
      setAuthenticating(true);
      setPinError("");

      const res = await fetch(`/api/owner/stats?pin=${encodeURIComponent(pinInput)}`);
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("bazaar_ashraf_auth", "true");
        setIsAuthenticated(true);
        setStats(data.stats);
        setMaxCashierDiscount(data.stats.maxCashierDiscountPerPiece ?? 50);
        setCashierBargainPin(data.stats.cashierBargainPin || "1572");
        setOwnerDiscountPin(data.stats.ownerDiscountPin || "112233");
        showToast("مرحباً بك يا م / محمد أشرف في خزنتك السرية! 👑", "success");
        fetchDashboardData();
      } else {
        setPinError("الكود السري غير صحيح، يرجى المحاولة مرة أخرى");
      }
    } catch (err) {
      setPinError("حدث خطأ في الاتصال بالسيرفر");
    } finally {
      setAuthenticating(false);
    }
  };

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem("bazaar_ashraf_auth");
    setIsAuthenticated(false);
    setPinInput("");
    showToast("تم قفل الخزنة السرية بنجاح 🔒", "info");
  };

  // Keypad Click
  const handleKeypadPress = (num: string) => {
    if (pinInput.length < 8) {
      setPinInput((prev) => prev + num);
      setPinError("");
    }
  };

  const handleKeypadClear = () => {
    setPinInput("");
    setPinError("");
  };

  const handleKeypadBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  // Save Settings
  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxCashierDiscountPerPiece: maxCashierDiscount,
          cashierBargainPin,
          ownerDiscountPin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("تم تحديث وحفظ الأكواد السرية بنجاح! 🔒", "success");
        fetchDashboardData();
      } else {
        showToast(data.error || "فشل حفظ الإعدادات", "error");
      }
    } catch (e) {
      showToast("خطأ في الاتصال بالخادم", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  // Submit Supplier Payment
  const handleSupplierPayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      showToast("يرجى إدخال مبلغ سداد صحيح", "error");
      return;
    }
    try {
      setSubmittingPayment(true);
      const res = await fetch("/api/suppliers/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentAmount,
          paymentMethod,
          notes: paymentNotes || `سداد دفعة نقدية مسجلة من ركن محمد أشرف لفاتورة التوريد #1259`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`تم تسجيل سداد ${paymentAmount.toLocaleString("ar-EG")} ج.م للمورد بنجاح! 💸`, "success");
        setShowPaymentModal(false);
        setPaymentAmount(0);
        setPaymentNotes("");
        fetchDashboardData();
      } else {
        showToast(data.error || "فشل تسجيل الدفعة", "error");
      }
    } catch (e) {
      showToast("خطأ أثناء تسجيل الدفعة", "error");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Update Category Selling Price
  const handleUpdateCategoryPrice = async (categoryId: string, catName: string) => {
    const price = categoryPricesInput[categoryId];
    if (!price || price <= 0) {
      showToast("يرجى إدخال سعر بيع صحيح", "error");
      return;
    }
    try {
      setUpdatingPricing(categoryId);
      const res = await fetch("/api/owner/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          newSellingPrice: price,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`تم تحديث سعر بيع كل موديلات قسم (${catName}) إلى ${price} ج.م فوراً! 🚀`, "success");
        fetchDashboardData();
      } else {
        showToast(data.error || "فشل تحديث السعر", "error");
      }
    } catch (e) {
      showToast("خطأ أثناء تحديث الأسعار", "error");
    } finally {
      setUpdatingPricing(null);
    }
  };

  // Mark all alerts as read
  const handleMarkAllAlertsRead = async () => {
    try {
      await fetch("/api/owner/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_ALL_READ" }),
      });
      showToast("تم تعليم كافة الإشعارات كمقروءة", "info");
      fetchDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // VIEW 1: LOCKED VAULT / PIN ENTRY KEYPAD
  // ═══════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-[#121218]/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Emblem */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/20">
            <div className="w-full h-full bg-[#141208] rounded-[22px] flex items-center justify-center text-4xl">
              👑
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
              <Lock size={12} />
              <span>الخزنة التنفيذية السرية • كود 1259</span>
            </div>
            <h1 className="text-2xl font-black text-white">ركن م / محمد أشرف</h1>
            <p className="text-xs text-white/60 mt-1">
              مساحة خاصة سرية للغاية لإدارة حسابات الموردين، منظومة الفصال، والتسعير الشامل.
            </p>
          </div>

          {/* PIN Input Display */}
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError("");
                }}
                placeholder="أدخل الكود السري (PIN)"
                className="w-full bg-black/60 border border-amber-500/30 focus:border-amber-400 rounded-2xl py-3 px-4 text-center text-2xl font-mono font-bold tracking-[0.4em] text-amber-400 outline-none transition-all placeholder:text-white/20 placeholder:text-sm placeholder:tracking-normal"
                autoFocus
              />
            </div>

            {pinError && (
              <p className="text-red-400 text-xs font-bold animate-in fade-in flex items-center justify-center gap-1">
                <AlertCircle size={13} />
                <span>{pinError}</span>
              </p>
            )}

            {/* Keypad Buttons */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => handleKeypadPress(num)}
                  className="py-3.5 bg-white/5 hover:bg-amber-500/20 active:scale-95 border border-white/10 hover:border-amber-500/40 rounded-2xl text-xl font-bold font-mono text-white transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleKeypadClear}
                className="py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 active:scale-95 border border-red-500/20 rounded-2xl text-xs font-bold transition-all"
              >
                مسح
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress("0")}
                className="py-3.5 bg-white/5 hover:bg-amber-500/20 active:scale-95 border border-white/10 hover:border-amber-500/40 rounded-2xl text-xl font-bold font-mono text-white transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleKeypadBackspace}
                className="py-3.5 bg-white/5 hover:bg-white/10 text-white/70 active:scale-95 border border-white/10 rounded-2xl text-xs font-bold transition-all"
              >
                ⌫
              </button>
            </div>

            <button
              type="submit"
              disabled={authenticating || !pinInput}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-black font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Unlock size={16} />
              <span>{authenticating ? "جاري التحقق..." : "فتح الخزنة السرية"}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 text-[11px] text-white/40 flex items-center justify-between">
            <span>بازار كاجوال وير • سري للغاية</span>
            <Link href="/" className="hover:text-amber-400 transition-colors">
              الرجوع للمتجر الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // VIEW 2: UNLOCKED MOHAMED ASHRAF VIP COMMAND CENTER
  // ═══════════════════════════════════════════════════════════════
  const totalInvoice = stats?.totalInvoiceAmount || 837360;
  const currentDebt = stats?.currentSupplierDebt ?? totalInvoice;
  const totalPaid = stats?.totalPaidToSupplier ?? 0;
  const payPercent = stats?.paymentPercentage ?? 0;
  const totalOwnerDiscounts = stats?.totalOwnerDiscounts ?? 0;
  const unreadAlerts = stats?.unreadAlertsCount ?? 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-8 space-y-6" dir="rtl">
      {/* ── Executive Top Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#141208] via-[#1a170a] to-[#121218] border border-amber-500/40 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-3xl shadow-xl shadow-amber-500/20">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                  الخزنة التنفيذية الحصرية
                </span>
                <span className="text-white/40 text-xs">•</span>
                <span className="text-white/60 text-xs">كود العميل: 1259</span>
                <span className="text-white/40 text-xs">•</span>
                <span className="text-[#00ff66] text-xs font-mono">01008038041</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
                ركن الإدارة التنفيذية — م / محمد أشرف
              </h1>
              <p className="text-xs md:text-sm text-white/60 mt-1 max-w-2xl">
                متابعة فاتورة الشراء المعتمدة (837,360 ج.م)، تدقيق الديون، منظومة الفصال والأكواد السرية، والتسعير الفوري للأقسام.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              <span>تحديث</span>
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <CreditCard size={15} />
              <span>سداد دفعة للمورد 💸</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs font-bold flex items-center gap-1.5"
              title="قفل الخزنة والخروج"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">قفل</span>
            </button>
          </div>
        </div>

        {/* ── Metric Cards Bar ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-amber-500/20">
          {/* Card 1: Verified Invoice Total */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span>الفاتورة المعتمدة (#1259)</span>
              <FileText size={14} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {totalInvoice.toLocaleString("ar-EG")}{" "}
              <span className="text-xs text-white/60">ج.م</span>
            </div>
            <div className="text-[11px] text-[#00ff66] font-bold flex items-center gap-1">
              <CheckCircle size={12} />
              <span>مدققة 100% (46 موديل - 372 قطعة)</span>
            </div>
          </div>

          {/* Card 2: Debt & Paid */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span>المتبقي للمورد (دين قائم)</span>
              <Truck size={14} className="text-red-400" />
            </div>
            <div className="text-2xl font-black text-red-400 font-mono">
              {currentDebt.toLocaleString("ar-EG")}{" "}
              <span className="text-xs text-white/60">ج.م</span>
            </div>
            <div className="text-[11px] text-white/50">
              تم سداد {totalPaid.toLocaleString("ar-EG")} ج ({payPercent}%)
            </div>
          </div>

          {/* Card 3: Owner Personal Discounts (Drawings) */}
          <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span>خصومات محمد أشرف (مسحوبات)</span>
              <Crown size={14} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              {totalOwnerDiscounts.toLocaleString("ar-EG")}{" "}
              <span className="text-xs text-white/60">ج.م</span>
            </div>
            <div className="text-[11px] text-white/50">
              تكريمات للعملاء مخصومة من حسابه
            </div>
          </div>

          {/* Card 4: Unread Alerts */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span>التنبيهات والأكواد السرية</span>
              <AlertCircle size={14} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              {unreadAlerts}{" "}
              <span className="text-xs text-white/60">تنبيه جديد</span>
            </div>
            <div className="text-[11px] text-white/50">
              كود الفصال: {cashierBargainPin} • كود VIP: {ownerDiscountPin}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub Tabs Navigation ── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "purchases", label: "📦 الفاتورة المعتمدة وحساب المورد", icon: Truck },
          { id: "discounts", label: "👑 سجل خصومات ومسحوبات محمد أشرف", icon: Crown },
          { id: "settings", label: "🔒 منظومة الفصال والأكواد السرية", icon: Percent },
          { id: "pricing", label: "🏷️ التسعير السريع للأقسام", icon: Tag },
          { id: "alerts", label: "🔔 التنبيهات وإشعارات الكاشير", icon: AlertCircle, badge: unreadAlerts },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all border whitespace-nowrap ${
                isSelected
                  ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20 font-black"
                  : "bg-white/5 text-white/70 border-white/5 hover:border-white/15 hover:text-white"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB 1: PURCHASES & SUPPLIER DEBT TRACKER
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "purchases" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Audit Verification Card */}
          <div className="p-6 bg-[#121218] border border-white/10 rounded-3xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00ff66]/15 border border-[#00ff66]/30 text-[#00ff66] text-[11px] font-bold">
                    حالة المطابقة: مدققة ومعتمدة 100% 🟢
                  </span>
                  <span className="text-white/40 text-xs">•</span>
                  <span className="text-white/60 text-xs">كود المورد: 1259</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  موقف سداد فاتورة الشراء المعتمدة (#{stats?.purchaseInvoiceNumber || "PUR-INV-1259"})
                </h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow flex items-center gap-1.5 self-start"
              >
                <DollarSign size={14} />
                <span>سداد دفعة جديدة للمورد</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#00ff66] font-bold">
                  المدفوع: {totalPaid.toLocaleString("ar-EG")} ج.م ({payPercent}%)
                </span>
                <span className="text-red-400 font-bold">
                  المتبقي: {currentDebt.toLocaleString("ar-EG")} ج.م
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-3.5 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="bg-gradient-to-r from-amber-500 to-[#00ff66] h-full rounded-full transition-all duration-500 shadow"
                  style={{ width: `${Math.max(3, payPercent)}%` }}
                />
              </div>
            </div>

            {/* Breakdown by Category */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs space-y-1">
                <span className="text-white/50 block">🧥 الجاكيت (24 موديل)</span>
                <span className="text-sm font-bold text-white font-mono">394,400 ج.م</span>
                <span className="text-[10px] text-white/40 block">128 قطعة (1,350 - 4,950 ج)</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs space-y-1">
                <span className="text-white/50 block">🏃 ترنج ووتر بروف (8 موديلات)</span>
                <span className="text-sm font-bold text-white font-mono">191,350 ج.م</span>
                <span className="text-[10px] text-white/40 block">89 قطعة (سعر 2,150 ج)</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs space-y-1">
                <span className="text-white/50 block">🏃 ترنج ماركات (2 موديل)</span>
                <span className="text-sm font-bold text-amber-300 font-mono">44,000 ج.م</span>
                <span className="text-[10px] text-white/40 block">16 قطعة (3,100 - 3,150 ج)</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs space-y-1">
                <span className="text-white/50 block">🧶 تريكو وبنطلون (12 موديل)</span>
                <span className="text-sm font-bold text-white font-mono">207,610 ج.م</span>
                <span className="text-[10px] text-white/40 block">139 قطعة (1,280 - 1,750 ج)</span>
              </div>
            </div>
          </div>

          {/* Verification Report Card (Audit) */}
          <div className="p-6 bg-gradient-to-r from-emerald-950/20 to-black/40 border border-emerald-500/30 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
              <ShieldCheck size={18} />
              <span>تقرير الفحص والتدقيق الحسابي التلقائي (تقرير المعلمين)</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              تم إجراء مطابقة رياضية شاملة لكافة أسطر الفاتورة الورقية الخاصة بكود العميل 1259:
              إجمالي الأصناف المعتمدة: <strong>46 موديلاً</strong>، إجمالي عدد القطع: <strong>372 قطعة</strong>،
              إجمالي القيمة: <strong>837,360 ج.م</strong>. لا توجد أي فروقات حسابية أو أخطاء جمع. حالة الفاتورة: مطابقة 100%.
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 2: MOHAMED ASHRAF PERSONAL DRAWINGS & DISCOUNTS
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "discounts" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-[#121218] border border-amber-500/30 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-black text-white">سجل الخصومات الشخصية وتكريمات محمد أشرف VIP</h3>
                <p className="text-xs text-white/50">
                  جميع الخصومات التي تمت عبر كود VIP الحصري ({ownerDiscountPin}) والتي تُسجل كمسحوبات شخصية
                </p>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left">
                <span className="text-[11px] text-white/50 block">إجمالي الخصومات الشخصية</span>
                <span className="text-lg font-black text-amber-300 font-mono">
                  {totalOwnerDiscounts.toLocaleString("ar-EG")} ج.م
                </span>
              </div>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/5 text-white/60 font-semibold border-b border-white/10">
                  <tr>
                    <th className="p-3">الفاتورة</th>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">العميل</th>
                    <th className="p-3">الكاشير</th>
                    <th className="p-3">خصم الكاشير</th>
                    <th className="p-3">خصم محمد أشرف (VIP)</th>
                    <th className="p-3">الصافي بعد الخصم</th>
                    <th className="p-3">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {(!stats?.invoicesWithDiscounts || stats.invoicesWithDiscounts.length === 0) ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-white/40 font-sans">
                        لم يتم تسجيل أي خصومات بكود VIP حتى الآن. سيظهر هنا كل خصم يُمنح بكود محمد أشرف الحصري.
                      </td>
                    </tr>
                  ) : (
                    stats.invoicesWithDiscounts.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-bold text-white font-sans">{inv.invoiceNumber}</td>
                        <td className="p-3 text-white/50 font-sans">
                          {new Date(inv.createdAt).toLocaleString("ar-EG")}
                        </td>
                        <td className="p-3 text-white/80 font-sans">
                          {inv.customer ? `${inv.customer.name || ""} (${inv.customer.phone || ""})` : "عميل نقدي"}
                        </td>
                        <td className="p-3 text-white/70 font-sans">{inv.cashierUser?.name || "الكاشير"}</td>
                        <td className="p-3 text-[#00ff66] font-bold">
                          {inv.cashierDiscount ? `${inv.cashierDiscount} ج` : "-"}
                        </td>
                        <td className="p-3 text-amber-400 font-black">
                          {inv.ownerDiscount ? `${inv.ownerDiscount} ج` : "-"}
                        </td>
                        <td className="p-3 text-white font-bold">{inv.finalTotal} ج</td>
                        <td className="p-3 text-white/50 font-sans">{inv.discountNotes || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 3: BARGAINING POLICY & SECRET DISCOUNT CODES
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "settings" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-[#121218] border border-amber-500/30 rounded-3xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl">
                🔒
              </div>
              <div>
                <h3 className="text-lg font-black text-white">إعدادات سياسة الفصال والأكواد السرية (المعلمة)</h3>
                <p className="text-xs text-white/60">
                  تحديد سقف خصم الكاشير المباشر، وتعيين الأكواد السرية لفك الخصومات والتنبيهات اللحظية.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Setting 1: Max Cashier Discount Per Piece */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">حد خصم الكاشير (لكل قطعة):</span>
                  <span className="text-amber-400 text-xs font-mono font-bold">ج.م</span>
                </div>
                <p className="text-[11px] text-white/50">
                  الحد الأقصى التلقائي المسموح به للكاشير. يُضرب في عدد قطع السلة، وإذا تجاوز الكاشير هذا الرقم يرفض السيستم إلا بكود الفصال.
                </p>
                <input
                  type="number"
                  min={0}
                  value={maxCashierDiscount}
                  onChange={(e) => setMaxCashierDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl py-2 px-3 text-lg font-mono font-black text-amber-400 text-center outline-none"
                />
              </div>

              {/* Setting 2: Cashier Bargain PIN */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">كود الفصال السري للكاشير:</span>
                  <span className="text-[#00ff66] text-xs font-mono font-bold">PIN</span>
                </div>
                <p className="text-[11px] text-white/50">
                  الكود الذي يُعطى للكاشير لفك سقف الخصم عندما يُصر العميل على الفصال الإضافي.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={cashierBargainPin}
                  onChange={(e) => setCashierBargainPin(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#00ff66] rounded-xl py-2 px-3 text-lg font-mono font-black text-[#00ff66] text-center outline-none tracking-widest"
                />
              </div>

              {/* Setting 3: Mohamed Ashraf VIP Master Discount PIN */}
              <div className="p-4 bg-white/5 border border-amber-500/30 rounded-2xl space-y-2 bg-amber-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300">كود محمد أشرف السري (Master PIN):</span>
                  <span className="text-amber-400 text-xs font-mono font-bold">👑 Master</span>
                </div>
                <p className="text-[11px] text-white/60">
                  كود حصري لمحمد أشرف، يتيح فتح هذه الصفحة ويمنح خصم تكريمي يظهر باسمه في الفاتورة ويخصم تلقائياً من حسابه الشخصي.
                </p>
                <input
                  type="text"
                  maxLength={8}
                  value={ownerDiscountPin}
                  onChange={(e) => setOwnerDiscountPin(e.target.value)}
                  className="w-full bg-black/60 border border-amber-500/40 focus:border-amber-400 rounded-xl py-2 px-3 text-lg font-mono font-black text-amber-300 text-center outline-none tracking-widest"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Lock size={14} />
                <span>{savingSettings ? "جاري الحفظ..." : "حفظ وتثبيت إعدادات الأكواد السرية"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 4: FAST DYNAMIC CATEGORY PRICING MATRIX
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "pricing" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-[#121218] border border-white/10 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white">التسعير الديناميكي السريع للأقسام (بضغطة واحدة)</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  تحديد سعر بيع موحد لكل قسم وتطبيقه على كافة الموديلات والمقاسات دفعة واحدة!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {categoriesSummary.map((cat) => {
                const currentPriceInput = categoryPricesInput[cat.categoryId] || 0;
                const estimatedProfit = currentPriceInput > 0 && cat.avgCost > 0 ? currentPriceInput - cat.avgCost : 0;
                const profitMargin = currentPriceInput > 0 ? Math.round((estimatedProfit / currentPriceInput) * 100) : 0;

                return (
                  <div
                    key={cat.categoryId}
                    className="p-5 bg-white/5 border border-white/10 hover:border-amber-500/40 rounded-2xl space-y-4 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {cat.slug?.includes("jacket") ? "🧥" : cat.slug?.includes("suit") ? "🏃" : cat.slug?.includes("pants") ? "👖" : "🧶"}
                        </span>
                        <div>
                          <h4 className="font-bold text-white text-sm">{cat.categoryName}</h4>
                          <span className="text-[11px] text-white/50">{cat.totalProducts} موديل ({cat.totalVariants} مقاس)</span>
                        </div>
                      </div>
                    </div>

                    {/* Cost Breakdown (Confidential) */}
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1.5 text-xs">
                      <div className="flex justify-between text-white/60">
                        <span>متوسط التكلفة (سر حربي):</span>
                        <span className="font-mono font-bold text-white">{cat.avgCost} ج.م</span>
                      </div>
                      <div className="flex justify-between text-white/40 text-[11px]">
                        <span>نطاق تكلفة الفاتورة:</span>
                        <span className="font-mono">{cat.minCost} - {cat.maxCost} ج.م</span>
                      </div>
                      <div className="flex justify-between text-white/40 text-[11px]">
                        <span>سعر البيع الحالي:</span>
                        <span className="font-mono text-amber-400 font-bold">{cat.minPrice > 0 ? `${cat.minPrice} ج.م` : "لم يُحدد"}</span>
                      </div>
                    </div>

                    {/* Selling Price Input & 1-Click Update */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-white/80 block">
                        تحديد سعر البيع الموحد (ج.م):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          value={currentPriceInput || ""}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCategoryPricesInput((prev) => ({ ...prev, [cat.categoryId]: val }));
                          }}
                          placeholder="سعر البيع"
                          className="flex-1 bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl py-2 px-3 text-sm font-mono font-bold text-amber-400 text-center outline-none"
                        />
                        <button
                          onClick={() => handleUpdateCategoryPrice(cat.categoryId, cat.categoryName)}
                          disabled={updatingPricing === cat.categoryId}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow active:scale-95 transition-all flex items-center gap-1"
                        >
                          {updatingPricing === cat.categoryId ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <Sparkles size={13} />
                          )}
                          <span>تطبيق</span>
                        </button>
                      </div>

                      {/* Profit Simulation */}
                      {estimatedProfit > 0 && (
                        <div className="flex items-center justify-between text-[11px] text-[#00ff66] font-mono px-1">
                          <span>المكسب المقدر للقطعة:</span>
                          <span className="font-bold">+{estimatedProfit} ج.م ({profitMargin}%)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 5: OWNER ALERTS & REAL-TIME CASHIER AUDIT
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "alerts" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-[#121218] border border-white/10 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-black text-white">سجل التنبيهات والأكواد السرية اللحظي</h3>
                <p className="text-xs text-white/50">
                  إشعار فوري عند تفعيل كود فصال الكاشير، كود خصم محمد أشرف VIP، أو تسجيل حجز أونلاين بديبوزيت
                </p>
              </div>
              {unreadAlerts > 0 && (
                <button
                  onClick={handleMarkAllAlertsRead}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70 hover:text-white font-bold transition-all"
                >
                  تحديد الكل كمقروء
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(!stats?.alerts || stats.alerts.length === 0) ? (
                <div className="p-8 text-center text-white/40 text-xs">
                  لا توجد تنبيهات حالية في السجل
                </div>
              ) : (
                stats.alerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2 ${
                      !alert.isRead
                        ? "bg-amber-500/10 border-amber-500/40"
                        : "bg-white/5 border-white/5 opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {alert.type?.includes("OWNER")
                            ? "👑"
                            : alert.type?.includes("BARGAIN")
                            ? "🏷️"
                            : alert.type?.includes("BOOKING")
                            ? "📦"
                            : "🔔"}
                        </span>
                        <h4 className="font-bold text-white text-sm">{alert.title}</h4>
                      </div>
                      <span className="text-[11px] text-white/40 font-mono">
                        {new Date(alert.createdAt).toLocaleString("ar-EG")}
                      </span>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed pr-6">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Supplier Payment / Debt Settlement ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#121218] border border-amber-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
                  💸
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">تسجيل سداد دفعة للمورد</h4>
                  <p className="text-[11px] text-white/50">فاتورة التوريد المعتمدة (#1259)</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">مبلغ السداد (ج.م):</label>
                <input
                  type="number"
                  min={1}
                  value={paymentAmount || ""}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  placeholder="المبلغ المسدد"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#00ff66] rounded-xl py-2 px-3 text-lg font-mono font-bold text-[#00ff66] text-center outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">طريقة السداد:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-white outline-none"
                >
                  <option value="CASH">نقداً من الخزينة (كاش)</option>
                  <option value="INSTAPAY">تحويل إنستاباي (InstaPay)</option>
                  <option value="BANK_TRANSFER">تحويل بنكي</option>
                  <option value="VODAFONE_CASH">فودافون كاش</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">بيان وملاحظات السداد:</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="مثال: دفعة من حساب التوريد - إيصال استلام نقدية"
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-white outline-none"
                >
                </input>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleSupplierPayment}
                disabled={submittingPayment || !paymentAmount}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded-xl shadow active:scale-95 transition-all"
              >
                {submittingPayment ? "جاري التسجيل..." : "تأكيد تسجيل السداد"}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Footer Links ── */}
      <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/60">
        <div className="flex items-center gap-3">
          <Link href="/pos" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
            <ShoppingBag size={14} />
            <span>نقطة البيع (POS)</span>
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
            <ExternalLink size={14} />
            <span>معاينة المتجر الرئيسي</span>
          </Link>
          <span>•</span>
          <Link href="/admin" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
            <Layers size={14} />
            <span>لوحة الإدارة العامة</span>
          </Link>
        </div>
        <div>
          <span>بازار كاجوال وير • الإصدار التنفيذي 2026</span>
        </div>
      </div>
    </div>
  );
}
