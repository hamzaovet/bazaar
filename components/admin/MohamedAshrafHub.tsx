"use client";

import React, { useState, useEffect } from "react";
import {
  Crown,
  DollarSign,
  Truck,
  Percent,
  Tag,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Clock,
  CreditCard,
  Layers,
  Send,
  Eye,
  FileText,
  Lock,
  ChevronDown,
  Sparkles,
  Search,
} from "lucide-react";
import { useToast } from "@/components/Toast";

interface MohamedAshrafHubProps {
  onRefreshData?: () => void;
}

export default function MohamedAshrafHub({ onRefreshData }: MohamedAshrafHubProps) {
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<"purchases" | "discounts" | "pricing" | "alerts">("purchases");
  const [loading, setLoading] = useState<boolean>(true);

  // Settings State
  const [settings, setSettings] = useState<any>(null);
  const [maxCashierDiscountInput, setMaxCashierDiscountInput] = useState<number>(50);
  const [cashierBargainPinInput, setCashierBargainPinInput] = useState<string>("1572");
  const [ownerDiscountPinInput, setOwnerDiscountPinInput] = useState<string>("112233");
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Supplier & Purchases State
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [supplierTransactions, setSupplierTransactions] = useState<any[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<any[]>([]);
  const [currentVerifiedInvoice, setCurrentVerifiedInvoice] = useState<any>(null);

  // Supplier Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [submittingPayment, setSubmittingPayment] = useState<boolean>(false);

  // Pricing Matrix State
  const [categoriesSummary, setCategoriesSummary] = useState<any[]>([]);
  const [categoryPricesInput, setCategoryPricesInput] = useState<Record<string, number>>({});
  const [updatingPricing, setUpdatingPricing] = useState<string | null>(null);

  // Owner Alerts State
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Fetch all hub data
  const loadHubData = async () => {
    try {
      setLoading(true);
      const [sRes, supRes, purRes, alertsRes, priceRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/suppliers"),
        fetch("/api/purchases"),
        fetch("/api/owner/alerts"),
        fetch("/api/owner/pricing"),
      ]);

      const [sData, supData, purData, aData, pData] = await Promise.all([
        sRes.json(),
        supRes.json(),
        purRes.json(),
        alertsRes.json(),
        priceRes.json(),
      ]);

      if (sData.settings) {
        setSettings(sData.settings);
        setMaxCashierDiscountInput(sData.settings.maxCashierDiscountPerPiece ?? 50);
        setCashierBargainPinInput(sData.settings.cashierBargainPin || "1572");
        setOwnerDiscountPinInput(sData.settings.ownerDiscountPin || "112233");
      }

      if (supData.suppliers) {
        setSuppliers(supData.suppliers);
        const mainSup = supData.suppliers.find((s: any) => s.code === "1259" || s.phone === "01008038041") || supData.suppliers[0];
        setSelectedSupplier(mainSup);
        if (mainSup) loadSupplierLedger(mainSup.id);
      }

      if (purData.purchases) {
        setPurchaseInvoices(purData.purchases);
        const verified = purData.purchases.find((p: any) => p.invoiceNumber === "PUR-INV-1259") || purData.purchases[0];
        setCurrentVerifiedInvoice(verified);
      }

      if (aData.alerts) {
        setAlerts(aData.alerts);
        setUnreadCount(aData.unreadCount || 0);
      }

      if (pData.categoriesSummary) {
        setCategoriesSummary(pData.categoriesSummary);
        const initPrices: Record<string, number> = {};
        pData.categoriesSummary.forEach((cat: any) => {
          initPrices[cat.categoryId] = cat.minPrice > 0 ? cat.minPrice : cat.avgCost > 0 ? Math.round(cat.avgCost * 1.35) : 0;
        });
        setCategoryPricesInput(initPrices);
      }
    } catch (e) {
      console.error("Hub data load error:", e);
      showToast("فشل تحميل بيانات ركن محمد أشرف", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierLedger = async (supId: string) => {
    try {
      const res = await fetch(`/api/suppliers/transactions?supplierId=${supId}`);
      const data = await res.json();
      if (data.transactions) setSupplierTransactions(data.transactions);
      if (data.supplier) setSelectedSupplier(data.supplier);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHubData();
  }, []);

  // Save Settings
  const handleSaveDiscountSettings = async () => {
    try {
      setSavingSettings(true);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxCashierDiscountPerPiece: maxCashierDiscountInput,
          cashierBargainPin: cashierBargainPinInput,
          ownerDiscountPin: ownerDiscountPinInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("تم حفظ وتحديث إعدادات الفصال والأكواد السرية بنجاح! 🔒", "success");
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
    if (!selectedSupplier || !paymentAmount || paymentAmount <= 0) {
      showToast("يرجى إدخال مبلغ سداد صحيح للمورد", "error");
      return;
    }
    try {
      setSubmittingPayment(true);
      const res = await fetch("/api/suppliers/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: selectedSupplier.id,
          amount: paymentAmount,
          paymentMethod,
          notes: paymentNotes || `سداد دفعة نقدية من فاتورة الشراء المعتمدة #${currentVerifiedInvoice?.invoiceNumber || "1259"}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`تم تسجيل سداد مبلغ ${paymentAmount.toLocaleString("ar-EG")} ج.م للمورد بنجاح! 💸`, "success");
        setShowPaymentModal(false);
        setPaymentAmount(0);
        setPaymentNotes("");
        loadSupplierLedger(selectedSupplier.id);
        if (onRefreshData) onRefreshData();
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
        loadHubData();
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
      setUnreadCount(0);
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      showToast("تم تحديد جميع التنبيهات كمقروءة", "info");
    } catch (e) {
      console.error(e);
    }
  };

  // Verified Supplier Invoice Stats
  const totalInvoiceAmount = currentVerifiedInvoice?.totalAmount || 837360;
  const currentTotalDebt = selectedSupplier?.totalDebt ?? totalInvoiceAmount;
  const totalPaidToSupplier = Math.max(0, totalInvoiceAmount - currentTotalDebt);
  const paymentPercentage = totalInvoiceAmount > 0 ? Math.min(100, Math.round((totalPaidToSupplier / totalInvoiceAmount) * 100)) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── Executive Header: Mohamed Ashraf Command Bar ── */}
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
                  مركز القيادة التنفيذي الحصري
                </span>
                <span className="text-white/40 text-xs">•</span>
                <span className="text-white/60 text-xs">كود العميل: 1259</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
                ركن الإدارة التنفيذية — م / محمد أشرف
              </h1>
              <p className="text-xs md:text-sm text-white/60 mt-1 max-w-2xl">
                متابعة فاتورة الشراء المعتمدة (837,360 ج.م)، إدارة سداد الموردين، منظومة الفصال السرية، والتسعير الشامل للأقسام.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/ashraf"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all flex items-center gap-2 text-xs font-bold"
              title="فتح الخزنة المستقلة بكود المرور"
            >
              <Lock size={15} />
              <span>الخزنة السرية المستقلة (/ashraf) 🔗</span>
            </a>
            <button
              onClick={loadHubData}
              disabled={loading}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              <span>تحديث البيانات</span>
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <CreditCard size={16} />
              <span>تسجيل سداد دفعة للمورد 💸</span>
            </button>
          </div>
        </div>

        {/* ── Key Executive Metrics Bar ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-amber-500/20">
          {/* Card 1: Verified Invoice Total */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span>قيمة الفاتورة المعتمدة</span>
              <FileText size={14} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {totalInvoiceAmount.toLocaleString("ar-EG")}{" "}
              <span className="text-xs text-white/60">ج.م</span>
            </div>
            <div className="text-[11px] text-[#00ff66] font-bold flex items-center gap-1">
              <CheckCircle size={12} />
              <span>مدققة 100% (46 موديل - 372 قطعة)</span>
            </div>
          </div>

          {/* Card 2: Paid to Supplier */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span>المدفوع للمورد حتى الآن</span>
              <DollarSign size={14} className="text-[#00ff66]" />
            </div>
            <div className="text-2xl font-black text-[#00ff66] font-mono">
              {totalPaidToSupplier.toLocaleString("ar-EG")}{" "}
              <span className="text-xs text-white/60">ج.م</span>
            </div>
            <div className="text-[11px] text-white/50">
              تم سداد {paymentPercentage}% من إجمالي الفاتورة
            </div>
          </div>

          {/* Card 3: Remaining Debt */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span>المتبقي للمورد (دين حالي)</span>
              <Truck size={14} className="text-red-400" />
            </div>
            <div className="text-2xl font-black text-red-400 font-mono">
              {currentTotalDebt.toLocaleString("ar-EG")}{" "}
              <span className="text-xs text-white/60">ج.م</span>
            </div>
            <div className="text-[11px] text-amber-400 font-bold">
              المورد: مورد الفاتورة المعتمد (#1259)
            </div>
          </div>

          {/* Card 4: Unread Alerts */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span>التنبيهات والأكواد السرية</span>
              <AlertCircle size={14} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              {unreadCount}{" "}
              <span className="text-xs text-white/60">إشعار جديد</span>
            </div>
            <div className="text-[11px] text-white/50">
              إجمالي السجل: {alerts.length} عملية مرصودة
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "purchases", label: "📦 الفاتورة المعتمدة وحساب المورد", icon: Truck },
          { id: "discounts", label: "🔓 منظومة الفصال والأكواد السرية", icon: Percent },
          { id: "pricing", label: "🏷️ التسعير السريع للأقسام", icon: Tag },
          { id: "alerts", label: "🔔 التنبيهات وسجل الخصومات", icon: AlertCircle, badge: unreadCount },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
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

      {/* ═══════════════════════════════════════════════════════
          SUB-TAB 1: PURCHASES & SUPPLIER DEBT TRACKER
      ═══════════════════════════════════════════════════════ */}
      {activeSubTab === "purchases" && (
        <div className="space-y-6">
          {/* Supplier Debt & Payment Progress Card */}
          <div className="p-6 bg-[#121218] border border-white/10 rounded-3xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00ff66]/15 border border-[#00ff66]/30 text-[#00ff66] text-[11px] font-bold">
                    حالة المطابقة: مدققة ومعتمدة رياضياً 🟢
                  </span>
                  <span className="text-white/40 text-xs">•</span>
                  <span className="text-white/60 text-xs">مرجع المورد: كود 1259</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  موقف سداد فاتورة الشراء المعتمدة (#{currentVerifiedInvoice?.invoiceNumber || "PUR-INV-1259"})
                </h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow flex items-center gap-1.5 self-start"
              >
                <DollarSign size={14} />
                <span>سداد دفعة جديدة</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#00ff66] font-bold">
                  المدفوع: {totalPaidToSupplier.toLocaleString("ar-EG")} ج.م ({paymentPercentage}%)
                </span>
                <span className="text-red-400 font-bold">
                  المتبقي: {currentTotalDebt.toLocaleString("ar-EG")} ج.م
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-3.5 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="bg-gradient-to-r from-amber-500 to-[#00ff66] h-full rounded-full transition-all duration-500 shadow"
                  style={{ width: `${Math.max(3, paymentPercentage)}%` }}
                />
              </div>
            </div>

            {/* Breakdown by Category in the Invoice */}
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

          {/* Supplier Ledger Transactions Table */}
          <div className="p-6 bg-[#121218] border border-white/10 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">كشف حساب ودفعات المورد (محمد أشرف - كود 1259)</h3>
                <p className="text-xs text-white/50">سجل استلام الفواتير والدفعات النقدية المسددة للمورد</p>
              </div>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/5 text-white/60 font-semibold border-b border-white/10">
                  <tr>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">نوع الحركة</th>
                    <th className="p-3">رقم المرجع</th>
                    <th className="p-3">المبلغ</th>
                    <th className="p-3">طريقة السداد</th>
                    <th className="p-3">الرصيد المتبقي</th>
                    <th className="p-3">البيان والملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {supplierTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-white/40 font-sans">
                        لا توجد دفعات مسددة حتى الآن. إجمالي الفاتورة 837,360 ج.م مسجل كمديونية قائمة.
                      </td>
                    </tr>
                  ) : (
                    supplierTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 text-white/60">
                          {new Date(tx.createdAt).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="p-3 font-sans">
                          {tx.type === "PAYMENT" ? (
                            <span className="px-2 py-0.5 rounded-lg bg-[#00ff66]/10 text-[#00ff66] font-bold text-[10px]">
                              سداد دفعة للمورد 💸
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-[10px]">
                              فاتورة بضاعة واردة 📦
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-white">{tx.referenceNumber || "-"}</td>
                        <td className={`p-3 font-black ${tx.type === "PAYMENT" ? "text-[#00ff66]" : "text-amber-400"}`}>
                          {tx.amount.toLocaleString("ar-EG")} ج.م
                        </td>
                        <td className="p-3 font-sans text-white/70">
                          {tx.paymentMethod === "CASH" ? "نقداً (كاش)" : tx.paymentMethod}
                        </td>
                        <td className="p-3 font-bold text-red-400">
                          {tx.runningBalance?.toLocaleString("ar-EG")} ج.م
                        </td>
                        <td className="p-3 font-sans text-white/70">{tx.notes || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SUB-TAB 2: BARGAINING POLICY & SECRET DISCOUNT CODES
      ═══════════════════════════════════════════════════════ */}
      {activeSubTab === "discounts" && (
        <div className="space-y-6">
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
                  value={maxCashierDiscountInput}
                  onChange={(e) => setMaxCashierDiscountInput(parseFloat(e.target.value) || 0)}
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
                  value={cashierBargainPinInput}
                  onChange={(e) => setCashierBargainPinInput(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#00ff66] rounded-xl py-2 px-3 text-lg font-mono font-black text-[#00ff66] text-center outline-none tracking-widest"
                />
              </div>

              {/* Setting 3: Mohamed Ashraf VIP Master Discount PIN */}
              <div className="p-4 bg-white/5 border border-amber-500/30 rounded-2xl space-y-2 bg-amber-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300">كود خصم محمد أشرف السري (VIP):</span>
                  <span className="text-amber-400 text-xs font-mono font-bold">👑 Master</span>
                </div>
                <p className="text-[11px] text-white/60">
                  كود حصري لمحمد أشرف، يتيح خصم تكريمي يظهر باسمه في الفاتورة ويخصم تلقائياً من حسابه الشخصي (مسحوبات).
                </p>
                <input
                  type="text"
                  maxLength={8}
                  value={ownerDiscountPinInput}
                  onChange={(e) => setOwnerDiscountPinInput(e.target.value)}
                  className="w-full bg-black/60 border border-amber-500/40 focus:border-amber-400 rounded-xl py-2 px-3 text-lg font-mono font-black text-amber-300 text-center outline-none tracking-widest"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveDiscountSettings}
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

      {/* ═══════════════════════════════════════════════════════
          SUB-TAB 3: FAST DYNAMIC CATEGORY PRICING MATRIX
      ═══════════════════════════════════════════════════════ */}
      {activeSubTab === "pricing" && (
        <div className="space-y-6">
          <div className="p-6 bg-[#121218] border border-white/10 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white">التسعير الديناميكي السريع للأقسام (بضغطة واحدة)</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  بدلاً من تسعير مئات الموديلات قطعة قطعة، يمكنك هنا تحديد سعر بيع القسم (الجاكيت، الترنج، التريكو، البنطلون) وتطبيقه على كل القطع والمقاسات فوراً!
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
                          <span className="text-[11px] text-white/50">{cat.totalProducts} موديل ({cat.totalVariants} باركود ومقاس)</span>
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

      {/* ═══════════════════════════════════════════════════════
          SUB-TAB 4: OWNER ALERTS & REAL-TIME DISCOUNT AUDIT
      ═══════════════════════════════════════════════════════ */}
      {activeSubTab === "alerts" && (
        <div className="space-y-6">
          <div className="p-6 bg-[#121218] border border-white/10 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-black text-white">سجل التنبيهات والأكواد السرية اللحظي</h3>
                <p className="text-xs text-white/50">
                  إشعار فوري عند تفعيل كود فصال الكاشير، كود خصم محمد أشرف VIP، أو تسجيل حجز أونلاين بديبوزيت
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAlertsRead}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70 hover:text-white font-bold transition-all"
                >
                  تحديد الكل كمقروء
                </button>
              )}
            </div>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-xs">
                  لا توجد تنبيهات حالية في السجل
                </div>
              ) : (
                alerts.map((alert) => (
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
                  <h3 className="font-black text-white text-base">تسجيل سداد دفعة للمورد</h3>
                  <p className="text-xs text-white/50">خصم مباشر من مديونية الفاتورة (#1259)</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs flex justify-between">
                <span className="text-white/60">إجمالي المديونية الحالية:</span>
                <span className="font-mono font-bold text-red-400">{currentTotalDebt.toLocaleString("ar-EG")} ج.م</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">المبلغ المراد سداده (ج.م):</label>
                <input
                  type="number"
                  min={1}
                  max={currentTotalDebt}
                  value={paymentAmount || ""}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  placeholder="مثال: 50000"
                  autoFocus
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl py-3 px-4 text-center text-xl font-mono text-[#00ff66] font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">طريقة السداد:</label>
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
                <label className="text-[11px] font-bold text-white/70 block mb-1">بيان / ملاحظات الدفعة:</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="مثال: دفعة الأسبوع الأول تسليم يد"
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSupplierPayment}
                disabled={submittingPayment}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                {submittingPayment ? "جاري تسجيل الدفعة..." : "تأكيد سداد الدفعة وتحديث الرصيد"}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
