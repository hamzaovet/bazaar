"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  BarChart3,
  Package,
  Barcode,
  Bot,
  ArrowRightLeft,
  DollarSign,
  Users,
  ShieldAlert,
  Settings,
  Plus,
  Search,
  Filter,
  Printer,
  CheckCircle,
  AlertTriangle,
  Upload,
  RefreshCw,
  LogOut,
  MapPin,
  Lock,
  Unlock,
  KeyRound,
  FileText,
} from "lucide-react";
import PrintBarcodeTag from "@/components/PrintBarcodeTag";

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  pin: string;
  phone?: string;
  isActive: boolean;
  branch?: { id: string; name: string };
}

export default function AdminDashboardPage() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginUsername, setLoginUsername] = useState<string>("maestro");
  const [loginPassword, setLoginPassword] = useState<string>("123456789");
  const [loginPin, setLoginPin] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "inventory" | "barcodes" | "ai" | "transfers" | "treasury" | "customers" | "users" | "settings"
  >("overview");

  // Dashboard Data
  const [branches, setBranches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Barcode Printing state
  const [selectedTagItem, setSelectedTagItem] = useState<any>(null);

  // New Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState<string>("");
  const [newProdCat, setNewProdCat] = useState<string>("");
  const [newProdPrice, setNewProdPrice] = useState<number>(450);
  const [newProdCost, setNewProdCost] = useState<number>(220);
  const [newProdMaterial, setNewProdMaterial] = useState<string>("قطن 100%");
  const [newProdVariants, setNewProdVariants] = useState<any[]>([
    { size: "L", color: "أسود ملكي", barcode: "", central: 30, b1: 10, b2: 10 },
    { size: "XL", color: "أسود ملكي", barcode: "", central: 30, b1: 10, b2: 10 },
  ]);

  // Stock Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [transferFrom, setTransferFrom] = useState<string>("CENTRAL_WAREHOUSE");
  const [transferTo, setTransferTo] = useState<string>("");
  const [transferVariantId, setTransferVariantId] = useState<string>("");
  const [transferQty, setTransferQty] = useState<number>(5);

  // AI Ingestion state
  const [aiImageFile, setAiImageFile] = useState<File | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiExtractedData, setAiExtractedData] = useState<any>(null);

  // Master Lock Emergency Modal
  const [showLockConfirmModal, setShowLockConfirmModal] = useState<boolean>(false);
  const [lockPinInput, setLockPinInput] = useState<string>("");
  const [lockMessageInput, setLockMessageInput] = useState<string>(
    "النظام في وضع الصيانة والتحديث الإداري العام لضمان الأمان والملكية."
  );

  // Check existing session
  useEffect(() => {
    const saved = localStorage.getItem("bazaar_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setCurrentUser(u);
      } catch (e) {
        localStorage.removeItem("bazaar_user");
      }
    }
  }, []);

  // Fetch all management data when logged in
  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

  const fetchAllData = async () => {
    try {
      setDataLoading(true);
      const [bRes, pRes, cRes, iRes, tRes, sRes, custRes, setRes] = await Promise.all([
        fetch("/api/branches"),
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/invoices"),
        fetch("/api/stock-transfers"),
        fetch("/api/shifts?status=ALL"),
        fetch("/api/customers"),
        fetch("/api/settings"),
      ]);

      const [b, p, c, i, t, s, cust, st] = await Promise.all([
        bRes.json(),
        pRes.json(),
        cRes.json(),
        iRes.json(),
        tRes.json(),
        sRes.json(),
        custRes.json(),
        setRes.json(),
      ]);

      if (b.branches) setBranches(b.branches);
      if (p.products) setProducts(p.products);
      if (c.categories) setCategories(c.categories);
      if (i.invoices) setInvoices(i.invoices);
      if (t.transfers) setTransfers(t.transfers);
      if (s.shifts) setShifts(s.shifts);
      if (cust.customers) setCustomers(cust.customers);
      if (st.settings) setSettings(st.settings);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setDataLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (type: "credentials" | "pin") => {
    try {
      setAuthLoading(true);
      setLoginError("");

      const payload =
        type === "pin"
          ? { loginType: "pin", pin: loginPin }
          : { username: loginUsername, password: loginPassword };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem("bazaar_user", JSON.stringify(data.user));
      } else {
        setLoginError(data.error || "فشل تسجيل الدخول");
      }
    } catch (e) {
      setLoginError("حدث خطأ في الاتصال بالسيرفر");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("bazaar_user");
    setCurrentUser(null);
  };

  // Toggle Master Lockout (Emergency Switch)
  const handleToggleMasterLock = async (enableLock: boolean) => {
    if (!lockPinInput) {
      alert("يرجى إدخال الرقم السري للمايسترو (PIN)");
      return;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isMasterLocked: enableLock,
          masterLockMessage: lockMessageInput,
          ownerPin: lockPinInput,
        }),
      });

      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setShowLockConfirmModal(false);
        setLockPinInput("");
        alert(
          enableLock
            ? "⚠️ تم تفعيل وضع الطوارئ بنجاح! جميع الحسابات مقفلة باستثناء المالك Maestro لضمان أمان الملكية."
            : "✅ تم إلغاء وضع الطوارئ وفتح النظام لجميع مديري الفروع والكاشيرات بنجاح!"
        );
      } else {
        alert(data.error || "فشل تعديل حالة الطوارئ");
      }
    } catch (e) {
      alert("حدث خطأ في الاتصال");
    }
  };

  // Create Product
  const handleCreateProduct = async () => {
    if (!newProdName) {
      alert("يرجى إدخال اسم الموديل");
      return;
    }

    try {
      const payload = {
        nameAr: newProdName,
        categoryId: newProdCat || undefined,
        basePrice: newProdPrice,
        costPrice: newProdCost,
        material: newProdMaterial,
        variants: newProdVariants.map((v, idx) => ({
          size: v.size,
          color: v.color,
          barcode: v.barcode || `200${Date.now().toString().slice(-8)}${idx}`,
          stockCentral: parseInt(v.central, 10) || 0,
          branchStocks: {
            [branches[0]?.id]: parseInt(v.b1, 10) || 0,
            [branches[1]?.id]: parseInt(v.b2, 10) || 0,
          },
        })),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddProductModal(false);
        fetchAllData();
        alert("تمت إضافة المنتج بنجاح وتوليد الباركود وأرصدة الفروع");
      } else {
        alert(data.error || "فشل حفظ المنتج");
      }
    } catch (e) {
      alert("حدث خطأ");
    }
  };

  // Stock Transfer Execute
  const handleExecuteTransfer = async () => {
    if (!transferFrom || !transferTo || !transferVariantId) {
      alert("يرجى تحديد جهة الإرسال وجهة الاستلام والصنف");
      return;
    }

    try {
      const res = await fetch("/api/stock-transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromLocation: transferFrom,
          toLocation: transferTo,
          lines: [{ variantId: transferVariantId, quantity: transferQty }],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowTransferModal(false);
        fetchAllData();
        alert("تم تسجيل وتنفيذ إذن تحويل البضاعة ونقل الأرصدة فورياً");
      } else {
        alert(data.error || "فشل التحويل");
      }
    } catch (e) {
      alert("خطأ أثناء الاتصال");
    }
  };

  // Gemini Vision AI Ingestion
  const handleAiIngest = async () => {
    if (!aiImageFile) {
      alert("يرجى اختيار صورة الفاتورة أو كشف الجرد أولاً");
      return;
    }

    try {
      setAiLoading(true);
      const fd = new FormData();
      fd.append("image", aiImageFile);

      const res = await fetch("/api/ai/digest", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (data.success && data.extracted) {
        setAiExtractedData(data.extracted);
      } else {
        alert(data.error || "فشل استخراج البيانات بالذكاء الاصطناعي");
      }
    } catch (e) {
      alert("خطأ في معالجة الذكاء الاصطناعي");
    } finally {
      setAiLoading(false);
    }
  };

  // -------------------------------------------------------------
  // If NOT logged in, show prestigious Luxury Login screen
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#121218] to-[#0a0a0f] text-white flex items-center justify-center p-4 font-['Cairo',sans-serif]">
        <div className="bg-[#14141d] border border-amber-500/30 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="text-center pb-6">
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-2xl mx-auto shadow-xl shadow-amber-500/20 mb-3">
              B
            </span>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-amber-500 uppercase tracking-wider">
              BAZAAR CASUAL WEAR
            </h2>
            <p className="text-xs text-white/50 mt-1">
              منظومة الإدارة المركزية ونقاط البيع المتعددة الفروع
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-2xl text-xs text-red-300 mb-4 text-center leading-relaxed font-bold">
              {loginError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">اسم المستخدم:</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl py-2.5 px-3 text-xs text-white outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">كلمة المرور:</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl py-2.5 px-3 text-xs text-white outline-none font-mono"
              />
            </div>
            <button
              onClick={() => handleLogin("credentials")}
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              {authLoading ? "جاري التحقق..." : "تسجيل الدخول للنظام 🔐"}
            </button>

            {/* Quick PIN login for Cashiers */}
            <div className="pt-4 border-t border-white/10 text-center">
              <p className="text-[11px] text-white/50 mb-2">أو الدخول السريع بالرمز السري (PIN الكاشير):</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="PIN الكاشير (مثال: 157230)"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-white text-center font-mono outline-none"
                />
                <button
                  onClick={() => handleLogin("pin")}
                  className="bg-white/10 hover:bg-white/15 text-white px-4 rounded-xl text-xs font-bold"
                >
                  دخول
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Calculate Metrics
  const totalGrossRevenue = invoices.reduce((acc, inv) => acc + (inv.netTotal || 0), 0);
  const totalInvoicesCount = invoices.length;
  const branch1Revenue = invoices
    .filter((inv) => inv.branch?.code === "BR-ABBAS-MAIN")
    .reduce((acc, inv) => acc + (inv.netTotal || 0), 0);
  const branch2Revenue = invoices
    .filter((inv) => inv.branch?.code === "BR-TAHRIR")
    .reduce((acc, inv) => acc + (inv.netTotal || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Top Admin Navbar */}
      <header className="bg-[#121218] border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20">
              B
            </span>
            <div>
              <h1 className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 uppercase leading-none">
                BAZAAR ERP
              </h1>
              <p className="text-[10px] text-white/50 font-bold mt-0.5">لوحة التحكم المركزية</p>
            </div>
          </a>

          {/* Emergency Lock Status Indicator */}
          {settings?.isMasterLocked && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-xl text-xs font-bold text-red-300 animate-pulse">
              <Lock size={12} />
              <span>وضع الطوارئ نشط (الحسابات معطلة)</span>
            </div>
          )}
        </div>

        {/* User Badge, Emergency Lock button, POS direct link, Logout */}
        <div className="flex items-center gap-3">
          {currentUser.role === "owner" && (
            <button
              onClick={() => setShowLockConfirmModal(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                settings?.isMasterLocked
                  ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white/80 border border-white/10"
              }`}
            >
              <ShieldAlert size={14} className={settings?.isMasterLocked ? "text-white" : "text-amber-400"} />
              <span>{settings?.isMasterLocked ? "إلغاء وضع الطوارئ" : "زر الطوارئ الماستر"}</span>
            </button>
          )}

          <a
            href="/pos"
            className="bg-amber-500 hover:bg-amber-400 text-black px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <span>شاشة الكاشير POS</span>
          </a>

          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white">{currentUser.name}</div>
            <div className="text-[10px] text-amber-400 uppercase font-mono">{currentUser.role}</div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70"
            title="تسجيل الخروج"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Nav Tabs */}
      <div className="bg-[#0e0e15] border-b border-white/5 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 max-w-7xl mx-auto py-2">
          {[
            { id: "overview", label: "نظرة عامة والتحليلات", icon: BarChart3 },
            { id: "inventory", label: "المخزون والمخزن المركزي", icon: Package },
            { id: "barcodes", label: "طباعة الباركود والتيكت", icon: Barcode },
            { id: "ai", label: "فحص الفواتير بالذكاء الاصطناعي", icon: Bot },
            { id: "transfers", label: "أذون تحويل البضاعة", icon: ArrowRightLeft },
            { id: "treasury", label: "الخزينة والورديات", icon: DollarSign },
            { id: "customers", label: "قاعدة العملاء والولاء", icon: Users },
            { id: "users", label: "المستخدمين وصلاحيات المالك", icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all border ${
                  isSelected
                    ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20"
                    : "bg-white/5 text-white/70 border-white/5 hover:border-white/15 hover:text-white"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content View */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#14141e] border border-amber-500/20 rounded-2xl space-y-1">
                <span className="text-[11px] text-white/50 font-bold">إجمالي المبيعات (الفرعين)</span>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {totalGrossRevenue.toLocaleString("ar-EG")} <span className="text-xs text-white/60">ج.م</span>
                </div>
                <span className="text-[10px] text-emerald-400">منظومة مدمجة</span>
              </div>

              <div className="p-4 bg-[#14141e] border border-white/10 rounded-2xl space-y-1">
                <span className="text-[11px] text-white/50 font-bold">مبيعات فرع عباس العقاد</span>
                <div className="text-xl font-black text-white font-mono">
                  {branch1Revenue.toLocaleString("ar-EG")} <span className="text-xs text-white/60">ج.م</span>
                </div>
                <span className="text-[10px] text-white/40">الفرع الرئيسي</span>
              </div>

              <div className="p-4 bg-[#14141e] border border-white/10 rounded-2xl space-y-1">
                <span className="text-[11px] text-white/50 font-bold">مبيعات فرع كشري التحرير</span>
                <div className="text-xl font-black text-white font-mono">
                  {branch2Revenue.toLocaleString("ar-EG")} <span className="text-xs text-white/60">ج.م</span>
                </div>
                <span className="text-[10px] text-white/40">الفرع الثاني</span>
              </div>

              <div className="p-4 bg-[#14141e] border border-white/10 rounded-2xl space-y-1">
                <span className="text-[11px] text-white/50 font-bold">عدد الفواتير المنفذة</span>
                <div className="text-2xl font-black text-white font-mono">{totalInvoicesCount}</div>
                <span className="text-[10px] text-amber-400">إجمالي شيكات البيع</span>
              </div>
            </div>

            {/* Quick Actions & Recent Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Invoices */}
              <div className="lg:col-span-2 bg-[#13131c] border border-white/10 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <FileText size={16} className="text-amber-400" />
                    <span>أحدث فواتير البيع الحرارية</span>
                  </h3>
                  <button
                    onClick={fetchAllData}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 pb-2">
                        <th className="py-2">رقم الفاتورة</th>
                        <th className="py-2">الفرع</th>
                        <th className="py-2">الكاشير</th>
                        <th className="py-2">طريقة الدفع</th>
                        <th className="py-2">الصافي</th>
                        <th className="py-2">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {invoices.slice(0, 8).map((inv) => (
                        <tr key={inv.id} className="py-2 hover:bg-white/5">
                          <td className="py-2.5 font-mono text-amber-400 font-bold">{inv.invoiceNumber}</td>
                          <td className="py-2.5">{inv.branch?.name}</td>
                          <td className="py-2.5 text-white/70">{inv.user?.name || "كاشير"}</td>
                          <td className="py-2.5 font-bold">
                            {inv.paymentMethod === "cash" && "كاش"}
                            {inv.paymentMethod === "visa" && "فيزا"}
                            {inv.paymentMethod === "instapay" && "إنستاباي"}
                            {inv.paymentMethod === "split" && "مقسم"}
                          </td>
                          <td className="py-2.5 font-black text-white font-mono">{inv.netTotal} ج</td>
                          <td className="py-2.5 text-white/40 text-[10px]">
                            {new Date(inv.createdAt).toLocaleTimeString("ar-EG")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Branch Day-Off Controls */}
              <div className="bg-[#13131c] border border-white/10 rounded-3xl p-5 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-white/10">
                  <MapPin size={16} className="text-amber-400" />
                  <span>حالة الفروع وأيام الإجازات</span>
                </h3>

                <div className="space-y-3">
                  {branches.map((b) => (
                    <div key={b.id} className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-white">{b.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                          {b.isDayOffEnabled ? "إجازة أسبوعية" : "مفتوح ويستقبل"}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/50">{b.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#13131c] p-4 rounded-3xl border border-white/10">
              <div>
                <h3 className="font-bold text-sm text-white">إدارة الأصناف والمخزون المركزي وفروع البيع</h3>
                <p className="text-xs text-white/50">توزيع القطع بين المخزن المشترك وصالات عرض الفروع</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Plus size={16} />
                  <span>إضافة موديل جديد</span>
                </button>
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <ArrowRightLeft size={16} />
                  <span>إذن تحويل بضاعة</span>
                </button>
              </div>
            </div>

            {/* Products & Variants List */}
            <div className="bg-[#13131c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-white/5 text-white/60 font-bold border-b border-white/10">
                      <th className="p-3">الموديل والاسم</th>
                      <th className="p-3">القسم</th>
                      <th className="p-3">المقاس واللون</th>
                      <th className="p-3">الباركود</th>
                      <th className="p-3">سعر البيع</th>
                      <th className="p-3">سعر التكلفة</th>
                      <th className="p-3 text-center">المخزن المركزي</th>
                      <th className="p-3 text-center">فرع عباس</th>
                      <th className="p-3 text-center">فرع التحرير</th>
                      <th className="p-3 text-center">تيكت الباركود</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map((p) =>
                      p.variants.map((v: any) => {
                        const b1Stock = v.branchStocks?.find(
                          (bs: any) => bs.branchId === branches[0]?.id
                        )?.quantity || 0;
                        const b2Stock = v.branchStocks?.find(
                          (bs: any) => bs.branchId === branches[1]?.id
                        )?.quantity || 0;

                        return (
                          <tr key={v.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 font-bold text-white">{p.nameAr}</td>
                            <td className="p-3 text-white/50">{p.category?.nameAr || "كاجوال"}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-white/10 text-amber-400 font-bold">
                                {v.size} ({v.color})
                              </span>
                            </td>
                            <td className="p-3 font-mono text-white/70">{v.barcode}</td>
                            <td className="p-3 font-black text-amber-400 font-mono">
                              {v.priceOverride || p.basePrice} ج
                            </td>
                            <td className="p-3 font-mono text-white/50">
                              {v.costPriceOverride || p.costPrice} ج
                            </td>
                            <td className="p-3 text-center font-bold text-blue-400 font-mono">
                              {v.stockCentral}
                            </td>
                            <td className="p-3 text-center font-bold font-mono">
                              <span
                                className={`px-2 py-0.5 rounded ${
                                  b1Stock <= 2 ? "bg-red-500/20 text-red-400" : "text-green-400"
                                }`}
                              >
                                {b1Stock}
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold font-mono">
                              <span
                                className={`px-2 py-0.5 rounded ${
                                  b2Stock <= 2 ? "bg-red-500/20 text-red-400" : "text-green-400"
                                }`}
                              >
                                {b2Stock}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() =>
                                  setSelectedTagItem({
                                    productName: p.nameAr,
                                    size: v.size,
                                    color: v.color,
                                    barcode: v.barcode,
                                    price: v.priceOverride || p.basePrice,
                                  })
                                }
                                className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs"
                                title="طباعة استيكر الباركود"
                              >
                                <Printer size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BARCODE MAKER */}
        {activeTab === "barcodes" && (
          <div className="bg-[#13131c] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <span className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl text-xl">🏷️</span>
              <div>
                <h3 className="font-bold text-base text-white">
                  منظومة طباعة باركود الملابس والتيكت الحراري (50 × 25 مم)
                </h3>
                <p className="text-xs text-white/50">
                  اطبع استيكرات الباركود المباشرة للصقها على تيكت الملابس بجميع الفروع
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {products.map((p) =>
                p.variants.map((v: any) => (
                  <div
                    key={v.id}
                    className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-white line-clamp-1">{p.nameAr}</h4>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        {v.color} • مقاس {v.size} • {v.priceOverride || p.basePrice} ج
                      </p>
                      <p className="font-mono text-[9px] text-amber-400 mt-1">{v.barcode}</p>
                    </div>
                    <button
                      onClick={() =>
                        setSelectedTagItem({
                          productName: p.nameAr,
                          size: v.size,
                          color: v.color,
                          barcode: v.barcode,
                          price: v.priceOverride || p.basePrice,
                        })
                      }
                      className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-amber-500/20 transition-all"
                    >
                      <Printer size={14} />
                      طباعة
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: GEMINI VISION AI INGESTION */}
        {activeTab === "ai" && (
          <div className="bg-[#13131c] border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <span className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl text-xl">🤖</span>
              <div>
                <h3 className="font-bold text-base text-white">
                  مساعد الذكاء الاصطناعي Gemini Vision لفحص الفواتير وكشوف الجرد
                </h3>
                <p className="text-xs text-white/50">
                  التقط أو ارفع صورة فاتورة المصنع أو كشف الجرد الورقي لاستخراج الأصناف والمقاسات والتكلفة وسعر البيع آلياً
                </p>
              </div>
            </div>

            <div className="p-8 border-2 border-dashed border-amber-500/30 rounded-3xl text-center space-y-3 bg-white/5">
              <Upload size={36} className="mx-auto text-amber-400 opacity-60" />
              <div className="text-sm font-bold text-white">اسحب صورة الفاتورة أو اضغط للاختيار</div>
              <p className="text-xs text-white/50">يدعم صور JPG, PNG لفواتير الموردين أو كشوف الجرد المكتوبة بخط اليد</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAiImageFile(e.target.files?.[0] || null)}
                className="block mx-auto text-xs text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
              />
              {aiImageFile && (
                <div className="pt-2">
                  <button
                    onClick={handleAiIngest}
                    disabled={aiLoading}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3 px-6 rounded-2xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all inline-flex items-center gap-2"
                  >
                    {aiLoading ? "جاري الفحص بالذكاء الاصطناعي..." : "فحص الفاتورة واستخراج الأصناف 🚀"}
                  </button>
                </div>
              )}
            </div>

            {/* AI Result preview */}
            {aiExtractedData && (
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <h4 className="font-bold text-sm text-amber-400">
                    البيانات المستخرجة بنجاح ({aiExtractedData.items?.length || 0} صنف)
                  </h4>
                  <span className="text-xs text-white/60">المورد: {aiExtractedData.supplierName}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50">
                        <th className="py-2">اسم الصنف</th>
                        <th className="py-2">اللون والمقاس</th>
                        <th className="py-2">الكمية</th>
                        <th className="py-2">سعر التكلفة</th>
                        <th className="py-2">سعر البيع المقترح</th>
                        <th className="py-2">الباركود المقترح</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {aiExtractedData.items?.map((it: any, idx: number) => (
                        <tr key={idx} className="py-2">
                          <td className="py-2 font-bold text-white">{it.nameAr}</td>
                          <td className="py-2 text-amber-400">
                            {it.color} • مقاس {it.size}
                          </td>
                          <td className="py-2 font-mono font-bold">{it.quantity}</td>
                          <td className="py-2 font-mono">{it.costPrice} ج</td>
                          <td className="py-2 font-mono font-black text-amber-400">{it.sellingPrice} ج</td>
                          <td className="py-2 font-mono text-white/60">{it.barcode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: TRANSFERS */}
        {activeTab === "transfers" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#13131c] p-4 rounded-3xl border border-white/10">
              <div>
                <h3 className="font-bold text-sm text-white">أذون تحويل البضاعة بين المخزن المركزي والفروع</h3>
                <p className="text-xs text-white/50">سجل حركة ونقل قطع الملابس مع التحديث الآلي للأرصدة</p>
              </div>
              <button
                onClick={() => setShowTransferModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
              >
                <Plus size={16} />
                <span>إذن تحويل جديد</span>
              </button>
            </div>

            <div className="bg-[#13131c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-white/5 text-white/60 font-bold border-b border-white/10">
                      <th className="p-3">رقم الإذن</th>
                      <th className="p-3">من</th>
                      <th className="p-3">إلى</th>
                      <th className="p-3">الأصناف المحولة</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transfers.map((tr) => (
                      <tr key={tr.id} className="hover:bg-white/5">
                        <td className="p-3 font-mono font-bold text-amber-400">{tr.transferNumber}</td>
                        <td className="p-3">
                          {tr.fromLocation === "CENTRAL_WAREHOUSE" ? "المخزن المركزي" : "فرع بيع"}
                        </td>
                        <td className="p-3 font-bold text-white">
                          {branches.find((b) => b.id === tr.toLocation)?.name || tr.toLocation}
                        </td>
                        <td className="p-3">
                          {tr.lines?.map((l: any) => (
                            <span key={l.id} className="block text-[11px] text-white/80">
                              {l.variant?.product?.nameAr} ({l.variant?.size} - {l.variant?.color}) × {l.quantity}
                            </span>
                          ))}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                            {tr.status}
                          </span>
                        </td>
                        <td className="p-3 text-white/40 text-[10px]">
                          {new Date(tr.createdAt).toLocaleString("ar-EG")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TREASURY & SHIFTS */}
        {activeTab === "treasury" && (
          <div className="bg-[#13131c] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white pb-3 border-b border-white/10 flex items-center gap-2">
              <DollarSign size={18} className="text-amber-400" />
              <span>تقارير الخزينة وجرد الورديات (كاش vs إلكتروني)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    <th className="py-2">رقم الوردية</th>
                    <th className="py-2">الكاشير</th>
                    <th className="py-2">الفرع</th>
                    <th className="py-2">العهدة الافتتاحية</th>
                    <th className="py-2">مبيعات الكاش</th>
                    <th className="py-2">مبيعات الفيزا وإنستاباي</th>
                    <th className="py-2">الكاش المتوقع</th>
                    <th className="py-2">الكاش الفعلي</th>
                    <th className="py-2">الفارق (عجز/زيادة)</th>
                    <th className="py-2">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {shifts.map((s) => (
                    <tr key={s.id} className="py-2.5 hover:bg-white/5">
                      <td className="py-2.5 font-mono text-amber-400 font-bold">{s.shiftNumber}</td>
                      <td className="py-2.5 font-bold text-white">{s.user?.name}</td>
                      <td className="py-2.5">{s.branch?.name}</td>
                      <td className="py-2.5 font-mono">{s.startCash} ج</td>
                      <td className="py-2.5 font-mono text-green-400">{s.cashSales} ج</td>
                      <td className="py-2.5 font-mono text-blue-400">{s.visaSales + s.instapaySales} ج</td>
                      <td className="py-2.5 font-mono font-bold">{s.expectedCash} ج</td>
                      <td className="py-2.5 font-mono font-bold text-amber-400">{s.actualCash} ج</td>
                      <td
                        className={`py-2.5 font-mono font-black ${
                          s.cashDifference < 0
                            ? "text-red-400"
                            : s.cashDifference > 0
                            ? "text-emerald-400"
                            : "text-white/60"
                        }`}
                      >
                        {s.cashDifference > 0 ? `+${s.cashDifference}` : s.cashDifference} ج
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === "OPEN"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {s.status === "OPEN" ? "مفتوحة الآن" : "مقفلة"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: CUSTOMERS CRM */}
        {activeTab === "customers" && (
          <div className="bg-[#13131c] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white pb-3 border-b border-white/10 flex items-center gap-2">
              <Users size={18} className="text-amber-400" />
              <span>قاعدة عملاء بزار ونقاط الولاء (CRM)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    <th className="py-2">اسم العميل</th>
                    <th className="py-2">رقم الهاتف</th>
                    <th className="py-2">رصيد نقاط الولاء</th>
                    <th className="py-2">إجمالي المشتريات</th>
                    <th className="py-2">تاريخ آخر زيارة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customers.map((c) => (
                    <tr key={c.id} className="py-2.5 hover:bg-white/5">
                      <td className="py-2.5 font-bold text-white">{c.name}</td>
                      <td className="py-2.5 font-mono text-amber-400">{c.phone}</td>
                      <td className="py-2.5 font-bold text-emerald-400">{c.points} نقطة 🌟</td>
                      <td className="py-2.5 font-mono font-bold text-white">{c.totalPurchases} ج.م</td>
                      <td className="py-2.5 text-white/40 text-[10px]">
                        {new Date(c.lastVisit).toLocaleDateString("ar-EG")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: USERS & MASTER LOCKOUT */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Master Lockout Box */}
            <div className="bg-gradient-to-r from-red-950/30 via-[#161214] to-red-950/30 border border-red-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="p-3 bg-red-500/20 text-red-400 rounded-2xl text-2xl">🚨</span>
                <div>
                  <h3 className="text-base font-black text-white">
                    زر الطوارئ الحصري للمالك (Maestro) لتعطيل الحسابات وضمان الملكية
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    بضغطة واحدة، يتم إيقاف دخول جميع مديري الفروع والكاشيرات مع إظهار رسالة صيانة إدارية فورية لحماية المنظومة
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-red-500/20">
                <div>
                  <div className="text-xs font-bold text-white">حالة المنظومة الحالية:</div>
                  <div className="text-sm font-black mt-0.5">
                    {settings?.isMasterLocked ? (
                      <span className="text-red-400 flex items-center gap-1.5">
                        <Lock size={14} />
                        النظام مغلق للطوارئ (المايسترو فقط من يستطيع الدخول)
                      </span>
                    ) : (
                      <span className="text-green-400 flex items-center gap-1.5">
                        <Unlock size={14} />
                        النظام يعمل بشكل طبيعي لجميع الموظفين والفروع
                      </span>
                    )}
                  </div>
                </div>

                {currentUser.role === "owner" && (
                  <button
                    onClick={() => setShowLockConfirmModal(true)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 ${
                      settings?.isMasterLocked
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
                    }`}
                  >
                    {settings?.isMasterLocked ? "إلغاء الإغلاق وفتح النظام" : "تفعيل الإغلاق العام للطوارئ 🔒"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Emergency Lock Confirmation Modal */}
      {showLockConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#121218] border border-red-500/50 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="font-bold text-base text-red-400 mb-2 flex items-center gap-2">
              <ShieldAlert size={18} />
              <span>تأكيد تغيير حالة الطوارئ العامة</span>
            </h3>
            <p className="text-xs text-white/60 mb-4 leading-relaxed">
              هذا الإجراء حساس للغاية ومخصص حصرياً للمالك Maestro. يرجى تأكيد العملية بإدخال الرمز السري الخاص بك (PIN).
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">الرمز السري للمايسترو (PIN):</label>
                <input
                  type="password"
                  placeholder="أدخل الرمز السري (157230)"
                  value={lockPinInput}
                  onChange={(e) => setLockPinInput(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 focus:border-red-500 rounded-xl p-3 font-mono text-center text-lg text-white font-bold outline-none"
                />
              </div>

              {!settings?.isMasterLocked && (
                <div>
                  <label className="text-xs text-white/70 block mb-1">رسالة الإغلاق التي ستظهر للموظفين:</label>
                  <textarea
                    rows={2}
                    value={lockMessageInput}
                    onChange={(e) => setLockMessageInput(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handleToggleMasterLock(!settings?.isMasterLocked)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-red-600/30 active:scale-95 transition-all"
              >
                تأكيد التغيير الآن
              </button>
              <button
                onClick={() => {
                  setShowLockConfirmModal(false);
                  setLockPinInput("");
                }}
                className="bg-white/10 text-white font-bold py-3 px-4 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#121218] border border-amber-500/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-white my-8">
            <h3 className="font-bold text-base mb-4 text-amber-400">إضافة موديل كاجوال جديد للمخزن</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-white/70">اسم الموديل:</label>
                <input
                  type="text"
                  placeholder="مثال: تيشرت أوفر سايز بيسك قطن 100%"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-white/70">القسم:</label>
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                  >
                    <option value="">اختر القسم...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-white/70">الخامة:</label>
                  <input
                    type="text"
                    value={newProdMaterial}
                    onChange={(e) => setNewProdMaterial(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-white/70">سعر البيع (ج.م):</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-amber-400 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-white/70">سعر التكلفة من المصنع (ج.م):</label>
                  <input
                    type="number"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateProduct}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                حفظ وإصدار الباركود
              </button>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="bg-white/10 text-white font-bold py-3 px-4 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#121218] border border-amber-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="font-bold text-base mb-4 text-amber-400">إذن تحويل بضاعة فوري</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-white/70">تحويل من:</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                >
                  <option value="CENTRAL_WAREHOUSE">المخزن المركزي الرئيسي المشترك</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-white/70">تحويل إلى:</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                >
                  <option value="">اختر جهة الاستلام...</option>
                  <option value="CENTRAL_WAREHOUSE">المخزن المركزي الرئيسي المشترك</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-white/70">القطعة والمقاس المطلوب تحويلها:</label>
                <select
                  value={transferVariantId}
                  onChange={(e) => setTransferVariantId(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                >
                  <option value="">اختر القطعة...</option>
                  {products.map((p) =>
                    p.variants.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {p.nameAr} - {v.color} - مقاس {v.size} (مركزي: {v.stockCentral})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-white/70">الكمية المحولة:</label>
                <input
                  type="number"
                  min={1}
                  value={transferQty}
                  onChange={(e) => setTransferQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleExecuteTransfer}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                تأكيد وتنفيذ النقل الفوري
              </button>
              <button
                onClick={() => setShowTransferModal(false)}
                className="bg-white/10 text-white font-bold py-3 px-4 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Tag Print Preview */}
      {selectedTagItem && (
        <PrintBarcodeTag
          item={selectedTagItem}
          quantity={1}
          onClose={() => setSelectedTagItem(null)}
        />
      )}
    </div>
  );
}
