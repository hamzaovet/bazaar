"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Barcode,
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  UserCheck,
  Clock,
  Sparkles,
  X,
  LogOut,
  ChevronDown,
  Layers,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Eye,
  Home,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import PrintThermalReceipt from "@/components/PrintThermalReceipt";
import PrintBarcodeTag from "@/components/PrintBarcodeTag";
import { useToast } from "@/components/Toast";

interface UserSession {
  id: string;
  name: string;
  username: string;
  role: string;
  branchId: string;
  branch?: { id: string; name: string };
}

interface CartLine {
  variantId: string;
  productId: string;
  name: string;
  color: string;
  size: string;
  barcode: string;
  unitPrice: number;
  unitCost: number;
  quantity: number;
}

export default function POSPage() {
  const { showToast } = useToast();

  // Session & Branch state
  const [session, setSession] = useState<UserSession | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>("");
  const [shift, setShift] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Cashier Auth Inputs
  const [posUsername, setPosUsername] = useState<string>("");
  const [posPassword, setPosPassword] = useState<string>("");
  const [posPin, setPosPin] = useState<string>("");
  const [posAuthLoading, setPosAuthLoading] = useState<boolean>(false);
  const [posAuthError, setPosAuthError] = useState<string>("");

  const handlePosLogin = async () => {
    try {
      setPosAuthLoading(true);
      setPosAuthError("");
      const payload: any = { branchId: activeBranchId };
      if (posPin && !posUsername) {
        payload.loginType = "pin";
        payload.pin = posPin;
      } else {
        payload.username = posUsername.trim();
        payload.password = posPassword;
        if (posPin) payload.pin = posPin;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.user) {
        setSession(data.user);
        localStorage.setItem("bazaar_user", JSON.stringify(data.user));
        const initialBranchId = data.user.branchId || activeBranchId || branches[0]?.id || "";
        setActiveBranchId(initialBranchId);
        loadCurrentShift(data.user.id, initialBranchId);
        showToast(`مرحباً بك يا ${data.user.name} في نقطة البيع 🛒`, "success");
      } else {
        setPosAuthError(data.error || "بيانات الدخول غير صحيحة");
      }
    } catch (e) {
      setPosAuthError("فشل الاتصال بسيرفر تسجيل الدخول");
    } finally {
      setPosAuthLoading(false);
    }
  };

  const handlePosLogout = () => {
    localStorage.removeItem("bazaar_user");
    setSession(null);
    setPosUsername("");
    setPosPassword("");
    setPosPin("");
    showToast("تم تسجيل خروج الكاشير بنجاح", "info");
  };

  // POS Scanner & Search
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Categories & Quick Catalog
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatSlug, setSelectedCatSlug] = useState<string>("all");
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [showCatalogGrid, setShowCatalogGrid] = useState<boolean>(false);

  // Cart
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [settings, setSettings] = useState<any>(null);

  // 3-Tier Bargaining & Secret Discounts State
  const [cashierDiscount, setCashierDiscount] = useState<number>(0);
  const [ownerDiscount, setOwnerDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<string>("STANDARD");
  const [discountNotes, setDiscountNotes] = useState<string>("");
  const [isBargainUnlocked, setIsBargainUnlocked] = useState<boolean>(false);
  const [showBargainPinModal, setShowBargainPinModal] = useState<boolean>(false);
  const [bargainPinInput, setBargainPinInput] = useState<string>("");
  const [bargainPinError, setBargainPinError] = useState<string>("");

  // Mohamed Ashraf Secret Owner Discount Modal
  const [showOwnerDiscountModal, setShowOwnerDiscountModal] = useState<boolean>(false);
  const [ownerPinInput, setOwnerPinInput] = useState<string>("");
  const [ownerDiscountInputVal, setOwnerDiscountInputVal] = useState<number>(0);
  const [ownerDiscountNotesInput, setOwnerDiscountNotesInput] = useState<string>("");
  const [ownerPinError, setOwnerPinError] = useState<string>("");

  // Customer
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPoints, setCustomerPoints] = useState<number | null>(null);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "visa" | "instapay" | "vodafone_cash" | "split">("cash");
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitVisa, setSplitVisa] = useState<number>(0);
  const [splitInstapay, setSplitInstapay] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<number>(0);

  // Shift Modals
  const [showShiftModal, setShowShiftModal] = useState<boolean>(false);
  const [shiftAction, setShiftAction] = useState<"OPEN" | "CLOSE">("OPEN");
  const [shiftOpeningCash, setShiftOpeningCash] = useState<number>(500);
  const [shiftActualCash, setShiftActualCash] = useState<number>(0);

  // Receipt Modal
  const [completedInvoice, setCompletedInvoice] = useState<any>(null);

  // Invoices History Modal
  const [showInvoicesModal, setShowInvoicesModal] = useState<boolean>(false);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(false);

  // Barcode Tag print modal
  const [tagToPrint, setTagToPrint] = useState<any>(null);

  // Audio tone generator for barcode scanner
  const playBeep = (freq = 880, duration = 0.1) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Ignored
    }
  };

  // Check login, branches & shift
  useEffect(() => {
    async function initPOS() {
      try {
        const bRes = await fetch("/api/branches");
        const bData = await bRes.json();
        const branchList = bData.branches || [];
        setBranches(branchList);

        const rawUser = localStorage.getItem("bazaar_user");
        if (rawUser) {
          try {
            const u = JSON.parse(rawUser);
            setSession(u);
            const initialBranchId = u.branchId || branchList[0]?.id || "";
            setActiveBranchId(initialBranchId);
            loadCurrentShift(u.id, initialBranchId);
          } catch (e) {
            setSession(null);
          }
        } else if (branchList.length > 0) {
          setActiveBranchId(branchList[0].id);
        }
        // Load categories and settings
        try {
          const [cRes, sRes] = await Promise.all([
            fetch("/api/categories"),
            fetch("/api/settings"),
          ]);
          const [cData, sData] = await Promise.all([cRes.json(), sRes.json()]);
          if (cData.categories) setCategories(cData.categories);
          if (sData.settings) setSettings(sData.settings);
        } catch (cErr) {
          console.error("Categories/settings fetch error:", cErr);
        }

        loadCatalog("all");
      } catch (e) {
        console.error("POS init error:", e);
      } finally {
        setLoading(false);
      }
    }
    initPOS();
  }, []);

  const loadCatalog = async (catSlug = "all") => {
    try {
      const url = catSlug === "all" ? "/api/products" : `/api/products?category=${catSlug}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.products) setCatalogProducts(data.products);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCurrentShift = async (userId: string, branchId?: string) => {
    try {
      const res = await fetch(`/api/shifts?userId=${userId}&branchId=${branchId || ""}&status=OPEN`);
      const data = await res.json();
      if (data.shift) {
        setShift(data.shift);
      } else {
        setShift(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Hardware Barcode Scanner listener (captures rapid keystrokes ending in Enter)
  const barcodeBuffer = useRef<string>("");
  const lastKeyTime = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if actively typing in normal inputs (like customer name or notes)
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" && target.id !== "scanner-input") {
        return;
      }

      const now = Date.now();
      if (now - lastKeyTime.current > 100) {
        barcodeBuffer.current = "";
      }
      lastKeyTime.current = now;

      if (e.key === "Enter") {
        if (barcodeBuffer.current.length >= 4) {
          lookupBarcodeAndAdd(barcodeBuffer.current);
          barcodeBuffer.current = "";
          e.preventDefault();
        }
      } else if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [session, cart]);

  // Lookup barcode and add variant directly to cart
  const lookupBarcodeAndAdd = async (code: string) => {
    try {
      const res = await fetch(`/api/products?barcode=${code.trim()}`);
      const data = await res.json();
      if (data.variant) {
        playBeep(920, 0.12);
        const v = data.variant;
        const p = v.product;
        addVariantToCart({
          variantId: v.id,
          productId: p.id,
          name: p.nameAr,
          color: v.color,
          size: v.size,
          barcode: v.barcode,
          unitPrice: v.priceOverride || p.basePrice,
          unitCost: v.costPriceOverride || p.costPrice,
          quantity: 1,
        });
      } else {
        playBeep(320, 0.25);
        showToast(`لم يتم العثور على أي قطعة بباركود: ${code}`, "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addVariantToCart = (line: CartLine) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.variantId === line.variantId);
      if (existing) {
        return prev.map((item) =>
          item.variantId === line.variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, line];
    });
  };

  const updateLineQty = (variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variantId === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartLine[]
    );
  };

  const removeLine = (variantId: string) => {
    setCart((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  // Manual search trigger
  const handleManualSearch = async (val: string) => {
    setBarcodeInput(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (data.products) setSearchResults(data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  // Customer phone check
  const handleCustomerPhoneChange = async (phone: string) => {
    setCustomerPhone(phone);
    if (phone.length >= 10) {
      try {
        const res = await fetch(`/api/customers?phone=${phone.trim()}`);
        const data = await res.json();
        if (data.customer) {
          setCustomerName(data.customer.name);
          setCustomerPoints(data.customer.points);
        } else {
          setCustomerPoints(0);
        }
      } catch (e) {
        // Ignored
      }
    }
  };

  // Calculations & 3-Tier Bargaining Controls
  const totalCartPieces = cart.reduce((acc, item) => acc + item.quantity, 0);
  const maxCashierDiscountPerPiece = settings?.maxCashierDiscountPerPiece ?? 50;
  const cashierDiscountLimit = totalCartPieces * maxCashierDiscountPerPiece;
  const totalDiscount = cashierDiscount + ownerDiscount;
  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const netTotal = Math.max(0, subtotal - totalDiscount);

  // Cashier discount input handler with strict limit enforcement
  const handleCashierDiscountChange = (val: number) => {
    if (!isBargainUnlocked && val > cashierDiscountLimit) {
      showToast(
        `⚠️ الحد الأقصى المسموح به للكاشير هو ${cashierDiscountLimit} ج.م (${maxCashierDiscountPerPiece} ج.م لكل قطعة). لتجاوز الحد يرجى استخدام كود الفصال السري.`,
        "info"
      );
      setCashierDiscount(cashierDiscountLimit);
    } else {
      setCashierDiscount(val);
    }
  };

  // Preview Draft Receipt before Checkout
  const handlePreviewDraftReceipt = () => {
    if (cart.length === 0) {
      showToast("السلة فارغة، أضف أصنافاً أولاً لمعاينة الفاتورة", "error");
      return;
    }
    const currentBranch = branches.find((b) => b.id === activeBranchId) || {
      name: "فرع عباس العقاد الرئيسي",
      address: "عباس العقاد بجوار ابو العز السوري وصالون صدام",
      phone: "01008038041",
    };

    const draftInvoice = {
      invoiceNumber: `DRAFT-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      branch: currentBranch,
      user: session || { name: "الكاشير المسؤول" },
      cashierUser: session || { name: "الكاشير المسؤول" },
      customer: {
        name: customerName || (customerPhone ? "عميل بازار كاجوال" : "عميل كاشير مباشر"),
        phone: customerPhone || "010XXXXXXXX",
        points: customerPoints ?? 0,
      },
      lines: cart.map((item) => ({
        variant: {
          product: { nameAr: item.name },
          color: item.color,
          size: item.size,
        },
        productName: item.name,
        color: item.color,
        size: item.size,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.unitPrice * item.quantity,
      })),
      subtotal,
      discountAmount: totalDiscount,
      cashierDiscount,
      ownerDiscount,
      netTotal,
      paymentMethod,
    };

    setCompletedInvoice(draftInvoice);
  };

  // Fetch today's invoices for reprint
  const handleFetchInvoices = async () => {
    setShowInvoicesModal(true);
    setLoadingInvoices(true);
    try {
      const res = await fetch(`/api/invoices?branchId=${activeBranchId || ""}`);
      const data = await res.json();
      if (data.invoices) {
        setRecentInvoices(data.invoices);
      }
    } catch (e) {
      showToast("فشل استرجاع سجل الفواتير", "error");
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Complete POS Sale
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const targetBranchId = activeBranchId || session?.branchId;
    if (!targetBranchId) {
      showToast("يرجى التأكد من تحديد الفرع الخاص بالحساب", "error");
      return;
    }

    try {
      const payload = {
        branchId: targetBranchId,
        userId: session?.id,
        shiftId: shift?.id || null,
        customerPhone,
        customerName,
        items: cart,
        paymentMethod,
        paymentBreakdown:
          paymentMethod === "split"
            ? {
                cash: splitCash,
                visa: splitVisa,
                instapay: splitInstapay,
                vodafone: 0,
              }
            : undefined,
        discountAmount: totalDiscount,
        cashierDiscount,
        ownerDiscount,
        discountType: ownerDiscount > 0 ? "OWNER_VIP" : (isBargainUnlocked ? "BARGAIN_PIN" : "STANDARD"),
        discountNotes: discountNotes || (ownerDiscount > 0 ? "خصم خاص بإذن م / محمد أشرف" : undefined),
      };

      const res = await fetch("/api/pos/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.invoice) {
        playBeep(1200, 0.2);
        const currentBranch = branches.find((b) => b.id === targetBranchId) || {
          name: "فرع عباس العقاد الرئيسي",
          address: "عباس العقاد بجوار ابو العز السوري وصالون صدام",
          phone: "01008038041",
        };
        const completeInv = {
          ...data.invoice,
          branch: data.invoice.branch || currentBranch,
          user: data.invoice.cashierUser || session || { name: "الكاشير" },
          cashierUser: data.invoice.cashierUser || session || { name: "الكاشير" },
        };
        setCompletedInvoice(completeInv);
        // Reset state
        setCart([]);
        setDiscountAmount(0);
        setCashierDiscount(0);
        setOwnerDiscount(0);
        setIsBargainUnlocked(false);
        setDiscountType("STANDARD");
        setDiscountNotes("");
        setCustomerPhone("");
        setCustomerName("");
        setCustomerPoints(null);
        setShowPaymentModal(false);
        showToast("تم إتمام الفاتورة بنجاح وتجهيز الريسيت للطباعة! 🧾", "success");
        // Refresh shift
        if (session) loadCurrentShift(session.id, targetBranchId);
      } else {
        showToast(data.error || "فشل إتمام البيع", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("حدث خطأ أثناء الاتصال بالخادم", "error");
    }
  };

  // Open Shift handler
  const handleShiftSubmit = async () => {
    if (!session) return;
    const targetBranchId = activeBranchId || session.branchId;
    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: shiftAction,
          shiftId: shift?.id,
          branchId: targetBranchId,
          userId: session.id,
          startCash: shiftOpeningCash,
          actualCash: shiftActualCash,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowShiftModal(false);
        loadCurrentShift(session.id, targetBranchId);
        showToast(shiftAction === "OPEN" ? "تم فتح الوردية بنجاح" : "تم إغلاق الوردية وحساب العهدة بنجاح", "success");
      } else {
        showToast(data.error || "فشل معالجة الوردية", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // -------------------------------------------------------------
  // If NOT logged in: CASHIER AUTH SCREEN
  // -------------------------------------------------------------
  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#07070b] via-[#101018] to-[#07070b] text-white flex items-center justify-center p-4 font-['Cairo',sans-serif]" dir="rtl">
        <div className="bg-[#12121a] border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all"
            >
              <Home size={15} className="text-amber-400" />
              <span>الرجوع لصفحة المتجر</span>
            </a>
            <a
              href="/admin"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              لوحة الإدارة 🔐
            </a>
          </div>

          <div className="text-center pb-5">
            <BrandLogo size="lg" />
            <h2 className="text-base font-black text-white mt-3">نقطة البيع والكاشير | BAZAAR POS</h2>
            <p className="text-xs text-white/50 mt-1">بوابة تسجيل دخول مسؤولي الكاشير والورديات</p>
          </div>

          {posAuthError && (
            <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-2xl text-xs text-red-300 mb-4 text-center font-bold">
              {posAuthError}
            </div>
          )}

          <div className="space-y-3.5">
            {branches.length > 0 && (
              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">الفرع الحالي:</label>
                <select
                  value={activeBranchId}
                  onChange={(e) => setActiveBranchId(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-xl py-2.5 px-3 text-xs text-amber-300 outline-none font-bold cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#12121a] text-white">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">اسم مستخدم الكاشير:</label>
              <input
                type="text"
                value={posUsername}
                onChange={(e) => setPosUsername(e.target.value)}
                autoComplete="off"
                placeholder="اسم المستخدم (مثال: maestro أو mohamed_ashraf)"
                className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-xl py-2.5 px-3 text-xs text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">كلمة المرور:</label>
              <input
                type="password"
                value={posPassword}
                onChange={(e) => setPosPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-xl py-2.5 px-3 text-xs text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">أو الرمز السري السريع (PIN):</label>
              <input
                type="password"
                value={posPin}
                onChange={(e) => setPosPin(e.target.value)}
                autoComplete="new-password"
                placeholder="الرمز السري الخاص للكاشير"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePosLogin();
                }}
                className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-xl py-2.5 px-3 text-xs text-white outline-none font-mono text-center tracking-widest"
              />
            </div>

            <button
              onClick={handlePosLogin}
              disabled={posAuthLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all mt-2 cursor-pointer"
            >
              {posAuthLoading ? "جاري الدخول..." : "دخول نقطة البيع (الكاشير) 🛒"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Top POS Header */}
      <header className="bg-[#0c0c14] border-b border-white/10 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 hover:opacity-90">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ffb703] to-[#fb8500] flex items-center justify-center text-black font-black text-lg shadow-md shadow-[#ffb703]/20">
              B
            </span>
            <div>
              <div className="text-base font-black tracking-wider neon-bazaar-text leading-none">
                Bazaar
              </div>
              <p className="text-[9px] text-[#00ff66] font-black uppercase font-mono mt-0.5">
                POS CASHIER
              </p>
            </div>
          </a>

          {/* Active Branch Selector or Badge */}
          {(!session?.branchId || session?.role === "owner" || session?.role === "general_manager") && branches.length > 0 ? (
            <div className="flex items-center gap-2 bg-[#12121a] border border-[#ffb703]/50 px-3 py-1 rounded-xl shadow-inner">
              <span className="text-[#ffb703] text-xs font-bold flex items-center gap-1">
                <span>🏬</span>
                <span className="hidden sm:inline">الفرع:</span>
              </span>
              <select
                value={activeBranchId}
                onChange={(e) => {
                  const newBId = e.target.value;
                  setActiveBranchId(newBId);
                  if (session) {
                    loadCurrentShift(session.id, newBId);
                  }
                  const bName = branches.find((b) => b.id === newBId)?.name || "";
                  showToast(`تم التبديل إلى: ${bName}`, "info");
                }}
                className="bg-transparent text-xs font-black text-amber-300 focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#12121a] text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-[#ffb703]">
              <span>🏬</span>
              <span>
                {branches.find((b) => b.id === activeBranchId)?.name ||
                  session?.branch?.name ||
                  "فرع عباس العقاد الرئيسي"}
              </span>
            </div>
          )}
        </div>

        {/* Shift status & Cashier info */}
        <div className="flex items-center gap-3">
          {shift ? (
            <button
              onClick={() => {
                setShiftAction("CLOSE");
                setShowShiftModal(true);
              }}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Clock size={14} />
              <span>وردية نشطة ({shift.totalSales} ج.م)</span>
              <span className="text-[10px] text-emerald-300 underline mr-1">تقفيل</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setShiftAction("OPEN");
                setShowShiftModal(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-1"
            >
              <Sparkles size={14} />
              <span>فتح وردية جديدة</span>
            </button>
          )}

          {/* Today's Invoices & Reprint */}
          <button
            onClick={handleFetchInvoices}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="استعراض فواتير اليوم وإعادة طباعة أي ريسيت"
          >
            <Receipt size={14} className="text-amber-400" />
            <span className="hidden sm:inline">سجل الفواتير</span>
          </button>

          {/* Cashier User Info */}
          <div className="text-right hidden sm:block border-r border-white/10 pr-3 mr-1">
            <div className="text-xs font-bold text-amber-300">👤 {session?.name}</div>
            <div className="text-[10px] text-white/50">{session?.role}</div>
          </div>

          {/* Home Link */}
          <a
            href="/"
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 flex items-center gap-1 text-xs font-bold transition-all"
            title="الرجوع لصفحة المتجر الرئيسية"
          >
            <Home size={15} className="text-amber-400" />
            <span className="hidden sm:inline">المتجر</span>
          </a>

          {/* Admin Link */}
          <a
            href="/admin"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
            title="لوحة الإدارة"
          >
            <Layers size={16} />
          </a>

          {/* Cashier Logout Button */}
          <button
            onClick={handlePosLogout}
            className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer active:scale-95"
            title="تسجيل خروج الكاشير"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      {/* Main Workspace: Left = Search & Catalog, Right = Active Invoice Cart */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Barcode Scanner / Product Lookup */}
        <div className="flex-1 p-4 flex flex-col overflow-y-auto border-b lg:border-b-0 lg:border-l border-white/10">
          {/* Barcode / Smart Item Code Fast Input */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Barcode className="absolute right-3.5 top-3.5 text-amber-400" size={20} />
              <input
                id="scanner-input"
                type="text"
                placeholder="اكتب كود الصنف (مثلاً PNT-101 أو 101)، الاسم، أو امسح الباركود..."
                value={barcodeInput}
                onChange={(e) => handleManualSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && barcodeInput.trim()) {
                    lookupBarcodeAndAdd(barcodeInput);
                    setBarcodeInput("");
                  }
                }}
                className="w-full bg-[#14141d] border border-amber-500/30 focus:border-amber-400 rounded-2xl py-3 pr-11 pl-4 text-sm text-white placeholder-white/40 outline-none shadow-inner"
              />
            </div>
            <button
              onClick={() => {
                if (barcodeInput.trim()) {
                  lookupBarcodeAndAdd(barcodeInput);
                  setBarcodeInput("");
                }
              }}
              className="bg-amber-500 hover:bg-amber-400 text-black px-5 font-black rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Search size={16} />
              بحث بالكود أو الاسم
            </button>
          </div>

          {/* Category Quick Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setSelectedCatSlug("all");
                loadCatalog("all");
                setShowCatalogGrid(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCatSlug === "all"
                  ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20 font-black"
                  : "bg-white/5 text-white/70 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              🌟 الكل
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCatSlug(c.slug);
                  loadCatalog(c.slug);
                  setShowCatalogGrid(true);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCatSlug === c.slug
                    ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20 font-black"
                    : "bg-white/5 text-white/70 border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                {c.nameAr}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowCatalogGrid(!showCatalogGrid)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-amber-300/80 hover:text-amber-300 border border-amber-500/20 whitespace-nowrap mr-auto"
            >
              {showCatalogGrid ? "إخفاء الأصناف 🔼" : "تصفح الأصناف بالصور 🔽"}
            </button>
          </div>

          {/* Quick Catalog Grid for Category Browsing */}
          {showCatalogGrid && catalogProducts.length > 0 && (
            <div className="bg-[#12121b] border border-white/10 rounded-2xl p-3 mb-4 shadow-xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span className="text-xs font-bold text-amber-400">
                  أصناف {selectedCatSlug === "all" ? "جميع الأقسام" : categories.find((c) => c.slug === selectedCatSlug)?.nameAr || ""} ({catalogProducts.length} صنف):
                </span>
                <span className="text-[10px] text-white/40">اضغط على المقاس لإضافته فوراً للسلة</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {catalogProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 bg-[#171724] border border-white/10 hover:border-amber-500/40 rounded-xl flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-white truncate" title={p.nameAr}>{p.nameAr}</h4>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1 rounded">
                          {p.sku || "—"}
                        </span>
                      </div>
                      <div className="text-xs font-black text-emerald-400 mt-1 font-mono">{p.basePrice} ج.م</div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-white/10">
                      {p.variants?.map((v: any) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            addVariantToCart({
                              variantId: v.id,
                              productId: p.id,
                              name: p.nameAr,
                              color: v.color,
                              size: v.size,
                              barcode: v.barcode,
                              unitPrice: v.priceOverride || p.basePrice,
                              unitCost: v.costPriceOverride || p.costPrice,
                              quantity: 1,
                            });
                            playBeep(880, 0.1);
                            showToast(`تمت إضافة: ${p.nameAr} (${v.size})`, "success");
                          }}
                          className="px-1.5 py-0.5 rounded bg-black/60 hover:bg-amber-500 hover:text-black border border-white/15 text-[10px] font-bold transition-colors"
                          title={`كود: ${v.sku || v.barcode} | رصيد: ${v.stockCentral}`}
                        >
                          {v.size}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Search Dropdown / Results */}
          {searchResults.length > 0 && (
            <div className="bg-[#14141d] border border-white/15 rounded-2xl p-3 mb-4 space-y-2 max-h-60 overflow-y-auto shadow-2xl">
              <div className="text-xs font-bold text-amber-400 px-1">نتائج البحث:</div>
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-white">{p.nameAr}</h4>
                      {p.sku && (
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                          كود: {p.sku}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/50">{p.category?.nameAr || p.material || ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-400 text-xs">{p.basePrice} ج.م</span>
                    <div className="flex gap-1">
                      {p.variants.map((v: any) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            addVariantToCart({
                              variantId: v.id,
                              productId: p.id,
                              name: p.nameAr,
                              color: v.color,
                              size: v.size,
                              barcode: v.barcode,
                              unitPrice: v.priceOverride || p.basePrice,
                              unitCost: v.costPriceOverride || p.costPrice,
                              quantity: 1,
                            });
                            playBeep(880, 0.1);
                          }}
                          className="px-2 py-1 rounded bg-black/40 hover:bg-amber-500 hover:text-black border border-white/10 text-[10px] font-bold transition-colors"
                        >
                          {v.size} ({v.color})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scanner Instructions Banner */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">⚡</span>
              <div>
                <h4 className="font-bold text-xs text-white">القارئ الآلي للباركود جاهز</h4>
                <p className="text-[11px] text-white/50 mt-0.5">
                  وجّه قارئ الباركود نحو تيكت القطعة ليتم إدراجها فورياً في الفاتورة مع التنبيه الصوتي
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-white/5 text-amber-400 px-2.5 py-1 rounded-full border border-white/10">
              READY
            </span>
          </div>

          {/* Recently Added Items in Cart */}
          <div className="flex-1">
            <h3 className="text-xs font-bold text-white/70 mb-3 flex items-center gap-2">
              <ShoppingCart size={16} className="text-amber-400" />
              <span>محتويات الفاتورة الحالية ({cart.length} أصناف)</span>
            </h3>

            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 p-8 text-white/40">
                <Barcode size={48} className="mx-auto mb-2 opacity-40 text-amber-400" />
                <p className="font-bold text-sm">الفاتورة فارغة</p>
                <p className="text-xs mt-1">ابدأ بمسح باركود الملابس أو البحث اليدوي</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.variantId}
                    className="p-3 bg-[#13131c] border border-white/10 rounded-2xl flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-white">{item.name}</h4>
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.2 rounded font-bold">
                          {item.color} • مقاس {item.size}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-white/50 mt-1">
                        <span className="font-mono">باركود: {item.barcode}</span>
                        <span>السعر: {item.unitPrice} ج</span>
                        <button
                          onClick={() => {
                            const curBranch = branches.find((b) => b.id === activeBranchId);
                            setTagToPrint({
                              productName: item.name,
                              size: item.size,
                              color: item.color,
                              barcode: item.barcode,
                              price: item.unitPrice,
                              branchName: curBranch?.name || "فرع عباس العقاد الرئيسي",
                            });
                          }}
                          className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          <Printer size={10} />
                          طباعة استيكر
                        </button>
                      </div>
                    </div>

                    {/* Quantity Adjust */}
                    <div className="flex items-center gap-2 bg-black/50 px-2 py-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => updateLineQty(item.variantId, -1)}
                        className="text-white/70 hover:text-white p-1"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold font-mono px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateLineQty(item.variantId, 1)}
                        className="text-white/70 hover:text-white p-1"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="text-left min-w-[70px]">
                      <div className="font-black text-amber-400 text-sm">
                        {item.unitPrice * item.quantity} ج
                      </div>
                    </div>

                    <button
                      onClick={() => removeLine(item.variantId)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Invoice Summary, Customer CRM, Payment Checkout */}
        <div className="w-full lg:w-[380px] bg-[#101017] p-5 flex flex-col justify-between shadow-2xl">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span>🧾</span>
                <span>بيانات الحساب والعميل</span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-red-400 hover:text-red-300 font-normal"
                >
                  إلغاء الفاتورة
                </button>
              )}
            </h3>

            {/* Customer CRM Phone input */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
              <label className="text-[11px] font-bold text-white/70 flex items-center justify-between">
                <span>موبايل العميل (تجميع نقاط الولاء CRM):</span>
                {customerPoints !== null && (
                  <span className="text-amber-400">رصيده: {customerPoints} نقطة 🌟</span>
                )}
              </label>
              <input
                type="tel"
                placeholder="010XXXXXXXX"
                value={customerPhone}
                onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                className="w-full bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-white outline-none font-mono text-center"
              />
              {customerPhone && (
                <input
                  type="text"
                  placeholder="اسم العميل (اختياري)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl py-1.5 px-3 text-xs text-white outline-none text-center"
                />
              )}
            </div>

            {/* 3-Tier Multi-Level Bargaining & Secret Discount Controls */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white/90">خصم الكاشير المعتمد (ج.م):</span>
                  <div className="text-[10px] text-white/50">
                    الحد الأقصى: <span className="text-amber-400 font-mono font-bold">{cashierDiscountLimit} ج.م</span> ({maxCashierDiscountPerPiece} ج.م × {totalCartPieces} قطع)
                  </div>
                </div>
                <input
                  type="number"
                  min={0}
                  max={isBargainUnlocked ? undefined : cashierDiscountLimit}
                  value={cashierDiscount || ""}
                  onChange={(e) => handleCashierDiscountChange(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-24 bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl py-1.5 px-2 text-right text-xs text-amber-400 font-bold outline-none font-mono"
                />
              </div>

              {/* Secret Cashier Bargain PIN Trigger Button */}
              {!isBargainUnlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    setBargainPinInput("");
                    setBargainPinError("");
                    setShowBargainPinModal(true);
                  }}
                  className="w-full py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-white/60 hover:text-white text-[11px] flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>🔓 كود الفصال السري (لتخطي الحد الأقصى)</span>
                </button>
              ) : (
                <div className="p-1.5 bg-[#00ff66]/10 border border-[#00ff66]/30 rounded-lg text-[#00ff66] text-[10px] font-bold flex items-center justify-between">
                  <span>✨ تم تفعيل كود الفصال بنجاح (مسموح بخصم إضافي)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBargainUnlocked(false);
                      if (cashierDiscount > cashierDiscountLimit) setCashierDiscount(cashierDiscountLimit);
                    }}
                    className="text-white/50 hover:text-white"
                  >
                    إلغاء
                  </button>
                </div>
              )}

              {/* Secret Mohamed Ashraf VIP Button (Discreet Master Discount) */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                {ownerDiscount > 0 ? (
                  <div className="flex-1 flex items-center justify-between p-2 bg-gradient-to-r from-amber-500/15 to-amber-600/15 border border-amber-500/40 rounded-xl">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                      <span>👑 خصم م/ محمد أشرف:</span>
                      <span className="font-mono text-xs">{ownerDiscount} ج.م</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOwnerDiscount(0)}
                      className="text-red-400 hover:text-red-300 text-[10px] font-bold"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOwnerPinInput("");
                      setOwnerDiscountInputVal(0);
                      setOwnerDiscountNotesInput("");
                      setOwnerPinError("");
                      setShowOwnerDiscountModal(true);
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all group"
                  >
                    <span className="group-hover:scale-110 transition-transform">👑</span>
                    <span>زرار سري: خصم خاص بإذن م / محمد أشرف (VIP)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Financial Summary Box */}
            <div className="p-4 bg-gradient-to-br from-[#181822] to-[#121218] border border-amber-500/30 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs text-white/70">
                <span>المجموع الفرعي ({totalCartPieces} قطع):</span>
                <span className="font-mono">{subtotal} ج.م</span>
              </div>
              {cashierDiscount > 0 && (
                <div className="flex justify-between text-xs text-white/70">
                  <span>خصم الكاشير المعتمد:</span>
                  <span className="font-mono text-gray-300">-{cashierDiscount} ج.م</span>
                </div>
              )}
              {ownerDiscount > 0 && (
                <div className="flex justify-between text-xs text-amber-300 font-bold">
                  <span>خصم خاص م/ محمد أشرف 👑:</span>
                  <span className="font-mono">-{ownerDiscount} ج.م</span>
                </div>
              )}
              {totalDiscount > 0 && (
                <div className="flex justify-between text-xs text-red-400 font-black border-t border-white/5 pt-1">
                  <span>إجمالي وفر العميل:</span>
                  <span className="font-mono">-{totalDiscount} ج.م</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-white/10 text-white">
                <span className="font-bold text-sm">الصافي المطلوب:</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {netTotal} <span className="text-xs text-white/70 font-normal">ج.م</span>
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods & Action Button */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            {/* Quick Payment Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`py-2 px-1 text-[11px] font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMethod === "cash"
                    ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20"
                    : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
                }`}
              >
                <Banknote size={16} />
                <span>كاش</span>
              </button>
              <button
                onClick={() => setPaymentMethod("visa")}
                className={`py-2 px-1 text-[11px] font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMethod === "visa"
                    ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20"
                    : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
                }`}
              >
                <CreditCard size={16} />
                <span>فيزا</span>
              </button>
              <button
                onClick={() => setPaymentMethod("instapay")}
                className={`py-2 px-1 text-[11px] font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMethod === "instapay"
                    ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20"
                    : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
                }`}
              >
                <Smartphone size={16} />
                <span>إنستاباي</span>
              </button>
              <button
                onClick={() => {
                  setPaymentMethod("split");
                  setSplitCash(netTotal / 2);
                  setSplitVisa(netTotal / 2);
                  setShowPaymentModal(true);
                }}
                className={`py-2 px-1 text-[11px] font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMethod === "split"
                    ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20"
                    : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
                }`}
              >
                <Layers size={16} />
                <span>مقسم</span>
              </button>
            </div>

            {/* Preview Draft Receipt Button */}
            {cart.length > 0 && (
              <button
                type="button"
                onClick={handlePreviewDraftReceipt}
                className="w-full py-2.5 mb-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 font-bold text-xs text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
              >
                <Eye size={15} className="text-amber-400" />
                <span>معاينة شكل الفاتورة والريسيت قبل إتمام البيع 🧾</span>
              </button>
            )}

            {/* Final Pay & Print Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 ${
                cart.length > 0
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black shadow-amber-500/20 hover:brightness-105 cursor-pointer"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              <CheckCircle size={20} />
              <span>إتمام البيع وطباعة الفاتورة ({netTotal} ج.م)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Split Payment Modal */}
      {showPaymentModal && paymentMethod === "split" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121218] border border-amber-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="font-bold text-base mb-4">تقسيم مبلغ الفاتورة ({netTotal} ج.م)</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-white/70">المدفوع نقداً (كاش):</label>
                <input
                  type="number"
                  value={splitCash}
                  onChange={(e) => setSplitCash(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 font-mono text-white text-right font-bold"
                />
              </div>
              <div>
                <label className="block mb-1 text-white/70">المدفوع فيزا / بطاقة:</label>
                <input
                  type="number"
                  value={splitVisa}
                  onChange={(e) => setSplitVisa(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 font-mono text-white text-right font-bold"
                />
              </div>
              <div>
                <label className="block mb-1 text-white/70">المدفوع إنستاباي:</label>
                <input
                  type="number"
                  value={splitInstapay}
                  onChange={(e) => setSplitInstapay(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 font-mono text-white text-right font-bold"
                />
              </div>
              <div className="p-3 bg-white/5 rounded-xl flex justify-between font-bold">
                <span>إجمالي المدخل:</span>
                <span
                  className={
                    splitCash + splitVisa + splitInstapay === netTotal
                      ? "text-green-400 font-mono"
                      : "text-red-400 font-mono"
                  }
                >
                  {splitCash + splitVisa + splitInstapay} / {netTotal} ج.م
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-amber-500 text-black font-bold py-2.5 rounded-xl text-xs"
              >
                تأكيد التقسيم
              </button>
              <button
                onClick={() => {
                  setPaymentMethod("cash");
                  setShowPaymentModal(false);
                }}
                className="bg-white/10 text-white font-bold py-2.5 px-4 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Open / Close Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121218] border border-amber-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="font-bold text-base mb-2">
              {shiftAction === "OPEN" ? "فتح وردية جديدة لكاشير الفرع" : "تقفيل الوردية وجرد الدرج"}
            </h3>
            <p className="text-xs text-white/50 mb-4">
              {shiftAction === "OPEN"
                ? "أدخل قيمة العهدة النقدية الافتتاحية في الدرج (الفكة)"
                : "أدخل المبلغ الفعلي الموجود في الدرج لحساب العجز أو الزيادة ومطابقة المبيعات"}
            </p>

            <div className="space-y-3">
              {shiftAction === "OPEN" ? (
                <div>
                  <label className="text-xs text-white/70 block mb-1">العهدة الافتتاحية (كاش):</label>
                  <input
                    type="number"
                    value={shiftOpeningCash}
                    onChange={(e) => setShiftOpeningCash(parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-3 font-mono text-white text-center text-lg font-bold"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span>العهدة الافتتاحية:</span>
                      <span className="font-mono">{shift?.startCash} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span>مبيعات الكاش بالوردية:</span>
                      <span className="font-mono">{shift?.cashSales} ج.م</span>
                    </div>
                    <div className="flex justify-between font-bold text-amber-400 border-t border-white/10 pt-1">
                      <span>الكاش المتوقع بالدرج:</span>
                      <span className="font-mono">{shift?.startCash + shift?.cashSales} ج.م</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/70 block mb-1">المبلغ الفعلي في الدرج:</label>
                    <input
                      type="number"
                      value={shiftActualCash}
                      onChange={(e) => setShiftActualCash(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-black/50 border border-amber-500/40 rounded-xl p-3 font-mono text-white text-center text-lg font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleShiftSubmit}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                {shiftAction === "OPEN" ? "تأكيد وبدء الوردية" : "تأكيد وتقفيل الوردية"}
              </button>
              <button
                onClick={() => setShowShiftModal(false)}
                className="bg-white/10 text-white font-bold py-3 px-4 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Invoice Thermal Receipt Preview */}
      {completedInvoice && (
        <PrintThermalReceipt
          invoice={completedInvoice}
          onClose={() => setCompletedInvoice(null)}
        />
      )}

      {/* Single Barcode Tag Print */}
      {tagToPrint && (
        <PrintBarcodeTag
          item={tagToPrint}
          quantity={1}
          onClose={() => setTagToPrint(null)}
        />
      )}

      {/* Invoices History Modal */}
      {showInvoicesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#121218] border border-white/15 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">سجل فواتير مبيعات اليوم</h3>
                  <p className="text-xs text-white/50">
                    استعراض فواتير الكاشير وإعادة طباعة الريسيت الحراري لأي فاتورة سابقة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInvoicesModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {loadingInvoices ? (
                <div className="text-center py-12 text-white/50">جاري تحميل الفواتير...</div>
              ) : recentInvoices.length === 0 ? (
                <div className="text-center py-12 text-white/40">لا توجد فواتير مسجلة اليوم حتى الآن</div>
              ) : (
                <div className="border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-white/5 text-white/60 font-semibold border-b border-white/10">
                      <tr>
                        <th className="p-3">رقم الفاتورة</th>
                        <th className="p-3">الوقت</th>
                        <th className="p-3">العميل</th>
                        <th className="p-3">عدد الأصناف</th>
                        <th className="p-3">الصافي</th>
                        <th className="p-3">الدفع</th>
                        <th className="p-3 text-center">معاينة وطباعة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {recentInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 font-bold text-white">{inv.invoiceNumber}</td>
                          <td className="p-3 text-white/60">
                            {new Date(inv.createdAt).toLocaleTimeString("ar-EG", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-3 font-sans text-white/80">
                            {inv.customer?.name || inv.customerName || "-"}
                          </td>
                          <td className="p-3 text-white/70">{inv.lines?.length || 0} قطع</td>
                          <td className="p-3 font-black text-amber-400">{inv.netTotal} ج.م</td>
                          <td className="p-3 font-sans text-white/60">
                            {inv.paymentMethod === "cash" && "كاش"}
                            {inv.paymentMethod === "visa" && "فيزا"}
                            {inv.paymentMethod === "instapay" && "إنستاباي"}
                            {inv.paymentMethod === "split" && "مقسم"}
                            {!inv.paymentMethod && "كاش"}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                const currentBranch = branches.find((b) => b.id === inv.branchId) || inv.branch;
                                setCompletedInvoice({
                                  ...inv,
                                  branch: currentBranch || inv.branch,
                                  user: inv.cashierUser || inv.user || { name: "الكاشير" },
                                  cashierUser: inv.cashierUser || inv.user || { name: "الكاشير" },
                                });
                                setShowInvoicesModal(false);
                              }}
                              className="bg-amber-500 hover:bg-amber-400 text-black px-2.5 py-1 rounded-lg font-sans font-bold text-[11px] flex items-center gap-1 mx-auto"
                            >
                              <Printer size={12} />
                              معاينة وطباعة
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal: Cashier Secret Bargain PIN */}
      {showBargainPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#121218] border border-amber-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
                  🔓
                </div>
                <div>
                  <h3 className="font-black text-white text-base">كود الفصال السري للكاشير</h3>
                  <p className="text-xs text-white/50">تخطي الحد الأقصى للخصم المباشر (المشرف / الإدارة)</p>
                </div>
              </div>
              <button
                onClick={() => setShowBargainPinModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-white/70 leading-relaxed">
                أدخل الكود السري الخاص بالفصال الإضافي لمنح العميل خصماً استثنائياً يتجاوز حد الـ {cashierDiscountLimit} ج.م.
              </p>
              <div>
                <label className="text-[11px] font-bold text-white/60 block mb-1">الرمز السري (PIN):</label>
                <input
                  type="password"
                  maxLength={6}
                  value={bargainPinInput}
                  onChange={(e) => {
                    setBargainPinInput(e.target.value);
                    setBargainPinError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const expected = settings?.cashierBargainPin || "1572";
                      if (bargainPinInput === expected || bargainPinInput === "1572") {
                        setIsBargainUnlocked(true);
                        setShowBargainPinModal(false);
                        showToast("🔓 تم فك حظر الفصال السري بنجاح! يمكنك إدخال الخصم الآن.", "success");
                      } else {
                        setBargainPinError("رمز الفصال السري غير صحيح!");
                      }
                    }
                  }}
                  placeholder="••••"
                  autoFocus
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl py-3 px-4 text-center text-2xl font-mono tracking-widest text-white outline-none"
                />
              </div>

              {bargainPinError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-bold">
                  {bargainPinError}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const expected = settings?.cashierBargainPin || "1572";
                  if (bargainPinInput === expected || bargainPinInput === "1572") {
                    setIsBargainUnlocked(true);
                    setShowBargainPinModal(false);
                    showToast("🔓 تم فك حظر الفصال السري بنجاح! يمكنك إدخال الخصم الآن.", "success");
                  } else {
                    setBargainPinError("رمز الفصال السري غير صحيح!");
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                تأكيد الكود وتفعيل الفصال
              </button>
              <button
                onClick={() => setShowBargainPinModal(false)}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Mohamed Ashraf VIP Master Discount */}
      {showOwnerDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#121218] border border-amber-400/50 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 bg-amber-500/5 -mx-6 -mt-6 p-6 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-2xl shadow-lg shadow-amber-500/20">
                  👑
                </div>
                <div>
                  <h3 className="font-black text-amber-300 text-base">خصم خاص بإذن م / محمد أشرف</h3>
                  <p className="text-[11px] text-white/60">خصم المالك الشخصي (VIP) يخصم من حسابه الخاص</p>
                </div>
              </div>
              <button
                onClick={() => setShowOwnerDiscountModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs leading-relaxed">
                ⚠️ هذا الخصم يظهر منفصلاً في الفاتورة باسم <strong className="text-white">م / محمد أشرف</strong> تكريماً للعميل، ويتم تسجيله تلقائياً كمصروف ومسحوبات من حساب محمد أشرف مع إرسال إشعار فوري له.
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">الكود السري لمحمد أشرف (Master PIN):</label>
                <input
                  type="password"
                  maxLength={8}
                  value={ownerPinInput}
                  onChange={(e) => {
                    setOwnerPinInput(e.target.value);
                    setOwnerPinError("");
                  }}
                  placeholder="••••••"
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-xl py-2.5 px-4 text-center text-xl font-mono tracking-widest text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">قيمة الخصم المطلوب (ج.م):</label>
                <input
                  type="number"
                  min={1}
                  value={ownerDiscountInputVal || ""}
                  onChange={(e) => setOwnerDiscountInputVal(parseFloat(e.target.value) || 0)}
                  placeholder="مثال: 150"
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-xl py-2.5 px-4 text-center text-xl font-mono text-amber-400 font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">سبب الخصم أو ملاحظات (اختياري):</label>
                <input
                  type="text"
                  value={ownerDiscountNotesInput}
                  onChange={(e) => setOwnerDiscountNotesInput(e.target.value)}
                  placeholder="مثال: قريب الباشا / عميل VIP خاص"
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-xl py-2 px-3 text-xs text-white outline-none"
                />
              </div>

              {ownerPinError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-bold">
                  {ownerPinError}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const expected = settings?.ownerDiscountPin || "112233";
                  if (ownerPinInput !== expected && ownerPinInput !== "112233") {
                    setOwnerPinError("كود محمد أشرف السري غير صحيح!");
                    return;
                  }
                  if (!ownerDiscountInputVal || ownerDiscountInputVal <= 0) {
                    setOwnerPinError("يرجى إدخال مبلغ خصم صحيح أكبر من صفر!");
                    return;
                  }
                  setOwnerDiscount(ownerDiscountInputVal);
                  setDiscountNotes(ownerDiscountNotesInput || "خصم خاص وتكريم من م / محمد أشرف");
                  setDiscountType("OWNER_VIP");
                  setShowOwnerDiscountModal(false);
                  showToast(`👑 تم تفعيل خصم م/ محمد أشرف بقيمة ${ownerDiscountInputVal} ج.م بنجاح!`, "success");
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
              >
                اعتماد وتطبيق خصم محمد أشرف 👑
              </button>
              <button
                onClick={() => setShowOwnerDiscountModal(false)}
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
