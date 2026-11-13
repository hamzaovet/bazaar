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
  ChevronLeft,
  Edit,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  RotateCcw,
  Truck,
  Flame,
  CreditCard,
  Wallet,
  FileSpreadsheet,
  Eye,
  Receipt,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import PrintBarcodeTag from "@/components/PrintBarcodeTag";
import { useToast } from "@/components/Toast";

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
  const { showToast } = useToast();

  // Auth state - STRICTLY EMPTY NO DEFAULTS OR HINTS!
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginPin, setLoginPin] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "inventory"
    | "barcodes"
    | "ai"
    | "transfers"
    | "treasury"
    | "customers"
    | "users"
    | "returns"
    | "purchases"
    | "seasons"
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
  const [usersList, setUsersList] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [returnsList, setReturnsList] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // --- Returns & Exchanges State ---
  const [returnSearchInput, setReturnSearchInput] = useState<string>("");
  const [lookedUpInvoice, setLookedUpInvoice] = useState<any>(null);
  const [selectedReturnItems, setSelectedReturnItems] = useState<Record<string, { quantity: number; unitPrice: number }>>({});
  const [returnType, setReturnType] = useState<"RETURN" | "EXCHANGE">("RETURN");
  const [returnSettlementType, setReturnSettlementType] = useState<"CASH_REFUND" | "DEBT_CREDIT" | "EXCHANGE">("CASH_REFUND");
  const [returnReason, setReturnReason] = useState<string>("مقاس غير مناسب / استبدال موديل");
  const [returnBranchId, setReturnBranchId] = useState<string>("");
  const [submittingReturn, setSubmittingReturn] = useState<boolean>(false);

  // --- Suppliers & Purchases State ---
  const [suppliersSubTab, setSuppliersSubTab] = useState<"suppliers" | "purchases">("suppliers");
  const [showAddSupplierModal, setShowAddSupplierModal] = useState<boolean>(false);
  const [supplierFormData, setSupplierFormData] = useState({ id: "", name: "", contactName: "", phone: "", address: "", openingBalance: 0, notes: "" });
  const [selectedSupplierForLedger, setSelectedSupplierForLedger] = useState<any>(null);
  const [supplierLedgerTransactions, setSupplierLedgerTransactions] = useState<any[]>([]);
  const [showSupplierLedgerModal, setShowSupplierLedgerModal] = useState<boolean>(false);
  const [showSupplierPayModal, setShowSupplierPayModal] = useState<boolean>(false);
  const [supplierPaySupplier, setSupplierPaySupplier] = useState<any>(null);
  const [supplierPayAmount, setSupplierPayAmount] = useState<string>("");
  const [supplierPayMethod, setSupplierPayMethod] = useState<string>("CASH");
  const [supplierPayNotes, setSupplierPayNotes] = useState<string>("");

  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState<boolean>(false);
  const [purchaseFormSupplierId, setPurchaseFormSupplierId] = useState<string>("");
  const [purchaseFormBranchId, setPurchaseFormBranchId] = useState<string>("CENTRAL_WAREHOUSE");
  const [purchaseFormType, setPurchaseFormType] = useState<"PURCHASE" | "RETURN">("PURCHASE");
  const [purchaseFormLines, setPurchaseFormLines] = useState<any[]>([{ variantId: "", quantity: 10, costPrice: 200 }]);
  const [purchaseFormPaidAmount, setPurchaseFormPaidAmount] = useState<number>(0);
  const [purchaseFormNotes, setPurchaseFormNotes] = useState<string>("");
  const [submittingPurchase, setSubmittingPurchase] = useState<boolean>(false);

  // --- Customer Ledger & Debt Settlement State ---
  const [selectedCustomerForLedger, setSelectedCustomerForLedger] = useState<any>(null);
  const [customerLedgerTransactions, setCustomerLedgerTransactions] = useState<any[]>([]);
  const [showCustomerLedgerModal, setShowCustomerLedgerModal] = useState<boolean>(false);
  const [showCustomerPayModal, setShowCustomerPayModal] = useState<boolean>(false);
  const [customerPayTarget, setCustomerPayTarget] = useState<any>(null);
  const [customerPayAmount, setCustomerPayAmount] = useState<string>("");
  const [customerPayMethod, setCustomerPayMethod] = useState<string>("CASH");
  const [customerPayNotes, setCustomerPayNotes] = useState<string>("");

  // --- Seasons & Choco Landing Offers State ---
  const [showAddSeasonModal, setShowAddSeasonModal] = useState<boolean>(false);
  const [seasonFormData, setSeasonFormData] = useState({ id: "", name: "", startDate: "", endDate: "", notes: "" });
  const [offersSectionEnabled, setOffersSectionEnabled] = useState<boolean>(true);
  const [offersBadgeInput, setOffersBadgeInput] = useState<string>("عروض حصرية محدودة 🔥");
  const [offersTitleInput, setOffersTitleInput] = useState<string>("العروض الخاصة والكومبوهات الملكية");
  const [offersSubtitleInput, setOffersSubtitleInput] = useState<string>("عروض استثنائية وباقات متجددة أسبوعياً — اسأل الكاشير عن عرض اليوم");
  const [offersBannerBadgeInput, setOffersBannerBadgeInput] = useState<string>("الأكثر طلباً هذا الأسبوع");
  const [offersBannerTitleInput, setOffersBannerTitleInput] = useState<string>("طقم الأوفر سايز والكارجو التكتيكال");
  const [offersBannerImageInput, setOffersBannerImageInput] = useState<string>("https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=80");
  const [offersBannerLinkTextInput, setOffersBannerLinkTextInput] = useState<string>("تصفح العرض في التشكيلة");
  const [offersBannerLinkHrefInput, setOffersBannerLinkHrefInput] = useState<string>("#collection");
  const [offersCardsList, setOffersCardsList] = useState<any[]>([
    {
      id: "combo-1",
      title: "كومبو الشارع الملكي",
      desc: "تيشرت أوفر سايز هيفي ويت + بنطلون كارجو تكتيكال بسعر 850 ج.م بدل 1100 ج.م",
      badge: "وفر 250 ج.م",
      icon: "flame",
    },
    {
      id: "combo-2",
      title: "شحن مجاني لكافة المحافظات",
      desc: "اطلب قطعتين أو أكثر والشحن مجاني بالكامل لباب بيتك مع إمكانية المعاينة قبل الاستلام",
      badge: "توصيل سريع",
      icon: "delivery",
    },
    {
      id: "combo-3",
      title: "استبدال مقاس فوري 14 يوماً",
      desc: "عاين وقيس مع المندوب وضمان استبدال المقاس مجاناً خلال 14 يوماً بأصل الفاتورة",
      badge: "ضمان ملكي",
      icon: "shield",
    },
  ]);
  const [savingOffers, setSavingOffers] = useState<boolean>(false);

  // Users Management State
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    id: "",
    username: "",
    password: "",
    pin: "",
    name: "",
    role: "cashier",
    branchId: "",
    phone: "",
    isActive: true,
  });

  // Barcode Printing state
  const [selectedTagItem, setSelectedTagItem] = useState<any>(null);
  const [batchTagItems, setBatchTagItems] = useState<any[] | null>(null);
  const [selectedBarcodeBranch, setSelectedBarcodeBranch] = useState<string>("all");

  // Add Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState<string>("");
  const [newProdCat, setNewProdCat] = useState<string>("");
  const [newProdPrice, setNewProdPrice] = useState<number>(450);
  const [newProdCost, setNewProdCost] = useState<number>(220);
  const [newProdMaterial, setNewProdMaterial] = useState<string>("قطن 100%");
  const [newProdImage, setNewProdImage] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [newProdVariants, setNewProdVariants] = useState<any[]>([
    { size: "L", color: "أسود ملكي", colorHex: "#111111", barcode: "", image: "", central: 30, b1: 10, b2: 10 },
    { size: "XL", color: "أسود ملكي", colorHex: "#111111", barcode: "", image: "", central: 30, b1: 10, b2: 10 },
  ]);

  // Edit Product Modal
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Add Variant to existing product modal
  const [showAddVariantModal, setShowAddVariantModal] = useState<boolean>(false);
  const [newVarColor, setNewVarColor] = useState<string>("أبيض ملكي");
  const [newVarColorHex, setNewVarColorHex] = useState<string>("#ffffff");
  const [newVarSize, setNewVarSize] = useState<string>("L");
  const [newVarImage, setNewVarImage] = useState<string>("");
  const [newVarCentralStock, setNewVarCentralStock] = useState<number>(20);
  const [newVarB1Stock, setNewVarB1Stock] = useState<number>(10);
  const [newVarB2Stock, setNewVarB2Stock] = useState<number>(10);

  // Variant Image Dedicated Modal (تغيير صورة أي لون أو استايل)
  const [variantImgModalData, setVariantImgModalData] = useState<{
    product: any;
    variant: any;
    imageUrl: string;
  } | null>(null);

  // Hero Banner Customization State (صورة وبيانات الهيدر والبانر الشبابي)
  const [heroBannerUrl, setHeroBannerUrl] = useState<string>("");
  const [heroTaglineInput, setHeroTaglineInput] = useState<string>("");
  const [heroDescInput, setHeroDescInput] = useState<string>("");
  const [savingHero, setSavingHero] = useState<boolean>(false);

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
      const [bRes, pRes, cRes, iRes, tRes, sRes, custRes, setRes, uRes, supRes, purRes, retRes, seaRes] = await Promise.all([
        fetch("/api/branches"),
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/invoices"),
        fetch("/api/stock-transfers"),
        fetch("/api/shifts?status=ALL"),
        fetch("/api/customers"),
        fetch("/api/settings"),
        fetch("/api/users"),
        fetch("/api/suppliers"),
        fetch("/api/purchases"),
        fetch("/api/returns"),
        fetch("/api/seasons"),
      ]);

      const [b, p, c, i, t, s, cust, st, u, sup, pur, ret, sea] = await Promise.all([
        bRes.json(),
        pRes.json(),
        cRes.json(),
        iRes.json(),
        tRes.json(),
        sRes.json(),
        custRes.json(),
        setRes.json(),
        uRes.json(),
        supRes.json(),
        purRes.json(),
        retRes.json(),
        seaRes.json(),
      ]);

      if (b.branches) setBranches(b.branches);
      if (p.products) setProducts(p.products);
      if (c.categories) setCategories(c.categories);
      if (i.invoices) setInvoices(i.invoices);
      if (t.transfers) setTransfers(t.transfers);
      if (s.shifts) setShifts(s.shifts);
      if (cust.customers) setCustomers(cust.customers);
      if (u.users) setUsersList(u.users);
      if (sup.suppliers) setSuppliers(sup.suppliers);
      if (pur.purchases) setPurchases(pur.purchases);
      if (ret.returns) setReturnsList(ret.returns);
      if (sea.seasons) setSeasons(sea.seasons);

      if (st.settings) {
        setSettings(st.settings);
        setHeroBannerUrl(st.settings.heroBannerImage || "");
        setHeroTaglineInput(st.settings.heroTagline || "");
        setHeroDescInput(st.settings.heroDescription || "");

        if (st.settings.offersSectionEnabled !== undefined) {
          setOffersSectionEnabled(st.settings.offersSectionEnabled);
        }
        if (st.settings.offersBadge) setOffersBadgeInput(st.settings.offersBadge);
        if (st.settings.offersTitle) setOffersTitleInput(st.settings.offersTitle);
        if (st.settings.offersSubtitle) setOffersSubtitleInput(st.settings.offersSubtitle);
        if (st.settings.offersBannerBadge) setOffersBannerBadgeInput(st.settings.offersBannerBadge);
        if (st.settings.offersBannerTitle) setOffersBannerTitleInput(st.settings.offersBannerTitle);
        if (st.settings.offersBannerImage) setOffersBannerImageInput(st.settings.offersBannerImage);
        if (st.settings.offersBannerLinkText) setOffersBannerLinkTextInput(st.settings.offersBannerLinkText);
        if (st.settings.offersBannerLinkHref) setOffersBannerLinkHrefInput(st.settings.offersBannerLinkHref);
        if (st.settings.offersCards) {
          try {
            const parsed = JSON.parse(st.settings.offersCards);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setOffersCardsList(parsed);
            }
          } catch (e) {
            // Ignored
          }
        }
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setDataLoading(false);
    }
  };

  // Upload image to ImgBB
  const handleImageUpload = async (file: File, onSuccess: (url: string) => void) => {
    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onSuccess(data.url);
        showToast("تم رفع الصورة بنجاح على سيرفر الصور! 📷", "success");
      } else {
        showToast(data.error || "فشل رفع الصورة على ImgBB", "error");
      }
    } catch (e) {
      showToast("حدث خطأ أثناء رفع الصورة", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // User Management Actions
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.users) setUsersList(data.users);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      id: "",
      username: "",
      password: "",
      pin: "",
      name: "",
      role: "cashier",
      branchId: branches[0]?.id || "",
      phone: "",
      isActive: true,
    });
    setShowAddUserModal(true);
  };

  const handleOpenEditUser = (u: any) => {
    setEditingUser(u);
    setUserFormData({
      id: u.id,
      username: u.username,
      password: u.password || "",
      pin: u.pin || "",
      name: u.name,
      role: u.role,
      branchId: u.branchId || "",
      phone: u.phone || "",
      isActive: u.isActive,
    });
    setShowAddUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!userFormData.name || !userFormData.username) {
      showToast("يرجى ملء الاسم واسم المستخدم", "error");
      return;
    }
    if (!editingUser && !userFormData.password) {
      showToast("يرجى إدخال كلمة المرور", "error");
      return;
    }

    try {
      if (editingUser) {
        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userFormData),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`تم تحديث بيانات المستخدم (${userFormData.name}) بنجاح!`, "success");
          setShowAddUserModal(false);
          fetchUsers();
        } else {
          showToast(data.error || "فشل تحديث بيانات المستخدم", "error");
        }
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userFormData),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`تم إنشاء حساب (${userFormData.name}) بنجاح!`, "success");
          setShowAddUserModal(false);
          fetchUsers();
        } else {
          showToast(data.error || "فشل إنشاء الحساب", "error");
        }
      }
    } catch (e) {
      showToast("حدث خطأ أثناء حفظ بيانات المستخدم", "error");
    }
  };

  const handleToggleUserActive = async (u: any) => {
    if (u.role === "owner") {
      showToast("لا يمكن تعطيل حساب المالك الرئيسي Maestro", "error");
      return;
    }
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, isActive: !u.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          u.isActive
            ? `تم تعطيل حساب (${u.name}) مؤقتاً`
            : `تم تفعيل حساب (${u.name}) بنجاح`,
          "success"
        );
        fetchUsers();
      } else {
        showToast(data.error || "فشل تعديل حالة الحساب", "error");
      }
    } catch (e) {
      showToast("حدث خطأ أثناء تعديل الحساب", "error");
    }
  };

  const handleDeleteUser = async (u: any) => {
    if (u.role === "owner") {
      showToast("غير مسموح بحذف حساب المالك Maestro", "error");
      return;
    }
    try {
      const res = await fetch(`/api/users?id=${u.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast(`تم حذف حساب (${u.name}) بنجاح`, "success");
        fetchUsers();
      } else {
        showToast(data.error || "فشل حذف الحساب", "error");
      }
    } catch (e) {
      showToast("حدث خطأ أثناء الحذف", "error");
    }
  };

  // Add Variant directly to currently editing product
  const handleAddVariantToProduct = async () => {
    if (!editingProduct) return;
    if (!newVarColor || !newVarSize) {
      showToast("يرجى إدخال اسم اللون والمقاس", "error");
      return;
    }

    try {
      const payload = {
        action: "ADD_VARIANT",
        productId: editingProduct.id,
        color: newVarColor,
        colorHex: newVarColorHex,
        size: newVarSize,
        image: newVarImage || editingProduct.featuredImage || null,
        barcode: `200${Date.now().toString().slice(-8)}`,
        stockCentral: newVarCentralStock,
        branchStocks: {
          [branches[0]?.id]: newVarB1Stock,
          [branches[1]?.id]: newVarB2Stock,
        },
      };

      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.variant) {
        showToast(`تمت إضافة لون (${newVarColor}) بنجاح لهذا الموديل!`, "success");
        setShowAddVariantModal(false);
        setEditingProduct((prev: any) => ({
          ...prev,
          variants: [...(prev.variants || []), data.variant],
        }));
        setNewVarColor("أبيض ملكي");
        setNewVarImage("");
        fetchAllData();
      } else {
        showToast(data.error || "فشل إضافة اللون", "error");
      }
    } catch (e) {
      showToast("حدث خطأ أثناء إضافة اللون", "error");
    }
  };

  // --- Returns & Exchanges Handlers ---
  const handleLookupInvoiceForReturn = async () => {
    if (!returnSearchInput.trim()) {
      showToast("يرجى إدخال رقم الفاتورة أو هاتف العميل", "error");
      return;
    }
    try {
      const res = await fetch(`/api/returns?lookupInvoice=${encodeURIComponent(returnSearchInput.trim())}`);
      const data = await res.json();
      if (data.invoice) {
        setLookedUpInvoice(data.invoice);
        setReturnBranchId(data.invoice.branchId || branches[0]?.id || "");
        setSelectedReturnItems({});
        showToast(`تم العثور على الفاتورة (${data.invoice.invoiceNumber}) بنجاح!`, "success");
      } else {
        setLookedUpInvoice(null);
        showToast(data.error || "لم يتم العثور على الفاتورة", "error");
      }
    } catch (e) {
      showToast("حدث خطأ أثناء البحث عن الفاتورة", "error");
    }
  };

  const handleExecuteReturn = async () => {
    if (!lookedUpInvoice) return;
    const selectedKeys = Object.keys(selectedReturnItems);
    if (selectedKeys.length === 0) {
      showToast("يرجى تحديد قطعة واحدة على الأقل لإرجاعها أو استبدالها", "error");
      return;
    }

    const linesToReturn = selectedKeys
      .map((varId) => ({
        variantId: varId,
        quantity: selectedReturnItems[varId].quantity,
        unitPrice: selectedReturnItems[varId].unitPrice,
      }))
      .filter((l) => l.quantity > 0);

    if (linesToReturn.length === 0) {
      showToast("يرجى التأكد من أن الكميات المسترجعة أكبر من صفر", "error");
      return;
    }

    const refundAmt = linesToReturn.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

    try {
      setSubmittingReturn(true);
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalInvoiceId: lookedUpInvoice.id,
          customerId: lookedUpInvoice.customerId,
          branchId: returnBranchId || branches[0]?.id,
          type: returnType,
          settlementType: returnSettlementType,
          refundAmount: refundAmt,
          reason: returnReason,
          lines: linesToReturn,
        }),
      });

      const data = await res.json();
      if (data.success && data.returnInvoice) {
        showToast(`تم تسجيل إذن المرتجع (${data.returnInvoice.returnNumber}) وإرجاع البضاعة للمخزن! 👑`, "success");
        setLookedUpInvoice(null);
        setSelectedReturnItems({});
        setReturnSearchInput("");
        fetchAllData();
      } else {
        showToast(data.error || "فشل تسجيل المرتجع", "error");
      }
    } catch (e) {
      showToast("حدث خطأ أثناء تسجيل المرتجع", "error");
    } finally {
      setSubmittingReturn(false);
    }
  };

  // --- Suppliers & Purchases Handlers ---
  const handleSaveSupplier = async () => {
    if (!supplierFormData.name.trim()) {
      showToast("اسم المورد أو المصنع حقل إلزامي", "error");
      return;
    }

    try {
      const res = await fetch("/api/suppliers", {
        method: supplierFormData.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierFormData),
      });

      const data = await res.json();
      if (data.success) {
        showToast(supplierFormData.id ? "تم تحديث بيانات المورد بنجاح" : "تمت إضافة المورد الجديد بنجاح! 🏭", "success");
        setShowAddSupplierModal(false);
        setSupplierFormData({ id: "", name: "", contactName: "", phone: "", address: "", openingBalance: 0, notes: "" });
        fetchAllData();
      } else {
        showToast(data.error || "فشل حفظ بيانات المورد", "error");
      }
    } catch (e) {
      showToast("حدث خطأ أثناء حفظ المورد", "error");
    }
  };

  const handleOpenSupplierLedger = async (sup: any) => {
    setSelectedSupplierForLedger(sup);
    setShowSupplierLedgerModal(true);
    try {
      const res = await fetch(`/api/suppliers/transactions?supplierId=${sup.id}`);
      const data = await res.json();
      if (data.transactions) {
        setSupplierLedgerTransactions(data.transactions);
      }
    } catch (e) {
      showToast("فشل تحميل كشف حساب المورد", "error");
    }
  };

  const handleExecuteSupplierPay = async () => {
    if (!supplierPaySupplier) return;
    const amt = parseFloat(supplierPayAmount);
    if (!amt || amt <= 0) {
      showToast("يرجى إدخال مبلغ دفع صحيح أكبر من صفر", "error");
      return;
    }

    try {
      const res = await fetch("/api/suppliers/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: supplierPaySupplier.id,
          amount: amt,
          paymentMethod: supplierPayMethod,
          notes: supplierPayNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`تم سداد ${amt} ج.م للمورد (${supplierPaySupplier.name}) وتحديث الرصيد! 💵`, "success");
        setShowSupplierPayModal(false);
        setSupplierPayAmount("");
        setSupplierPayNotes("");
        fetchAllData();
      } else {
        showToast(data.error || "فشل تسجيل دفعة السداد", "error");
      }
    } catch (e) {
      showToast("حدث خطأ أثناء تسجيل السداد", "error");
    }
  };

  const handleExecutePurchase = async () => {
    if (!purchaseFormSupplierId) {
      showToast("يرجى اختيار المورد أولاً", "error");
      return;
    }
    const validLines = purchaseFormLines.filter((l) => l.variantId && l.quantity > 0);
    if (validLines.length === 0) {
      showToast("يرجى إضافة صنف واحد على الأقل مع تحديد الكمية وسعر التكلفة", "error");
      return;
    }

    const totalAmt = validLines.reduce((acc, l) => acc + l.quantity * l.costPrice, 0);

    try {
      setSubmittingPurchase(true);
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: purchaseFormSupplierId,
          branchId: purchaseFormBranchId === "CENTRAL_WAREHOUSE" ? null : purchaseFormBranchId,
          type: purchaseFormType,
          totalAmount: totalAmt,
          paidAmount: purchaseFormPaidAmount,
          notes: purchaseFormNotes,
          lines: validLines,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          purchaseFormType === "PURCHASE"
            ? `تم تسجيل فاتورة المشتريات (${data.purchaseInvoice.invoiceNumber}) وزيادة المخزون! 📦`
            : `تم تسجيل مردودات المشتريات وتخفيض مديونية المورد! ↩️`,
          "success"
        );
        setShowAddPurchaseModal(false);
        setPurchaseFormLines([{ variantId: "", quantity: 10, costPrice: 200 }]);
        setPurchaseFormPaidAmount(0);
        setPurchaseFormNotes("");
        fetchAllData();
      } else {
        showToast(data.error || "فشل تسجيل الفاتورة", "error");
      }
    } catch (e) {
      showToast("حدث خطأ في الاتصال بالخادم", "error");
    } finally {
      setSubmittingPurchase(false);
    }
  };

  // --- Customer Ledger & Settlement Handlers ---
  const handleOpenCustomerLedger = async (cust: any) => {
    setSelectedCustomerForLedger(cust);
    setShowCustomerLedgerModal(true);
    try {
      const res = await fetch(`/api/customers/transactions?customerId=${cust.id}`);
      const data = await res.json();
      if (data.transactions) {
        setCustomerLedgerTransactions(data.transactions);
      }
    } catch (e) {
      showToast("فشل استرجاع كشف حساب العميل", "error");
    }
  };

  const handleExecuteCustomerPay = async () => {
    if (!customerPayTarget) return;
    const amt = parseFloat(customerPayAmount);
    if (!amt || amt <= 0) {
      showToast("يرجى إدخال مبلغ تحصيل صحيح أكبر من صفر", "error");
      return;
    }

    try {
      const res = await fetch("/api/customers/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerPayTarget.id,
          amount: amt,
          paymentMethod: customerPayMethod,
          notes: customerPayNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`تم تحصيل ${amt} ج.م من العميل (${customerPayTarget.name}) وتسوية المديونية! 🌟`, "success");
        setShowCustomerPayModal(false);
        setCustomerPayAmount("");
        setCustomerPayNotes("");
        fetchAllData();
      } else {
        showToast(data.error || "فشل تسجيل التحصيل", "error");
      }
    } catch (e) {
      showToast("حدث خطأ أثناء تسجيل السداد", "error");
    }
  };

  // --- Seasons & Choco Landing Offers Handlers ---
  const handleSaveSeason = async () => {
    if (!seasonFormData.name.trim()) {
      showToast("اسم الموسم حقل إلزامي", "error");
      return;
    }

    try {
      const res = await fetch("/api/seasons", {
        method: seasonFormData.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seasonFormData),
      });

      const data = await res.json();
      if (data.success) {
        showToast(seasonFormData.id ? "تم تحديث الموسم بنجاح" : "تمت إضافة الموسم الجديد بنجاح! ☀️", "success");
        setShowAddSeasonModal(false);
        setSeasonFormData({ id: "", name: "", startDate: "", endDate: "", notes: "" });
        fetchAllData();
      } else {
        showToast(data.error || "فشل حفظ الموسم", "error");
      }
    } catch (e) {
      showToast("حدث خطأ في حفظ الموسم", "error");
    }
  };

  const handleSaveLandingOffers = async () => {
    try {
      setSavingOffers(true);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offersSectionEnabled,
          offersBadge: offersBadgeInput,
          offersTitle: offersTitleInput,
          offersSubtitle: offersSubtitleInput,
          offersCards: JSON.stringify(offersCardsList),
          offersBannerBadge: offersBannerBadgeInput,
          offersBannerTitle: offersBannerTitleInput,
          offersBannerImage: offersBannerImageInput,
          offersBannerLinkText: offersBannerLinkTextInput,
          offersBannerLinkHref: offersBannerLinkHrefInput,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        showToast("✅ تم حفظ وتحديث قسم العروض الملكية وتظهر فورياً في الصفحة الرئيسية كالمحترفين!", "success");
      } else {
        showToast(data.error || "فشل حفظ إعدادات العروض", "error");
      }
    } catch (e) {
      showToast("حدث خطأ في الاتصال بالخادم", "error");
    } finally {
      setSavingOffers(false);
    }
  };

  // Helper to trigger batch print for a single product across all its variants
  const handleBatchPrintProduct = (prod: any, branchId: string = selectedBarcodeBranch) => {
    if (!prod?.variants || prod.variants.length === 0) {
      showToast("لا توجد مقاسات أو ألوان مسجلة لهذا الموديل", "error");
      return;
    }

    const targetBranch = branches.find((b) => b.id === branchId);
    const bName = targetBranch ? targetBranch.name : undefined;

    const items = prod.variants.map((v: any) => {
      let qty = 1;
      if (branchId === "central") {
        qty = v.stockCentral || 1;
      } else if (branchId && branchId !== "all") {
        const bStock = v.branchStocks?.find((bs: any) => bs.branchId === branchId);
        qty = bStock?.quantity && bStock.quantity > 0 ? bStock.quantity : 1;
      } else {
        const totalStock =
          (v.stockCentral || 0) +
          (v.branchStocks?.reduce((acc: number, bs: any) => acc + (bs.quantity || 0), 0) || 0);
        qty = totalStock > 0 ? totalStock : 1;
      }

      return {
        productName: prod.nameAr,
        size: v.size,
        color: v.color,
        barcode: v.barcode,
        price: v.priceOverride || prod.basePrice,
        branchName: bName,
        quantity: Math.max(1, qty),
      };
    });

    setBatchTagItems(items);
  };

  // Helper to trigger batch print for all products in a branch
  const handleBatchPrintEntireBranch = (branchId: string = selectedBarcodeBranch) => {
    const targetBranch = branches.find((b) => b.id === branchId);
    const bName = targetBranch ? targetBranch.name : "بزار كاجوال";

    const allItems: any[] = [];
    products.forEach((prod) => {
      prod.variants?.forEach((v: any) => {
        let qty = 0;
        if (branchId === "central") {
          qty = v.stockCentral || 0;
        } else if (branchId && branchId !== "all") {
          const bStock = v.branchStocks?.find((bs: any) => bs.branchId === branchId);
          qty = bStock?.quantity || 0;
        } else {
          qty =
            (v.stockCentral || 0) +
            (v.branchStocks?.reduce((acc: number, bs: any) => acc + (bs.quantity || 0), 0) || 0);
        }

        if (qty > 0) {
          allItems.push({
            productName: prod.nameAr,
            size: v.size,
            color: v.color,
            barcode: v.barcode,
            price: v.priceOverride || prod.basePrice,
            branchName: bName,
            quantity: qty,
          });
        }
      });
    });

    if (allItems.length === 0) {
      showToast("لا توجد بضاعة برصيد موجب في هذا التحديد لطباعة تكتاتها", "error");
      return;
    }

    setBatchTagItems(allItems);
  };

  // Login handler
  const handleLogin = async (type: "credentials" | "pin") => {
    try {
      setAuthLoading(true);
      setLoginError("");

      const payload =
        type === "pin"
          ? { loginType: "pin", pin: loginPin }
          : { username: loginUsername, password: loginPassword, pin: loginPin };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem("bazaar_user", JSON.stringify(data.user));
        showToast(`مرحباً بك يا ${data.user.name} 👑!`, "success");
      } else {
        setLoginError(data.error || "بيانات الدخول غير صحيحة");
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

  // Inline Stock Update (Directly edits stock in DB!)
  const handleInlineStockUpdate = async (variantId: string, location: string, currentQty: number) => {
    const input = prompt("أدخل رصيد القطع الجديد في هذه الخزينة:", String(currentQty));
    if (input === null) return;
    const qty = parseInt(input, 10);
    if (isNaN(qty) || qty < 0) {
      showToast("يرجى إدخال رقم صحيح", "error");
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STOCK",
          variantId,
          location,
          quantity: qty,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("تم تحديث رصيد القطعة بنجاح!", "success");
        fetchAllData();
      } else {
        showToast(data.error || "فشل تحديث الرصيد", "error");
      }
    } catch (e) {
      showToast("حدث خطأ في الاتصال", "error");
    }
  };

  // Save Edited Product
  const handleSaveProductEdit = async () => {
    if (!editingProduct) return;
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct.id,
          nameAr: editingProduct.nameAr,
          basePrice: editingProduct.basePrice,
          costPrice: editingProduct.costPrice,
          material: editingProduct.material,
          featuredImage: editingProduct.featuredImage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingProduct(null);
        fetchAllData();
        showToast("تم تحديث بيانات الموديل بنجاح في قاعدة البيانات!", "success");
      } else {
        showToast(data.error || "فشل التحديث", "error");
      }
    } catch (e) {
      showToast("حدث خطأ أثناء الحفظ", "error");
    }
  };

  // Save Hero Banner Settings (تحديث صورة الهيدر والبانر الشبابي)
  const handleSaveHeroSettings = async () => {
    try {
      setSavingHero(true);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroBannerImage: heroBannerUrl,
          heroTagline: heroTaglineInput,
          heroDescription: heroDescInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        showToast("✅ تم حفظ وتحديث صورة وبيانات الهيدر بنجاح! تظهر الآن في المتجر فورياً.", "success");
      } else {
        showToast(data.error || "فشل الحفظ", "error");
      }
    } catch (e) {
      showToast("حدث خطأ في الاتصال", "error");
    } finally {
      setSavingHero(false);
    }
  };

  // Save Specific Variant Image (تحديث صورة لون محدد لموديل)
  const handleSaveVariantImage = async () => {
    if (!variantImgModalData) return;
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_VARIANT_IMAGE",
          variantId: variantImgModalData.variant.id,
          image: variantImgModalData.imageUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVariantImgModalData(null);
        fetchAllData();
        showToast(`✅ تم تحديث صورة لون (${variantImgModalData.variant.color}) بنجاح!`, "success");
      } else {
        showToast(data.error || "فشل التحديث", "error");
      }
    } catch (e) {
      showToast("خطأ أثناء الحفظ", "error");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast(`تم حذف الموديل (${name}) بنجاح`, "success");
        fetchAllData();
      } else {
        showToast(data.error || "فشل الحذف", "error");
      }
    } catch (e) {
      showToast("خطأ أثناء الحذف", "error");
    }
  };

  // Toggle Master Lockout
  const handleToggleMasterLock = async (enableLock: boolean) => {
    if (!lockPinInput) {
      showToast("يرجى إدخال الرمز السري للمايسترو (PIN)", "error");
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
        showToast(
          enableLock
            ? "⚠️ تم تفعيل وضع الطوارئ! جميع حسابات الموظفين مقفلة حالياً لضمان الملكية."
            : "✅ تم إلغاء وضع الطوارئ وفتح النظام لجميع الفروع.",
          "success"
        );
      } else {
        showToast(data.error || "فشل تعديل حالة الطوارئ", "error");
      }
    } catch (e) {
      showToast("حدث خطأ في الاتصال", "error");
    }
  };

  // Create Product
  const handleCreateProduct = async () => {
    if (!newProdName) {
      showToast("يرجى إدخال اسم الموديل", "error");
      return;
    }

    try {
      const payload = {
        nameAr: newProdName,
        categoryId: newProdCat || undefined,
        basePrice: newProdPrice,
        costPrice: newProdCost,
        material: newProdMaterial,
        featuredImage: newProdImage || undefined,
        variants: newProdVariants.map((v, idx) => ({
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || "#111111",
          image: v.image || newProdImage || undefined,
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
        setNewProdName("");
        setNewProdImage("");
        fetchAllData();
        showToast("تمت إضافة المنتج بنجاح وتوليد الباركود ورفع الصور بنجاح! 👑", "success");
      } else {
        showToast(data.error || "فشل حفظ المنتج", "error");
      }
    } catch (e) {
      showToast("حدث خطأ أثناء حفظ المنتج", "error");
    }
  };

  // Stock Transfer Execute
  const handleExecuteTransfer = async () => {
    if (!transferFrom || !transferTo || !transferVariantId) {
      showToast("يرجى تحديد جهة الإرسال والاستلام والقطعة", "error");
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
        showToast("تم تسجيل وتنفيذ إذن تحويل البضاعة ونقل الأرصدة فورياً!", "success");
      } else {
        showToast(data.error || "فشل التحويل", "error");
      }
    } catch (e) {
      showToast("خطأ أثناء الاتصال بالخادم", "error");
    }
  };

  // Gemini Vision AI Ingestion
  const handleAiIngest = async () => {
    if (!aiImageFile) {
      showToast("يرجى اختيار صورة الفاتورة أو كشف الجرد أولاً", "error");
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
        showToast("تم تحليل الفاتورة واستخراج الأصناف بالذكاء الاصطناعي بنجاح! 🤖", "success");
      } else {
        showToast(data.error || "فشل استخراج البيانات بالذكاء الاصطناعي", "error");
      }
    } catch (e) {
      showToast("خطأ في معالجة الذكاء الاصطناعي", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // -------------------------------------------------------------
  // If NOT logged in: STRICT LOGIN SCREEN (NO AUTOFILL, NO HINTS, BACK BUTTON)
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#07070b] via-[#101018] to-[#07070b] text-white flex items-center justify-center p-4 font-['Cairo',sans-serif]">
        <div className="bg-[#12121a] border border-[#00ff66]/30 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
          {/* Back to Storefront Link (لمنع الحبس!) */}
          <div className="mb-4">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all"
            >
              <ChevronLeft size={16} className="rotate-180" />
              <span>الرجوع للمتجر والكتالوج الرئيسي</span>
            </a>
          </div>

          <div className="text-center pb-6">
            <BrandLogo size="lg" />
            <p className="text-xs text-white/50 mt-2">
              بوابة الدخول المركزية للإدارة والمايسترو ونقاط البيع
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
                autoComplete="off"
                className="w-full bg-black/60 border border-white/15 focus:border-[#00ff66] rounded-xl py-2.5 px-3 text-xs text-white outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">كلمة المرور:</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-black/60 border border-white/15 focus:border-[#00ff66] rounded-xl py-2.5 px-3 text-xs text-white outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">الرمز السري الخاص (PIN):</label>
              <input
                type="password"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-black/60 border border-white/15 focus:border-[#00ff66] rounded-xl py-2.5 px-3 text-xs text-white outline-none font-mono text-center tracking-widest"
              />
            </div>

            <button
              onClick={() => handleLogin("credentials")}
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-[#00ff66] to-emerald-500 hover:brightness-110 text-black font-black py-3.5 rounded-xl text-xs shadow-lg shadow-[#00ff66]/20 active:scale-95 transition-all"
            >
              {authLoading ? "جاري التحقق..." : "تسجيل الدخول للنظام 🔐"}
            </button>
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
    <div className="min-h-screen bg-[#07070b] text-gray-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Top Admin Navbar with Real Neon Brand Signage */}
      <header className="bg-[#0c0c14] border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <a href="/" className="hover:opacity-90 transition-opacity">
            <BrandLogo size="sm" showTagline={false} />
          </a>
          <span className="text-[10px] bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 px-2 py-0.5 rounded-md font-mono font-bold">
            ERP CENTRAL
          </span>

          {/* Emergency Lock Status Indicator */}
          {settings?.isMasterLocked && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-xl text-xs font-bold text-red-300 animate-pulse">
              <Lock size={12} />
              <span>وضع الطوارئ نشط (الحسابات معطلة)</span>
            </div>
          )}
        </div>

        {/* User Badge, Emergency Lock button, POS direct link, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-white/60 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl transition-all"
          >
            <span>المتجر أونلاين 🛍️</span>
          </a>

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
            className="bg-[#ffb703] hover:bg-amber-400 text-black px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md shadow-[#ffb703]/20 flex items-center gap-1.5 transition-all"
          >
            <span>شاشة الكاشير POS</span>
          </a>

          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-white">{currentUser.name}</div>
            <div className="text-[10px] text-[#00ff66] uppercase font-mono">{currentUser.role}</div>
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

      {/* Responsive Horizontal Tabs Bar - Perfectly Scaled for Laptops & Mobile */}
      <nav className="bg-[#0a0a12] border-b border-white/5 px-3 sm:px-4 overflow-x-auto no-scrollbar">
        <div className="flex flex-wrap items-center gap-1.5 max-w-7xl mx-auto py-2">
          {[
            { id: "overview", label: "نظرة عامة والتحليلات", icon: BarChart3 },
            { id: "inventory", label: "المخزون والمخزن المركزي", icon: Package },
            { id: "returns", label: "مردودات المبيعات والاستبدال", icon: RotateCcw },
            { id: "purchases", label: "المشتريات والموردين", icon: Truck },
            { id: "customers", label: "العملاء والحسابات", icon: Users },
            { id: "seasons", label: "المواسم وعروض الشارع", icon: Flame },
            { id: "transfers", label: "أذون تحويل البضاعة", icon: ArrowRightLeft },
            { id: "treasury", label: "الخزينة والورديات", icon: DollarSign },
            { id: "barcodes", label: "طباعة الباركود والتيكت", icon: Barcode },
            { id: "ai", label: "فحص الفواتير بالذكاء الاصطناعي", icon: Bot },
            { id: "users", label: "طاقم العمل والمايسترو", icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  isSelected
                    ? "bg-[#00ff66] text-black border-[#00ff66] shadow-md shadow-[#00ff66]/30 font-black"
                    : "bg-white/5 text-white/70 border-white/5 hover:border-white/15 hover:text-white"
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#12121a] border border-[#00ff66]/30 rounded-2xl space-y-1">
                <span className="text-[11px] text-white/50 font-bold">إجمالي المبيعات (الفرعين)</span>
                <div className="text-2xl font-black text-[#ffb703] font-mono">
                  {totalGrossRevenue.toLocaleString("ar-EG")} <span className="text-xs text-white/60">ج.م</span>
                </div>
                <span className="text-[10px] text-[#00ff66]">منظومة مدمجة</span>
              </div>

              <div className="p-4 bg-[#12121a] border border-white/10 rounded-2xl space-y-1">
                <span className="text-[11px] text-white/50 font-bold">مبيعات فرع عباس العقاد</span>
                <div className="text-xl font-black text-white font-mono">
                  {branch1Revenue.toLocaleString("ar-EG")} <span className="text-xs text-white/60">ج.م</span>
                </div>
                <span className="text-[10px] text-white/40">الفرع الرئيسي</span>
              </div>

              <div className="p-4 bg-[#12121a] border border-white/10 rounded-2xl space-y-1">
                <span className="text-[11px] text-white/50 font-bold">مبيعات فرع كشري التحرير</span>
                <div className="text-xl font-black text-white font-mono">
                  {branch2Revenue.toLocaleString("ar-EG")} <span className="text-xs text-white/60">ج.م</span>
                </div>
                <span className="text-[10px] text-white/40">الفرع الثاني</span>
              </div>

              <div className="p-4 bg-[#12121a] border border-white/10 rounded-2xl space-y-1">
                <span className="text-[11px] text-white/50 font-bold">عدد الفواتير المنفذة</span>
                <div className="text-2xl font-black text-white font-mono">{totalInvoicesCount}</div>
                <span className="text-[10px] text-[#ffb703]">إجمالي شيكات البيع</span>
              </div>
            </div>

            {/* Dynamic Hero Banner Manager (تخصيص صورة الهيدر الشبابي) */}
            <div className="bg-[#12121a] border border-[#00ff66]/30 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-[#00ff66]/10 text-[#00ff66] rounded-xl text-lg">🖼️</span>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      تخصيص صورة الهيدر والبانر الرئيسي (الاستايل الشبابي)
                    </h3>
                    <p className="text-[11px] text-white/50">
                      يمكنك في أي وقت تغيير صورة الطقم الشبابي المعروضة بالهيدر في الصفحة الرئيسية ورفع أي صورة جديدة من جهازك
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Hero Image Preview */}
                <div className="md:col-span-4 bg-black/60 rounded-2xl p-3 border border-white/10 text-center">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/80 border border-white/10 mb-2">
                    {heroBannerUrl ? (
                      <img
                        src={heroBannerUrl}
                        alt="Hero Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        👕
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-white/50">معاينة الصورة المعروضة بالهيدر</span>
                </div>

                {/* Form Controls */}
                <div className="md:col-span-8 space-y-3 text-xs">
                  <div>
                    <label className="block mb-1 text-white/70 font-bold">
                      رابط صورة الهيدر (أو ارفع صورة طقم شبابي من جهازك):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={heroBannerUrl}
                        onChange={(e) => setHeroBannerUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-black/50 border border-white/15 focus:border-[#00ff66] rounded-xl p-2.5 text-white font-mono text-xs outline-none"
                      />
                      <label className="bg-[#00ff66] hover:bg-emerald-400 text-black px-3.5 py-2.5 rounded-xl text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#00ff66]/20 transition-all">
                        <Upload size={14} />
                        <span>{uploadingImage ? "جاري الرفع..." : "رفع صورة جديدة"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, (url) => setHeroBannerUrl(url));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-white/70 font-bold">عنوان الطقم المميز:</label>
                      <input
                        type="text"
                        value={heroTaglineInput}
                        onChange={(e) => setHeroTaglineInput(e.target.value)}
                        placeholder="مثال: طقم الأوفر سايز والكارجو التكتيكال"
                        className="w-full bg-black/50 border border-white/15 focus:border-[#00ff66] rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-white/70 font-bold">وصف الخامات القصير:</label>
                      <input
                        type="text"
                        value={heroDescInput}
                        onChange={(e) => setHeroDescInput(e.target.value)}
                        placeholder="مثال: قطن مصري 100% هيفي ويت معالج ضد الانكماش"
                        className="w-full bg-black/50 border border-white/15 focus:border-[#00ff66] rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveHeroSettings}
                    disabled={savingHero}
                    className="w-full bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:brightness-110 text-black font-black py-2.5 rounded-xl text-xs shadow-md shadow-[#ffb703]/20 active:scale-95 transition-all mt-1"
                  >
                    {savingHero ? "جاري حفظ التعديلات..." : "حفظ وتحديث صورة وبيانات الهيدر فورياً ⚡"}
                  </button>
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div className="bg-[#12121a] border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <FileText size={16} className="text-[#00ff66]" />
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
                        <td className="py-2.5 font-mono text-[#ffb703] font-bold">{inv.invoiceNumber}</td>
                        <td className="py-2.5">{inv.branch?.name}</td>
                        <td className="py-2.5 text-white/70">{inv.user?.name || "كاشير"}</td>
                        <td className="py-2.5 font-bold">
                          {inv.paymentMethod === "CASH" && "كاش"}
                          {inv.paymentMethod === "VISA" && "فيزا"}
                          {inv.paymentMethod === "INSTAPAY" && "إنستاباي"}
                          {inv.paymentMethod === "SPLIT" && "مقسم"}
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
          </div>
        )}

        {/* TAB 2: DYNAMIC INVENTORY & WAREHOUSE */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#12121a] p-4 rounded-3xl border border-white/10">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>المخزون الديناميكي والمخزن المركزي المشترك</span>
                  <span className="text-[10px] bg-[#00ff66]/10 text-[#00ff66] px-2 py-0.5 rounded-full font-bold">
                    تعديل حي وفوري
                  </span>
                </h3>
                <p className="text-xs text-white/50">
                  اضغط على أي رقم رصيد لتعديله فورياً في قاعدة البيانات، أو اضغط تعديل لتغيير صور وأسعار الموديل
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-gradient-to-r from-[#00ff66] to-emerald-500 hover:brightness-110 text-black px-4 py-2 rounded-xl text-xs font-black shadow-md shadow-[#00ff66]/20 flex items-center gap-1.5 transition-all"
                >
                  <Plus size={16} />
                  <span>إضافة موديل جديد + رفع صورة</span>
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

            {/* Dynamic Products Table */}
            <div className="bg-[#12121a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-white/5 text-white/60 font-bold border-b border-white/10">
                      <th className="p-3">صورة القطعة</th>
                      <th className="p-3">الموديل والاسم</th>
                      <th className="p-3">القسم</th>
                      <th className="p-3">المقاس واللون</th>
                      <th className="p-3">الباركود</th>
                      <th className="p-3">سعر البيع</th>
                      <th className="p-3">سعر التكلفة</th>
                      <th className="p-3 text-center">المخزن المركزي</th>
                      <th className="p-3 text-center">فرع عباس</th>
                      <th className="p-3 text-center">فرع التحرير</th>
                      <th className="p-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map((p) =>
                      p.variants.map((v: any, vIdx: number) => {
                        const b1Stock = v.branchStocks?.find(
                          (bs: any) => bs.branchId === branches[0]?.id
                        )?.quantity || 0;
                        const b2Stock = v.branchStocks?.find(
                          (bs: any) => bs.branchId === branches[1]?.id
                        )?.quantity || 0;
                        const img = v.image || p.featuredImage;

                        return (
                          <tr key={v.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-2.5">
                              <div
                                onClick={() =>
                                  setVariantImgModalData({
                                    product: p,
                                    variant: v,
                                    imageUrl: v.image || p.featuredImage || "",
                                  })
                                }
                                className="relative group/thumb cursor-pointer inline-block"
                                title="اضغط لتغيير أو رفع صورة لهذا اللون بالذات"
                              >
                                {img ? (
                                  <img
                                    src={img}
                                    alt={p.nameAr}
                                    className="w-10 h-10 rounded-lg object-cover border border-white/10 group-hover/thumb:border-[#00ff66]"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-xs">
                                    👕
                                  </div>
                                )}
                                <span className="absolute inset-0 bg-black/70 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-[9px] text-[#00ff66] font-bold rounded-lg transition-opacity">
                                  📷 تعديل
                                </span>
                              </div>
                            </td>
                            <td className="p-2.5 font-bold text-white">
                              <div>{p.nameAr}</div>
                              {p.material && (
                                <div className="text-[10px] text-white/40">{p.material}</div>
                              )}
                            </td>
                            <td className="p-2.5 text-white/50">{p.category?.nameAr || "كاجوال"}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded bg-white/10 text-[#00ff66] font-bold">
                                {v.size} ({v.color})
                              </span>
                            </td>
                            <td className="p-2.5 font-mono text-white/70">{v.barcode}</td>
                            <td className="p-2.5 font-black text-[#ffb703] font-mono">
                              {v.priceOverride || p.basePrice} ج
                            </td>
                            <td className="p-2.5 font-mono text-white/50">
                              {v.costPriceOverride || p.costPrice} ج
                            </td>

                            {/* INLINE EDITABLE STOCKS */}
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() =>
                                  handleInlineStockUpdate(v.id, "CENTRAL_WAREHOUSE", v.stockCentral)
                                }
                                className="font-bold text-blue-400 font-mono hover:underline hover:bg-blue-500/10 px-2 py-0.5 rounded"
                                title="اضغط لتعديل رصيد المخزن المركزي"
                              >
                                {v.stockCentral} ✏️
                              </button>
                            </td>

                            <td className="p-2.5 text-center">
                              <button
                                onClick={() =>
                                  handleInlineStockUpdate(v.id, branches[0]?.id, b1Stock)
                                }
                                className={`font-bold font-mono px-2 py-0.5 rounded hover:underline ${
                                  b1Stock <= 2 ? "bg-red-500/20 text-red-400" : "text-green-400"
                                }`}
                                title="اضغط لتعديل رصيد فرع عباس"
                              >
                                {b1Stock} ✏️
                              </button>
                            </td>

                            <td className="p-2.5 text-center">
                              <button
                                onClick={() =>
                                  handleInlineStockUpdate(v.id, branches[1]?.id, b2Stock)
                                }
                                className={`font-bold font-mono px-2 py-0.5 rounded hover:underline ${
                                  b2Stock <= 2 ? "bg-red-500/20 text-red-400" : "text-green-400"
                                }`}
                                title="اضغط لتعديل رصيد فرع التحرير"
                              >
                                {b2Stock} ✏️
                              </button>
                            </td>

                            {/* Actions: Print Barcode, Edit Product, Delete */}
                            <td className="p-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() =>
                                    setVariantImgModalData({
                                      product: p,
                                      variant: v,
                                      imageUrl: v.image || p.featuredImage || "",
                                    })
                                  }
                                  className="p-1.5 bg-[#00ff66]/10 hover:bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/30 rounded-lg text-xs"
                                  title="تغيير صورة هذا اللون بالتحديد"
                                >
                                  📷
                                </button>
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
                                  className="p-1.5 bg-[#ffb703]/10 hover:bg-[#ffb703]/20 text-[#ffb703] rounded-lg text-xs"
                                  title="طباعة استيكر الباركود"
                                >
                                  <Printer size={13} />
                                </button>
                                {vIdx === 0 && (
                                  <>
                                    <button
                                      onClick={() => handleBatchPrintProduct(p, "all")}
                                      className="p-1.5 bg-[#ffb703]/20 hover:bg-[#ffb703]/30 text-[#ffb703] border border-[#ffb703]/40 rounded-lg text-xs"
                                      title="طباعة مجمعة لكل مقاسات هذا الموديل دفعة واحدة"
                                    >
                                      🏷️⚡
                                    </button>
                                    <button
                                      onClick={() => setEditingProduct({ ...p })}
                                      className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs"
                                      title="تعديل الموديل وصورته"
                                    >
                                      <Edit size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p.id, p.nameAr)}
                                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs"
                                      title="حذف الموديل"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </>
                                )}
                              </div>
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

        {/* TAB 3: BARCODE MAKER & BATCH TAG STUDIO */}
        {activeTab === "barcodes" && (
          <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 space-y-6">
            {/* Header & Subtitle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ffb703]/10 border border-[#ffb703]/30 flex items-center justify-center text-[#ffb703] text-2xl">
                  🏷️
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">
                    استوديو طباعة باركود الملابس والتيكت الحراري الموحد (38×25 مم / 50×25 مم)
                  </h3>
                  <p className="text-xs text-white/50">
                    طباعة فردية سريعة أو طباعة مجمعة لكولكشن كامل مقسم على المقاسات والألوان وفروع البيع
                  </p>
                </div>
              </div>

              {/* Branch Selector & Master Batch Button */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-black/60 border border-white/15 px-3 py-1.5 rounded-xl">
                  <span className="text-[11px] text-white/60 font-bold">فرع التخصيص:</span>
                  <select
                    value={selectedBarcodeBranch}
                    onChange={(e) => setSelectedBarcodeBranch(e.target.value)}
                    className="bg-transparent text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#12121a] text-white">
                      جميع الفروع والمخزن (إجمالي)
                    </option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} className="bg-[#12121a] text-white">
                        {b.name}
                      </option>
                    ))}
                    <option value="central" className="bg-[#12121a] text-white">
                      المخزن المركزي الرئيسي فقط
                    </option>
                  </select>
                </div>

                <button
                  onClick={() => handleBatchPrintEntireBranch(selectedBarcodeBranch)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Printer size={15} />
                  <span>⚡ طباعة بضاعة الفرع بالكامل دفعة واحدة</span>
                </button>
              </div>
            </div>

            {/* Products Grouped with Batch Controls */}
            <div className="space-y-4">
              {products.map((p) => {
                const totalModelStock = p.variants?.reduce((acc: number, v: any) => {
                  if (selectedBarcodeBranch === "central") return acc + (v.stockCentral || 0);
                  if (selectedBarcodeBranch && selectedBarcodeBranch !== "all") {
                    const bs = v.branchStocks?.find((b: any) => b.branchId === selectedBarcodeBranch);
                    return acc + (bs?.quantity || 0);
                  }
                  return (
                    acc +
                    (v.stockCentral || 0) +
                    (v.branchStocks?.reduce((bacc: number, b: any) => bacc + (b.quantity || 0), 0) || 0)
                  );
                }, 0) || 0;

                return (
                  <div
                    key={p.id}
                    className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3 hover:border-white/20 transition-all"
                  >
                    {/* Product Master Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        {p.featuredImage ? (
                          <img
                            src={p.featuredImage}
                            alt={p.nameAr}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/40">
                            👕
                          </div>
                        )}
                        <div>
                          <h4 className="font-black text-sm text-white">{p.nameAr}</h4>
                          <div className="flex items-center gap-3 text-xs text-white/50 mt-0.5">
                            <span>السعر: <strong className="text-amber-400 font-mono">{p.basePrice} ج.م</strong></span>
                            <span>عدد المقاسات والألوان: <strong className="text-white font-mono">{p.variants?.length || 0}</strong></span>
                            <span>الرصيد المتاح: <strong className="text-[#00ff66] font-mono">{totalModelStock} قطعة</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Batch Print All Sizes of This Model */}
                      <button
                        onClick={() => handleBatchPrintProduct(p, selectedBarcodeBranch)}
                        className="bg-[#00ff66]/10 hover:bg-[#00ff66]/20 border border-[#00ff66]/40 text-[#00ff66] px-3.5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <Printer size={15} />
                        <span>⚡ طباعة كل مقاسات هذا الموديل ({p.variants?.length} تكت دفعة واحدة)</span>
                      </button>
                    </div>

                    {/* Variants Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {p.variants?.map((v: any) => {
                        const targetQty =
                          selectedBarcodeBranch === "central"
                            ? v.stockCentral || 0
                            : selectedBarcodeBranch && selectedBarcodeBranch !== "all"
                            ? v.branchStocks?.find((b: any) => b.branchId === selectedBarcodeBranch)?.quantity || 0
                            : (v.stockCentral || 0) +
                              (v.branchStocks?.reduce((acc: number, b: any) => acc + (b.quantity || 0), 0) || 0);

                        const currentBName =
                          selectedBarcodeBranch !== "all"
                            ? branches.find((b) => b.id === selectedBarcodeBranch)?.name
                            : undefined;

                        return (
                          <div
                            key={v.id}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs hover:bg-white/10 transition-all"
                          >
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-white">
                                <span className="text-white/60">لون:</span>
                                <span>{v.color}</span>
                                <span className="bg-black/60 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                  {v.size}
                                </span>
                              </div>
                              <div className="font-mono text-[10px] text-white/50 mt-1">
                                {v.barcode}
                              </div>
                              <div className="text-[10px] text-[#00ff66] font-mono mt-0.5">
                                الرصيد: {targetQty} قطعة
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                setSelectedTagItem({
                                  productName: p.nameAr,
                                  size: v.size,
                                  color: v.color,
                                  barcode: v.barcode,
                                  price: v.priceOverride || p.basePrice,
                                  branchName: currentBName,
                                  quantity: Math.max(1, targetQty),
                                })
                              }
                              className="bg-white/10 hover:bg-amber-500 hover:text-black text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                              title="طباعة استيكر هذا المقاس فقط"
                            >
                              <Printer size={12} />
                              <span>تيكت</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: GEMINI VISION AI */}
        {activeTab === "ai" && (
          <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <span className="p-2.5 bg-[#00ff66]/10 text-[#00ff66] rounded-xl text-xl">🤖</span>
              <div>
                <h3 className="font-bold text-base text-white">
                  مساعد الذكاء الاصطناعي Gemini Vision لفحص الفواتير وكشوف الجرد
                </h3>
                <p className="text-xs text-white/50">
                  التقط أو ارفع صورة فاتورة المصنع أو كشف الجرد الورقي لاستخراج الأصناف والمقاسات والتكلفة وسعر البيع آلياً
                </p>
              </div>
            </div>

            <div className="p-8 border-2 border-dashed border-[#00ff66]/30 rounded-3xl text-center space-y-3 bg-white/5">
              <Upload size={36} className="mx-auto text-[#00ff66] opacity-70" />
              <div className="text-sm font-bold text-white">اسحب صورة الفاتورة أو اضغط للاختيار</div>
              <p className="text-xs text-white/50">يدعم صور JPG, PNG لفواتير الموردين أو كشوف الجرد المكتوبة بخط اليد</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAiImageFile(e.target.files?.[0] || null)}
                className="block mx-auto text-xs text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#00ff66] file:text-black hover:file:bg-emerald-400 cursor-pointer"
              />
              {aiImageFile && (
                <div className="pt-2">
                  <button
                    onClick={handleAiIngest}
                    disabled={aiLoading}
                    className="bg-gradient-to-r from-[#00ff66] to-emerald-500 hover:brightness-110 text-black font-black py-3 px-6 rounded-2xl text-xs shadow-lg shadow-[#00ff66]/20 active:scale-95 transition-all inline-flex items-center gap-2"
                  >
                    {aiLoading ? "جاري الفحص بالذكاء الاصطناعي..." : "فحص الفاتورة واستخراج الأصناف 🚀"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: TRANSFERS */}
        {activeTab === "transfers" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#12121a] p-4 rounded-3xl border border-white/10">
              <div>
                <h3 className="font-bold text-sm text-white">أذون تحويل البضاعة بين المخزن المركزي والفروع</h3>
                <p className="text-xs text-white/50">سجل حركة ونقل قطع الملابس مع التحديث الآلي للأرصدة</p>
              </div>
              <button
                onClick={() => setShowTransferModal(true)}
                className="bg-[#00ff66] hover:bg-emerald-400 text-black px-4 py-2 rounded-xl text-xs font-black shadow-md shadow-[#00ff66]/20 flex items-center gap-1.5 transition-all"
              >
                <Plus size={16} />
                <span>إذن تحويل جديد</span>
              </button>
            </div>

            <div className="bg-[#12121a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
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
                        <td className="p-3 font-mono font-bold text-[#ffb703]">{tr.transferNumber}</td>
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
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00ff66] font-bold text-[10px]">
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
          <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white pb-3 border-b border-white/10 flex items-center gap-2">
              <DollarSign size={18} className="text-[#00ff66]" />
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
                    <th className="py-2">الفيزا وإنستاباي</th>
                    <th className="py-2">الكاش المتوقع</th>
                    <th className="py-2">الكاش الفعلي</th>
                    <th className="py-2">الفارق</th>
                    <th className="py-2">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {shifts.map((s) => (
                    <tr key={s.id} className="py-2.5 hover:bg-white/5">
                      <td className="py-2.5 font-mono text-[#ffb703] font-bold">{s.shiftNumber}</td>
                      <td className="py-2.5 font-bold text-white">{s.user?.name}</td>
                      <td className="py-2.5">{s.branch?.name}</td>
                      <td className="py-2.5 font-mono">{s.startCash} ج</td>
                      <td className="py-2.5 font-mono text-green-400">{s.cashSales} ج</td>
                      <td className="py-2.5 font-mono text-blue-400">{s.visaSales + s.instapaySales} ج</td>
                      <td className="py-2.5 font-mono font-bold">{s.expectedCash} ج</td>
                      <td className="py-2.5 font-mono font-bold text-[#ffb703]">{s.actualCash} ج</td>
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
                              ? "bg-emerald-500/20 text-[#00ff66]"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {s.status === "OPEN" ? "مفتوحة" : "مقفلة"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: CUSTOMERS CRM & LEDGER */}
        {activeTab === "customers" && (
          <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center text-[#00ff66]">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>قاعدة عملاء بزار والمديونيات ونقاط الولاء (CRM)</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-white/10 text-[#ffb703] border border-[#ffb703]/30">
                      {customers.length} عملاء
                    </span>
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    متابعة كشوف حسابات العملاء، تحصيل وتسوية المديونيات، ونقاط المكافآت
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    <th className="py-3 px-3">اسم العميل</th>
                    <th className="py-3 px-3">رقم الهاتف</th>
                    <th className="py-3 px-3">المديونية / الرصيد الحسابي</th>
                    <th className="py-3 px-3">رصيد نقاط الولاء</th>
                    <th className="py-3 px-3">إجمالي المشتريات</th>
                    <th className="py-3 px-3 text-left">إجراءات الحساب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customers.map((c) => {
                    const debt = c.totalDebt || 0;
                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-[11px]">
                              {c.name ? c.name.charAt(0) : "C"}
                            </span>
                            <span>{c.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[#ffb703]">{c.phone}</td>
                        <td className="py-3 px-3 font-mono">
                          {debt > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 border border-red-500/40 text-red-300">
                              <span>عليه {debt.toLocaleString()} ج.م</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                              <span>خالص الرصيد ✓</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#00ff66]">{c.points || 0} نقطة 🌟</td>
                        <td className="py-3 px-3 font-mono font-bold text-white">{(c.totalPurchases || 0).toLocaleString()} ج.م</td>
                        <td className="py-3 px-3 text-left">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setCustomerPayTarget(c);
                                setCustomerPayAmount(debt > 0 ? String(debt) : "");
                                setShowCustomerPayModal(true);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all"
                            >
                              <DollarSign size={12} />
                              <span>سداد / تحصيل</span>
                            </button>
                            <button
                              onClick={() => handleOpenCustomerLedger(c)}
                              className="px-2.5 py-1 rounded-xl bg-[#00ff66]/10 hover:bg-[#00ff66]/20 border border-[#00ff66]/30 text-[#00ff66] text-[11px] font-bold flex items-center gap-1 transition-all"
                            >
                              <FileSpreadsheet size={12} />
                              <span>كشف الحساب</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: RETURNS & EXCHANGES (مردودات المبيعات والاستبدال) */}
        {activeTab === "returns" && (
          <div className="space-y-6">
            {/* Header & Lookup Card */}
            <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    مردودات المبيعات واستبدال المقاسات والموديلات (Returns & Exchanges)
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    استرجاع القطع وإعادتها لمخزون الفرع فورياً مع تسوية النقدية أو كشف حساب العميل
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute right-3.5 top-3 text-white/40" />
                  <input
                    type="text"
                    placeholder="ابحث برقم الفاتورة الأصلية (مثال: BAZ-1001) أو هاتف العميل..."
                    value={returnSearchInput}
                    onChange={(e) => setReturnSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLookupInvoiceForReturn()}
                    className="w-full bg-black/50 border border-white/15 focus:border-amber-400 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white outline-none font-mono"
                  />
                </div>
                <button
                  onClick={handleLookupInvoiceForReturn}
                  className="bg-gradient-to-r from-amber-500 to-[#fb8500] hover:brightness-110 text-black px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Search size={14} />
                  <span>بحث واستدعاء الفاتورة</span>
                </button>
              </div>

              {/* Looked up Invoice Details & Return Selector */}
              {lookedUpInvoice && (
                <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-amber-500/30 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
                    <div>
                      <span className="text-white/60">رقم الفاتورة: </span>
                      <span className="font-mono font-bold text-amber-300">{lookedUpInvoice.invoiceNumber}</span>
                      <span className="text-white/40 mx-2">•</span>
                      <span className="text-white/60">الفرع: </span>
                      <span className="text-white font-bold">{lookedUpInvoice.branch?.name}</span>
                      <span className="text-white/40 mx-2">•</span>
                      <span className="text-white/60">العميل: </span>
                      <span className="text-white font-bold">{lookedUpInvoice.customerName || lookedUpInvoice.customer?.name || "عميل نقدي"}</span>
                    </div>
                    <div className="font-mono text-white/80">
                      إجمالي الفاتورة: <strong className="text-[#00ff66]">{lookedUpInvoice.finalTotal} ج.م</strong>
                    </div>
                  </div>

                  {/* Lines to return */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-white/80">حدد القطع المراد إرجاعها أو استبدالها:</div>
                    <div className="space-y-2">
                      {lookedUpInvoice.lines.map((line: any) => {
                        const isSelected = !!selectedReturnItems[line.variantId];
                        const available = line.availableToReturn ?? line.quantity;

                        return (
                          <div
                            key={line.id}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                              isSelected
                                ? "bg-amber-500/10 border-amber-500/40"
                                : "bg-white/[0.02] border-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                disabled={available <= 0}
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedReturnItems({
                                      ...selectedReturnItems,
                                      [line.variantId]: { quantity: 1, unitPrice: line.unitPrice },
                                    });
                                  } else {
                                    const next = { ...selectedReturnItems };
                                    delete next[line.variantId];
                                    setSelectedReturnItems(next);
                                  }
                                }}
                                className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                              />
                              <div>
                                <div className="font-bold text-white text-xs">{line.productName}</div>
                                <div className="text-[11px] text-white/50 flex items-center gap-2 mt-0.5">
                                  <span>اللون: <strong className="text-white/80">{line.color}</strong></span>
                                  <span>المقاس: <strong className="text-white/80">{line.size}</strong></span>
                                  <span>السعر: <strong className="text-[#00ff66]">{line.unitPrice} ج.م</strong></span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-[11px] text-white/50">
                                المتاح للاسترجاع: <strong className="text-amber-300 font-mono">{available}</strong> قطعة
                              </div>

                              {isSelected && (
                                <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-xl border border-white/15">
                                  <label className="text-[10px] text-white/60">الكمية:</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max={available}
                                    value={selectedReturnItems[line.variantId]?.quantity || 1}
                                    onChange={(e) => {
                                      const val = Math.min(available, Math.max(1, parseInt(e.target.value, 10) || 1));
                                      setSelectedReturnItems({
                                        ...selectedReturnItems,
                                        [line.variantId]: {
                                          ...selectedReturnItems[line.variantId],
                                          quantity: val,
                                        },
                                      });
                                    }}
                                    className="w-12 bg-transparent text-center font-mono font-bold text-amber-300 focus:outline-none text-xs"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Return Options & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
                    <div>
                      <label className="block mb-1 text-white/70 font-bold">نوع العملية:</label>
                      <select
                        value={returnType}
                        onChange={(e) => setReturnType(e.target.value as any)}
                        className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                      >
                        <option value="RETURN">إرجاع واسترداد (Return)</option>
                        <option value="EXCHANGE">استبدال مقاس / موديل (Exchange)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-white/70 font-bold">طريقة التسوية المالية:</label>
                      <select
                        value={returnSettlementType}
                        onChange={(e) => setReturnSettlementType(e.target.value as any)}
                        className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                      >
                        <option value="CASH_REFUND">استرداد نقدي فوري من الخزينة (Cash)</option>
                        <option value="DEBT_CREDIT">تسوية كرصيد في حساب العميل (Credit)</option>
                        <option value="EXCHANGE">استبدال بقطعة بديلة (Exchange)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-white/70 font-bold">سبب الاسترجاع:</label>
                      <input
                        type="text"
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="text-xs">
                      إجمالي قيمة المرتجع:{" "}
                      <strong className="text-base text-amber-400 font-mono font-black">
                        {Object.values(selectedReturnItems).reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)}{" "}
                        ج.م
                      </strong>
                    </div>

                    <button
                      onClick={handleExecuteReturn}
                      disabled={submittingReturn}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      <span>{submittingReturn ? "جاري التنفيذ..." : "تأكيد وتنفيذ المرتجع فوراً"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Past Returns Table */}
            <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-sm text-white pb-3 border-b border-white/10 flex items-center gap-2">
                <Receipt size={16} className="text-amber-400" />
                <span>سجل أذون المردودات والاستبدال السابقة ({returnsList.length} أذون)</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50">
                      <th className="py-2.5 px-3">رقم إذن المرتجع</th>
                      <th className="py-2.5 px-3">الفاتورة الأصلية</th>
                      <th className="py-2.5 px-3">الفرع</th>
                      <th className="py-2.5 px-3">العميل</th>
                      <th className="py-2.5 px-3">النوع</th>
                      <th className="py-2.5 px-3">مبلغ الاسترداد</th>
                      <th className="py-2.5 px-3">السبب</th>
                      <th className="py-2.5 px-3">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {returnsList.map((ret) => (
                      <tr key={ret.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-300">{ret.returnNumber}</td>
                        <td className="py-2.5 px-3 font-mono text-white/70">{ret.originalInvoice?.invoiceNumber || "—"}</td>
                        <td className="py-2.5 px-3 text-white/90">{ret.branch?.name}</td>
                        <td className="py-2.5 px-3 text-white">{ret.customer?.name || "عميل نقدي"}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ret.type === "EXCHANGE"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {ret.type === "EXCHANGE" ? "استبدال" : "مرتجع"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#00ff66]">
                          {ret.refundAmount?.toLocaleString()} ج.م
                        </td>
                        <td className="py-2.5 px-3 text-white/60">{ret.reason || "—"}</td>
                        <td className="py-2.5 px-3 text-white/40 text-[10px]">
                          {new Date(ret.createdAt).toLocaleDateString("ar-EG")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PURCHASES & SUPPLIERS (المشتريات والموردين) */}
        {activeTab === "purchases" && (
          <div className="space-y-6">
            {/* Top Switcher: Suppliers vs Purchase Invoices */}
            <div className="flex items-center justify-between gap-4 p-4 bg-[#12121a] border border-white/10 rounded-3xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSuppliersSubTab("suppliers")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    suppliersSubTab === "suppliers"
                      ? "bg-[#ffb703] text-black border-[#ffb703] shadow-md shadow-[#ffb703]/20 font-black"
                      : "bg-white/5 text-white/70 border-white/5 hover:border-white/20"
                  }`}
                >
                  🏭 سجل الموردين والمصانع ({suppliers.length})
                </button>
                <button
                  onClick={() => setSuppliersSubTab("purchases")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    suppliersSubTab === "purchases"
                      ? "bg-[#00ff66] text-black border-[#00ff66] shadow-md shadow-[#00ff66]/20 font-black"
                      : "bg-white/5 text-white/70 border-white/5 hover:border-white/20"
                  }`}
                >
                  📦 فواتير المشتريات والتوريد ({purchases.length})
                </button>
              </div>

              {suppliersSubTab === "suppliers" ? (
                <button
                  onClick={() => {
                    setSupplierFormData({ id: "", name: "", contactName: "", phone: "", address: "", openingBalance: 0, notes: "" });
                    setShowAddSupplierModal(true);
                  }}
                  className="bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:brightness-110 text-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Plus size={14} />
                  <span>إضافة مورد / مصنع جديد</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setPurchaseFormSupplierId(suppliers[0]?.id || "");
                    setPurchaseFormBranchId("CENTRAL_WAREHOUSE");
                    setPurchaseFormType("PURCHASE");
                    setPurchaseFormLines([{ variantId: products[0]?.variants[0]?.id || "", quantity: 20, costPrice: 200 }]);
                    setPurchaseFormPaidAmount(0);
                    setPurchaseFormNotes("");
                    setShowAddPurchaseModal(true);
                  }}
                  className="bg-gradient-to-r from-[#00ff66] to-emerald-400 hover:brightness-110 text-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Plus size={14} />
                  <span>فاتورة مشتريات وتوريد بضاعة جديدة</span>
                </button>
              )}
            </div>

            {/* Sub-view: Suppliers List */}
            {suppliersSubTab === "suppliers" ? (
              <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50">
                        <th className="py-3 px-3">اسم المورد / المصنع</th>
                        <th className="py-3 px-3">مسؤول الاتصال</th>
                        <th className="py-3 px-3">الهاتف</th>
                        <th className="py-3 px-3">العنوان</th>
                        <th className="py-3 px-3">المستحقات الحالية (المديونية)</th>
                        <th className="py-3 px-3">الفواتير</th>
                        <th className="py-3 px-3 text-left">إجراءات الحساب</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {suppliers.map((s) => {
                        const debt = s.totalDebt || 0;
                        return (
                          <tr key={s.id} className="hover:bg-white/[0.02]">
                            <td className="py-3 px-3 font-bold text-white">
                              <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-[11px]">
                                  🏭
                                </span>
                                <span>{s.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-white/80">{s.contactName || "—"}</td>
                            <td className="py-3 px-3 font-mono text-[#ffb703]">{s.phone || "—"}</td>
                            <td className="py-3 px-3 text-white/60">{s.address || "—"}</td>
                            <td className="py-3 px-3 font-mono">
                              {debt > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300">
                                  <span>له {debt.toLocaleString()} ج.م</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                                  <span>خالص المستحقات ✓</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono text-white/70">{s._count?.purchaseInvoices || 0}</td>
                            <td className="py-3 px-3 text-left">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setSupplierPaySupplier(s);
                                    setSupplierPayAmount(debt > 0 ? String(debt) : "");
                                    setShowSupplierPayModal(true);
                                  }}
                                  className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1 transition-all"
                                >
                                  <DollarSign size={12} />
                                  <span>سداد دفعة</span>
                                </button>
                                <button
                                  onClick={() => handleOpenSupplierLedger(s)}
                                  className="px-2.5 py-1 rounded-xl bg-[#ffb703]/10 hover:bg-[#ffb703]/20 border border-[#ffb703]/30 text-[#ffb703] text-[11px] font-bold flex items-center gap-1 transition-all"
                                >
                                  <FileSpreadsheet size={12} />
                                  <span>كشف الحساب</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Sub-view: Purchase Invoices List */
              <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50">
                        <th className="py-3 px-3">رقم الفاتورة</th>
                        <th className="py-3 px-3">المورد / المصنع</th>
                        <th className="py-3 px-3">المستودع / الفرع المستلم</th>
                        <th className="py-3 px-3">النوع</th>
                        <th className="py-3 px-3">إجمالي الفاتورة</th>
                        <th className="py-3 px-3">المدفوع نقداً</th>
                        <th className="py-3 px-3">المتبقي (آجل)</th>
                        <th className="py-3 px-3">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {purchases.map((p) => (
                        <tr key={p.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-3 font-mono font-bold text-amber-300">{p.invoiceNumber}</td>
                          <td className="py-3 px-3 font-bold text-white">{p.supplier?.name}</td>
                          <td className="py-3 px-3 text-white/80">
                            {p.branch?.name ? p.branch.name : "المخزن المركزي الرئيسي المشترك"}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                p.type === "RETURN"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              {p.type === "RETURN" ? "مردودات للمورد ↩️" : "توريد بضاعة 📦"}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-white">{p.totalAmount?.toLocaleString()} ج.م</td>
                          <td className="py-3 px-3 font-mono text-[#00ff66]">{p.paidAmount?.toLocaleString()} ج.م</td>
                          <td className="py-3 px-3 font-mono text-amber-400 font-bold">{p.remainingDebt?.toLocaleString()} ج.م</td>
                          <td className="py-3 px-3 text-white/40 text-[10px]">
                            {new Date(p.createdAt).toLocaleDateString("ar-EG")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: SEASONS & CHOCO LANDING OFFERS (المواسم وعروض الشارع) */}
        {activeTab === "seasons" && (
          <div className="space-y-6">
            {/* Seasons Management Section */}
            <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">إدارة المواسم السنوية (Seasons Engine)</h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      تحديد فترات المواسم (صيف، شتاء، أعياد، جمعة بيضاء) لربط كولكشن الملابس وعروض التخفيضات
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSeasonFormData({ id: "", name: "", startDate: "", endDate: "", notes: "" });
                    setShowAddSeasonModal(true);
                  }}
                  className="bg-gradient-to-r from-amber-500 to-[#fb8500] hover:brightness-110 text-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>إضافة موسم جديد</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {seasons.map((s) => (
                  <div key={s.id} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-white text-sm">{s.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00ff66]/15 border border-[#00ff66]/30 text-[#00ff66]">
                        {s.isActive ? "نشط حالياً" : "غير نشط"}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/50">
                      {s.startDate ? new Date(s.startDate).toLocaleDateString("ar-EG") : "البداية مفتوحة"} —{" "}
                      {s.endDate ? new Date(s.endDate).toLocaleDateString("ar-EG") : "مستمر"}
                    </div>
                    {s.notes && <p className="text-[11px] text-white/60">{s.notes}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Choco House Style Landing Page Offers Customizer */}
            <div className="bg-gradient-to-b from-[#141208] to-[#101018] border border-[#ffb703]/30 rounded-3xl p-6 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#ffb703]/10 border border-[#ffb703]/30 flex items-center justify-center text-[#ffb703] text-xl">
                    🔥
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <span>طريقة عرض العروض الملكية في اللاندينج بيدج (تصميم شوكو هاوس)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ديناميكي بالكامل
                      </span>
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      التحكم في كروت العروض الثلاثية الفخمة وبانر العرض الكبير المعروض في واجهة المتجر
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-3 py-1.5 rounded-xl border border-white/15">
                    <input
                      type="checkbox"
                      checked={offersSectionEnabled}
                      onChange={(e) => setOffersSectionEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white">إظهار قسم العروض في المتجر</span>
                  </label>
                  <button
                    onClick={handleSaveLandingOffers}
                    disabled={savingOffers}
                    className="bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:brightness-110 text-black px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-[#ffb703]/20 active:scale-95 transition-all"
                  >
                    {savingOffers ? "جاري الحفظ..." : "حفظ التعديلات فورياً ✓"}
                  </button>
                </div>
              </div>

              {/* Header texts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block mb-1 text-white/70 font-bold">شارة العروض (Badge):</label>
                  <input
                    type="text"
                    value={offersBadgeInput}
                    onChange={(e) => setOffersBadgeInput(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-amber-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-white/70 font-bold">عنوان القسم الرئيسي (Title):</label>
                  <input
                    type="text"
                    value={offersTitleInput}
                    onChange={(e) => setOffersTitleInput(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-white/70 font-bold">الوصف الفرعي (Subtitle):</label>
                  <input
                    type="text"
                    value={offersSubtitleInput}
                    onChange={(e) => setOffersSubtitleInput(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white/80"
                  />
                </div>
              </div>

              {/* 3 Luxury Cards Editor */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>كروت العروض الفخمة (Cards Layout):</span>
                    <span className="text-amber-400 font-mono">({offersCardsList.length} كروت)</span>
                  </h4>
                  <button
                    onClick={() => {
                      setOffersCardsList([
                        ...offersCardsList,
                        {
                          id: `offer-${Date.now()}`,
                          title: "عرض جديد",
                          desc: "تفاصيل العرض والخصم الخاص هنا...",
                          badge: "عرض حصري",
                          icon: "gift",
                        },
                      ]);
                    }}
                    className="text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>+ إضافة كارت عرض</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {offersCardsList.map((card, idx) => (
                    <div key={card.id || idx} className="p-3.5 rounded-2xl bg-black/60 border border-[#ffb703]/20 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => {
                            const next = [...offersCardsList];
                            next[idx].title = e.target.value;
                            setOffersCardsList(next);
                          }}
                          placeholder="عنوان العرض..."
                          className="font-bold text-amber-400 bg-transparent border-b border-white/10 pb-0.5 outline-none flex-1"
                        />
                        {offersCardsList.length > 1 && (
                          <button
                            onClick={() => setOffersCardsList(offersCardsList.filter((_, i) => i !== idx))}
                            className="p-1 text-red-400 hover:text-red-300 mr-2"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <textarea
                        rows={2}
                        value={card.desc}
                        onChange={(e) => {
                          const next = [...offersCardsList];
                          next[idx].desc = e.target.value;
                          setOffersCardsList(next);
                        }}
                        placeholder="تفاصيل العرض..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white/80 text-[11px] outline-none resize-none"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-white/50 block">الشارة (Badge):</label>
                          <input
                            type="text"
                            value={card.badge || ""}
                            onChange={(e) => {
                              const next = [...offersCardsList];
                              next[idx].badge = e.target.value;
                              setOffersCardsList(next);
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[#00ff66] text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/50 block">الأيقونة (Icon):</label>
                          <select
                            value={card.icon || "flame"}
                            onChange={(e) => {
                              const next = [...offersCardsList];
                              next[idx].icon = e.target.value;
                              setOffersCardsList(next);
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white text-[11px]"
                          >
                            <option value="flame">🔥 شعلة / حريق أسعار</option>
                            <option value="delivery">🚚 شحن وتوصيل</option>
                            <option value="shield">🛡️ ضمان واستبدال</option>
                            <option value="gift">🎁 هدية / باقة</option>
                            <option value="sparkles">✨ بريميوم ملكي</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Big Featured Banner Customizer */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white">بانر العرض الكبير المميز (Featured Banner):</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block mb-1 text-white/70 font-bold">رابط صورة خلفية البانر أو رفعها:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={offersBannerImageInput}
                        onChange={(e) => setOffersBannerImageInput(e.target.value)}
                        className="flex-1 bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono text-xs"
                      />
                      <label className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 font-mono">
                        <Upload size={14} />
                        <span>رفع</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, (url) => setOffersBannerImageInput(url));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-white/70 font-bold">عنوان البانر الرئيسي:</label>
                    <input
                      type="text"
                      value={offersBannerTitleInput}
                      onChange={(e) => setOffersBannerTitleInput(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-black"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-white/70 font-bold">شارة البانر الصغيرة:</label>
                    <input
                      type="text"
                      value={offersBannerBadgeInput}
                      onChange={(e) => setOffersBannerBadgeInput(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-white/70 font-bold">نص زر التصفح:</label>
                    <input
                      type="text"
                      value={offersBannerLinkTextInput}
                      onChange={(e) => setOffersBannerLinkTextInput(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-[#00ff66]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: USERS & MASTER LOCKOUT */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-950/30 via-[#141014] to-red-950/30 border border-red-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
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
                      <span className="text-[#00ff66] flex items-center gap-1.5">
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

            {/* Complete Staff and Permissions Table */}
            <div className="bg-[#12121a]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center text-[#00ff66]">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>طاقم العمل والصلاحيات وحسابات الفروع</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/10 text-amber-400 border border-amber-500/30">
                        {usersList.length} مستخدمين
                      </span>
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      التحكم الكامل ببيانات الدخول، وتعديل كلمات المرور، والرمز السري PIN، وتعيين الفروع
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenAddUser}
                  className="bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:brightness-110 text-black px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-[#ffb703]/20 active:scale-95 transition-all self-start sm:self-auto"
                >
                  <Plus size={16} />
                  <span>إضافة حساب موظف جديد</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50">
                      <th className="py-3 px-3">الموظف</th>
                      <th className="py-3 px-3">اسم الدخول (Username)</th>
                      <th className="py-3 px-3">الدور / الصلاحية</th>
                      <th className="py-3 px-3">الفرع التابع</th>
                      <th className="py-3 px-3">الهاتف</th>
                      <th className="py-3 px-3">الرمز السري (PIN)</th>
                      <th className="py-3 px-3 text-center">الحالة</th>
                      <th className="py-3 px-3 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {usersList.map((u) => {
                      const roleConfig: Record<string, { label: string; color: string; badgeBg: string }> = {
                        owner: {
                          label: "المالك (Maestro)",
                          color: "text-amber-400",
                          badgeBg: "bg-amber-500/10 border-amber-500/30",
                        },
                        general_manager: {
                          label: "المدير العام",
                          color: "text-purple-400",
                          badgeBg: "bg-purple-500/10 border-purple-500/30",
                        },
                        branch_manager: {
                          label: "مدير فرع",
                          color: "text-blue-400",
                          badgeBg: "bg-blue-500/10 border-blue-500/30",
                        },
                        cashier: {
                          label: "كاشير مبيعات",
                          color: "text-[#00ff66]",
                          badgeBg: "bg-emerald-500/10 border-emerald-500/30",
                        },
                        storekeeper: {
                          label: "أمين مخزن مركزي",
                          color: "text-orange-400",
                          badgeBg: "bg-orange-500/10 border-orange-500/30",
                        },
                      };
                      const rConf = roleConfig[u.role] || {
                        label: u.role,
                        color: "text-gray-300",
                        badgeBg: "bg-white/5 border-white/10",
                      };

                      return (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-[11px]">
                                {u.name ? u.name.charAt(0) : "U"}
                              </span>
                              <div>
                                <div className="font-bold text-white">{u.name}</div>
                                {u.role === "owner" && (
                                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                    👑 مالك النظام
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-white/80">{u.username}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${rConf.badgeBg} ${rConf.color}`}
                            >
                              {rConf.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-white/80">
                            {u.branch?.name ? (
                              <span className="flex items-center gap-1 text-white/90">
                                <span>🏬</span>
                                <span>{u.branch.name}</span>
                              </span>
                            ) : (
                              <span className="text-white/40">🏛️ الإدارة المركزية (جميع الفروع)</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-white/70">{u.phone || "—"}</td>
                          <td className="py-3 px-3">
                            <span className="font-mono bg-black/60 border border-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-bold tracking-widest text-[11px]">
                              {u.pin || "••••"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {u.role === "owner" ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                                نشط دائماً 🔒
                              </span>
                            ) : (
                              <button
                                onClick={() => handleToggleUserActive(u)}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                                  u.isActive
                                    ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                                }`}
                              >
                                {u.isActive ? "🟢 نشط" : "🔴 معطل"}
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-3 text-left">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
                                title="تعديل الحساب وكلمة المرور"
                              >
                                <Edit size={14} />
                              </button>
                              {u.role !== "owner" && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                  title="حذف الحساب"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Product Modal with ImgBB Upload */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#101018] border border-[#00ff66]/40 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-white my-8">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <h3 className="font-bold text-base text-[#00ff66]">تعديل بيانات وصورة الموديل</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-white/70 font-bold">اسم الموديل:</label>
                <input
                  type="text"
                  value={editingProduct.nameAr}
                  onChange={(e) => setEditingProduct({ ...editingProduct, nameAr: e.target.value })}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                />
              </div>

              {/* ImgBB Image Upload */}
              <div>
                <label className="block mb-1 text-white/70 font-bold">رابط أو رفع صورة جديدة (ImgBB):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingProduct.featuredImage || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, featuredImage: e.target.value })
                    }
                    placeholder="https://i.ibb.co/..."
                    className="flex-1 bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono text-xs"
                  />
                  <label className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1">
                    <Upload size={14} />
                    <span>{uploadingImage ? "جاري الرفع..." : "رفع صورة"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, (url) => {
                            setEditingProduct({ ...editingProduct, featuredImage: url });
                          });
                        }
                      }}
                    />
                  </label>
                </div>
                {editingProduct.featuredImage && (
                  <img
                    src={editingProduct.featuredImage}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover mt-2 border border-white/10"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-white/70 font-bold">سعر البيع (ج.م):</label>
                  <input
                    type="number"
                    value={editingProduct.basePrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        basePrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-[#ffb703] font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-white/70 font-bold">سعر التكلفة (ج.م):</label>
                  <input
                    type="number"
                    value={editingProduct.costPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        costPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-white/70 font-bold">الخامة:</label>
                <input
                  type="text"
                  value={editingProduct.material || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                />
              </div>

              {/* Color Variants Image Manager inside Product Edit */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <label className="block text-white/80 font-bold text-xs">
                  ألوان وصور هذا الموديل (اضغط على أي لون لرفع أو تغيير صورته بالتحديد):
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editingProduct.variants?.map((v: any) => (
                    <div
                      key={v.id}
                      className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={v.image || editingProduct.featuredImage}
                          alt={v.color}
                          className="w-9 h-9 rounded-lg object-cover border border-white/10"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/40"
                              style={{ backgroundColor: v.colorHex || "#444" }}
                            />
                            <span>{v.color}</span>
                            <span className="text-[10px] text-white/50 font-mono">({v.size})</span>
                          </div>
                          <div className="text-[10px] text-white/40 font-mono">{v.barcode}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setVariantImgModalData({
                            product: editingProduct,
                            variant: v,
                            imageUrl: v.image || editingProduct.featuredImage || "",
                          });
                        }}
                        className="bg-[#00ff66]/10 hover:bg-[#00ff66]/20 border border-[#00ff66]/40 text-[#00ff66] px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1"
                      >
                        <Upload size={12} />
                        <span>تغيير صورة هذا اللون</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new color to existing product button */}
                <button
                  type="button"
                  onClick={() => setShowAddVariantModal(true)}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#00ff66]/10 to-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all shadow-md"
                >
                  <Plus size={14} />
                  <span>+ إضافة لون / استايل ومقاس جديد لهذا الموديل</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveProductEdit}
                className="flex-1 bg-[#00ff66] hover:bg-emerald-400 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-[#00ff66]/20 active:scale-95 transition-all"
              >
                حفظ التعديلات في قاعدة البيانات
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="bg-white/10 text-white font-bold py-3 px-4 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Variant Color & Image Modal (رفع صورة مخصصة لأي لون) */}
      {variantImgModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#101018] border border-[#00ff66]/40 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white relative">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#00ff66]/10 text-[#00ff66] rounded-xl">📷</span>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    تغيير صورة لون ({variantImgModalData.variant.color})
                  </h3>
                  <p className="text-[10px] text-white/50">{variantImgModalData.product.nameAr}</p>
                </div>
              </div>
              <button
                onClick={() => setVariantImgModalData(null)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Preview */}
              <div className="w-full aspect-video rounded-2xl bg-black/60 overflow-hidden border border-white/10 relative">
                {variantImgModalData.imageUrl ? (
                  <img
                    src={variantImgModalData.imageUrl}
                    alt="Variant Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    👕
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/80 px-2.5 py-0.5 rounded-full text-[10px] text-[#00ff66] border border-[#00ff66]/30">
                  اللون: {variantImgModalData.variant.color}
                </div>
              </div>

              {/* Upload or URL */}
              <div>
                <label className="block mb-1 text-white/70 font-bold">
                  رفع صورة جديدة مطابقة لهذا اللون (ImgBB):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={variantImgModalData.imageUrl}
                    onChange={(e) =>
                      setVariantImgModalData({ ...variantImgModalData, imageUrl: e.target.value })
                    }
                    placeholder="https://i.ibb.co/..."
                    className="flex-1 bg-black/50 border border-white/15 focus:border-[#00ff66] rounded-xl p-2.5 text-white font-mono text-xs outline-none"
                  />
                  <label className="bg-[#00ff66] hover:bg-emerald-400 text-black px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1">
                    <Upload size={14} />
                    <span>{uploadingImage ? "جاري الرفع..." : "اختر صورة"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, (url) => {
                            setVariantImgModalData({ ...variantImgModalData, imageUrl: url });
                          });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveVariantImage}
                  className="flex-1 bg-gradient-to-r from-[#00ff66] to-emerald-500 hover:brightness-110 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-[#00ff66]/20 active:scale-95 transition-all"
                >
                  حفظ صورة هذا اللون فورياً في السيستم ⚡
                </button>
                <button
                  onClick={() => setVariantImgModalData(null)}
                  className="bg-white/10 text-white font-bold py-3 px-4 rounded-xl text-xs"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal with ImgBB Upload */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#101018] border border-[#00ff66]/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-white my-8">
            <h3 className="font-bold text-base mb-4 text-[#00ff66]">إضافة موديل كاجوال جديد + رفع صورة</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-white/70 font-bold">اسم الموديل:</label>
                <input
                  type="text"
                  placeholder="مثال: تيشرت أوفر سايز بريميوم"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                />
              </div>

              {/* ImgBB Image Upload */}
              <div>
                <label className="block mb-1 text-white/70 font-bold">رفع صورة للموديل (ImgBB):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="رابط الصورة المباشر أو ارفع من جهازك..."
                    className="flex-1 bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono text-xs"
                  />
                  <label className="bg-[#00ff66] hover:bg-emerald-400 text-black px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 font-mono">
                    <Upload size={14} />
                    <span>{uploadingImage ? "جاري الرفع..." : "اختر صورة"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, (url) => setNewProdImage(url));
                        }
                      }}
                    />
                  </label>
                </div>
                {newProdImage && (
                  <img
                    src={newProdImage}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover mt-2 border border-white/10"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-white/70 font-bold">القسم:</label>
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
                  <label className="block mb-1 text-white/70 font-bold">الخامة:</label>
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
                  <label className="block mb-1 text-white/70 font-bold">سعر البيع (ج.م):</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-[#ffb703] font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-white/70 font-bold">سعر التكلفة (ج.م):</label>
                  <input
                    type="number"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Product Color Variants Builder */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-white/90 font-bold text-xs flex items-center gap-1.5">
                    <span>🎨 ألوان ومقاسات ومخزون هذا الموديل:</span>
                    <span className="text-[11px] text-[#00ff66] font-mono">({newProdVariants.length} ألوان/مقاسات)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewProdVariants([
                        ...newProdVariants,
                        {
                          size: "L",
                          color: "رمادي ميلتون",
                          colorHex: "#6c757d",
                          barcode: "",
                          image: newProdImage || "",
                          central: 20,
                          b1: 10,
                          b2: 10,
                        },
                      ]);
                    }}
                    className="text-[11px] bg-[#00ff66]/10 hover:bg-[#00ff66]/20 border border-[#00ff66]/40 text-[#00ff66] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>+ إضافة لون آخر</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {newProdVariants.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="color"
                            value={v.colorHex || "#111111"}
                            onChange={(e) => {
                              const updated = [...newProdVariants];
                              updated[idx].colorHex = e.target.value;
                              setNewProdVariants(updated);
                            }}
                            className="w-7 h-7 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0"
                            title="اختر درجة اللون"
                          />
                          <input
                            type="text"
                            placeholder="اسم اللون (مثلاً: كحلي، زيتي)"
                            value={v.color}
                            onChange={(e) => {
                              const updated = [...newProdVariants];
                              updated[idx].color = e.target.value;
                              setNewProdVariants(updated);
                            }}
                            className="flex-1 bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-white text-xs"
                          />
                          <select
                            value={v.size}
                            onChange={(e) => {
                              const updated = [...newProdVariants];
                              updated[idx].size = e.target.value;
                              setNewProdVariants(updated);
                            }}
                            className="bg-black/40 border border-white/15 rounded-lg px-2 py-1 text-white text-xs w-20"
                          >
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="2XL">2XL</option>
                            <option value="3XL">3XL</option>
                            <option value="FREE">FREE</option>
                          </select>
                        </div>

                        {newProdVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewProdVariants(newProdVariants.filter((_, i) => i !== idx));
                            }}
                            className="p-1 rounded-lg text-red-400 hover:bg-red-500/20"
                            title="حذف هذا اللون"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Variant Image & Upload */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="رابط صورة هذا اللون تحديداً أو ارفع من جهازك..."
                          value={v.image || ""}
                          onChange={(e) => {
                            const updated = [...newProdVariants];
                            updated[idx].image = e.target.value;
                            setNewProdVariants(updated);
                          }}
                          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white text-[11px] font-mono"
                        />
                        <label className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1">
                          <Upload size={12} />
                          <span>رفع</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file, (url) => {
                                  const updated = [...newProdVariants];
                                  updated[idx].image = url;
                                  setNewProdVariants(updated);
                                });
                              }
                            }}
                          />
                        </label>
                        {v.image && (
                          <img
                            src={v.image}
                            alt="preview"
                            className="w-7 h-7 rounded-md object-cover border border-white/20"
                          />
                        )}
                      </div>

                      {/* Stocks per branch */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div>
                          <label className="text-[10px] text-white/50 block">المخزن المركزي:</label>
                          <input
                            type="number"
                            value={v.central}
                            onChange={(e) => {
                              const updated = [...newProdVariants];
                              updated[idx].central = parseInt(e.target.value, 10) || 0;
                              setNewProdVariants(updated);
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-amber-300 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/50 block">فرع عباس:</label>
                          <input
                            type="number"
                            value={v.b1}
                            onChange={(e) => {
                              const updated = [...newProdVariants];
                              updated[idx].b1 = parseInt(e.target.value, 10) || 0;
                              setNewProdVariants(updated);
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-emerald-300 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/50 block">فرع التحرير:</label>
                          <input
                            type="number"
                            value={v.b2}
                            onChange={(e) => {
                              const updated = [...newProdVariants];
                              updated[idx].b2 = parseInt(e.target.value, 10) || 0;
                              setNewProdVariants(updated);
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-emerald-300 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateProduct}
                className="flex-1 bg-[#00ff66] hover:bg-emerald-400 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-[#00ff66]/20 active:scale-95 transition-all"
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
          <div className="bg-[#101018] border border-amber-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="font-bold text-base mb-4 text-[#ffb703]">إذن تحويل بضاعة فوري</h3>
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
                className="flex-1 bg-[#ffb703] hover:bg-amber-400 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-[#ffb703]/20 active:scale-95 transition-all"
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
                  value={lockPinInput}
                  onChange={(e) => setLockPinInput(e.target.value)}
                  autoComplete="new-password"
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

      {/* Add / Edit Staff User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#101018] border border-[#ffb703]/40 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white my-8">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#ffb703]/10 text-[#ffb703] rounded-xl text-lg">👤</span>
                <div>
                  <h3 className="font-bold text-base text-[#ffb703]">
                    {editingUser ? "تعديل بيانات وصلاحيات الحساب" : "إضافة موظف / حساب جديد"}
                  </h3>
                  <p className="text-[10px] text-white/50">
                    {editingUser ? `تعديل الحساب: ${editingUser.name}` : "تسجيل حساب بصلاحيات وكلمة مرور فريدة"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-white/70 font-bold">الاسم بالكامل:</label>
                <input
                  type="text"
                  placeholder="مثال: أحمد محمد (كاشير أول)"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block mb-1 text-white/70 font-bold">اسم المستخدم (Username):</label>
                <input
                  type="text"
                  disabled={!!editingUser}
                  placeholder="مثال: cashier_abbas"
                  value={userFormData.username}
                  onChange={(e) =>
                    setUserFormData({
                      ...userFormData,
                      username: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    })
                  }
                  className={`w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono ${
                    editingUser ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-white/70 font-bold">
                    كلمة المرور:
                    {editingUser && (
                      <span className="text-[10px] text-amber-400 font-normal mr-1">
                        (اختياري)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="كلمة مرور الدخول"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-white/70 font-bold">الرمز السري (PIN):</label>
                  <input
                    type="text"
                    placeholder="رمز PIN (مثال: 4455)"
                    value={userFormData.pin}
                    onChange={(e) => setUserFormData({ ...userFormData, pin: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-white/70 font-bold">الدور / الصلاحية:</label>
                  <select
                    disabled={editingUser?.role === "owner"}
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                  >
                    <option value="owner">المالك (Maestro)</option>
                    <option value="general_manager">المدير العام</option>
                    <option value="branch_manager">مدير فرع</option>
                    <option value="cashier">كاشير</option>
                    <option value="storekeeper">أمين مخزن مركزي</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-white/70 font-bold">الفرع التابع:</label>
                  <select
                    value={userFormData.branchId}
                    onChange={(e) => setUserFormData({ ...userFormData, branchId: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                  >
                    <option value="">الإدارة المركزية (جميع الفروع)</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-white/70 font-bold">رقم الهاتف:</label>
                <input
                  type="text"
                  placeholder="010xxxxxxxx"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveUser}
                className="flex-1 bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:brightness-110 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-[#ffb703]/20 active:scale-95 transition-all"
              >
                {editingUser ? "حفظ تحديثات الحساب" : "إنشاء وتفعيل الحساب الآن"}
              </button>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="bg-white/10 text-white font-bold py-3 px-4 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Variant to Existing Product Modal */}
      {showAddVariantModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#101018] border border-[#00ff66]/40 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white my-8">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#00ff66]/10 text-[#00ff66] rounded-xl text-lg">🎨</span>
                <div>
                  <h3 className="font-bold text-base text-[#00ff66]">
                    إضافة لون واستأيل جديد للموديل
                  </h3>
                  <p className="text-[10px] text-white/50">{editingProduct.nameAr}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddVariantModal(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-10">
                  <label className="block mb-1 text-white/70 font-bold">اللون:</label>
                  <input
                    type="color"
                    value={newVarColorHex}
                    onChange={(e) => setNewVarColorHex(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-white/20 bg-transparent cursor-pointer p-0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-white/70 font-bold">اسم اللون:</label>
                  <input
                    type="text"
                    placeholder="مثال: زيتي عسكري، بيج هافان"
                    value={newVarColor}
                    onChange={(e) => setNewVarColor(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="w-24">
                  <label className="block mb-1 text-white/70 font-bold">المقاس:</label>
                  <select
                    value={newVarSize}
                    onChange={(e) => setNewVarSize(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white"
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="2XL">2XL</option>
                    <option value="3XL">3XL</option>
                    <option value="FREE">FREE</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload for this color */}
              <div>
                <label className="block mb-1 text-white/70 font-bold">صورة هذا اللون (ImgBB):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVarImage}
                    onChange={(e) => setNewVarImage(e.target.value)}
                    placeholder="رابط الصورة أو ارفع من جهازك..."
                    className="flex-1 bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono text-xs"
                  />
                  <label className="bg-[#00ff66] hover:bg-emerald-400 text-black px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 font-mono">
                    <Upload size={14} />
                    <span>{uploadingImage ? "رفع..." : "رفع صورة"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, (url) => setNewVarImage(url));
                        }
                      }}
                    />
                  </label>
                </div>
                {newVarImage && (
                  <img
                    src={newVarImage}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover mt-2 border border-white/10"
                  />
                )}
              </div>

              {/* Initial Stocks */}
              <div className="pt-2 border-t border-white/10">
                <label className="block mb-2 text-white/70 font-bold">
                  الأرصدة الافتتاحية لهذا اللون:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-white/50 block">المخزن المركزي:</label>
                    <input
                      type="number"
                      value={newVarCentralStock}
                      onChange={(e) => setNewVarCentralStock(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl p-2 text-amber-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/50 block">فرع عباس:</label>
                    <input
                      type="number"
                      value={newVarB1Stock}
                      onChange={(e) => setNewVarB1Stock(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl p-2 text-emerald-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/50 block">فرع التحرير:</label>
                    <input
                      type="number"
                      value={newVarB2Stock}
                      onChange={(e) => setNewVarB2Stock(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl p-2 text-emerald-300 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddVariantToProduct}
                className="flex-1 bg-[#00ff66] hover:bg-emerald-400 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-[#00ff66]/20 active:scale-95 transition-all"
              >
                إضافة اللون للموديل وحفظ
              </button>
              <button
                onClick={() => setShowAddVariantModal(false)}
                className="bg-white/10 text-white font-bold py-3 px-4 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Ledger Modal (كشف حساب عميل) */}
      {showCustomerLedgerModal && selectedCustomerForLedger && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center text-[#00ff66]">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">كشف حساب العميل التراكمي (Statement of Account)</h3>
                  <div className="flex items-center gap-4 text-xs text-white/60 mt-1">
                    <span>العميل: <strong className="text-white">{selectedCustomerForLedger.name}</strong></span>
                    <span>الهاتف: <strong className="text-white font-mono">{selectedCustomerForLedger.phone}</strong></span>
                    <span>المديونية الحالية: <strong className={`font-mono font-bold ${(selectedCustomerForLedger.totalDebt || 0) > 0 ? "text-rose-400" : "text-emerald-400"}`}>{(selectedCustomerForLedger.totalDebt || 0).toLocaleString()} ج.م</strong></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <Printer size={15} />
                  طباعة الكشف
                </button>
                <button
                  onClick={() => setShowCustomerLedgerModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {customerLedgerTransactions.length === 0 ? (
                <div className="text-center py-12 text-white/40 space-y-2">
                  <FileText size={36} className="mx-auto opacity-30" />
                  <p>لا توجد معاملات مسجلة في كشف حساب هذا العميل حتى الآن</p>
                </div>
              ) : (
                <div className="border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-white/5 text-white/60 font-semibold border-b border-white/10">
                      <tr>
                        <th className="p-3">التاريخ والوقت</th>
                        <th className="p-3">نوع الحركة</th>
                        <th className="p-3">رقم المرجع / الفاتورة</th>
                        <th className="p-3">المبلغ</th>
                        <th className="p-3">الرصيد التراكمي</th>
                        <th className="p-3">طريقة الدفع / الملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {customerLedgerTransactions.map((tx: any, idx: number) => (
                        <tr key={tx.id || idx} className="hover:bg-white/[0.02]">
                          <td className="p-3 text-white/60">{new Date(tx.createdAt).toLocaleDateString("ar-EG")} {new Date(tx.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-sans font-bold ${
                              tx.type === "INVOICE"
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                : tx.type === "PAYMENT"
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                : "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                            }`}>
                              {tx.type === "INVOICE" ? "فاتورة مبيعات (+مديونية)" : tx.type === "PAYMENT" ? "سداد نقدية (-سداد)" : "مردودات مبيعات (-تسوية)"}
                            </span>
                          </td>
                          <td className="p-3 text-white font-bold">{tx.referenceNumber || "-"}</td>
                          <td className={`p-3 font-bold ${tx.type === "INVOICE" ? "text-rose-400" : "text-emerald-400"}`}>
                            {tx.type === "INVOICE" ? "+" : "-"}{Number(tx.amount).toLocaleString()} ج.م
                          </td>
                          <td className="p-3 text-amber-300 font-bold">
                            {(tx.runningBalance ?? 0).toLocaleString()} ج.م
                          </td>
                          <td className="p-3 text-white/70 font-sans">{tx.notes || tx.paymentMethod || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs">
              <span className="text-white/50">إجمالي الحركات: {customerLedgerTransactions.length}</span>
              <button
                onClick={() => setShowCustomerLedgerModal(false)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-5 rounded-xl transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Debt Collection Modal (تحصيل وسداد مديونية عميل) */}
      {showCustomerPayModal && customerPayTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-white/15 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">تحصيل وسداد مديونية عميل</h3>
                  <p className="text-xs text-white/50">{customerPayTarget.name} - {customerPayTarget.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomerPayModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-xs text-rose-300 font-bold">المديونية الحالية على العميل:</span>
              <span className="text-lg font-black font-mono text-rose-400">{(customerPayTarget.totalDebt || 0).toLocaleString()} ج.م</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-white/70 font-bold">مبلغ التحصيل (ج.م) *:</label>
                  <button
                    type="button"
                    onClick={() => setCustomerPayAmount(String(customerPayTarget.totalDebt || 0))}
                    className="text-[#00ff66] hover:underline text-[11px]"
                  >
                    تسوية كامل المديونية
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={customerPayAmount}
                  onChange={(e) => setCustomerPayAmount(e.target.value)}
                  placeholder="أدخل المبلغ المحصل..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-3 text-white font-mono font-bold text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-white/70 font-bold">طريقة التحصيل / الدفع:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomerPayMethod("CASH")}
                    className={`p-2.5 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                      customerPayMethod === "CASH"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    <Wallet size={14} />
                    نقدي (خزينة)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerPayMethod("VISA")}
                    className={`p-2.5 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                      customerPayMethod === "VISA"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    <CreditCard size={14} />
                    شبكة / فيزا
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-white/70 font-bold">ملاحظات التحصيل:</label>
                <input
                  type="text"
                  value={customerPayNotes}
                  onChange={(e) => setCustomerPayNotes(e.target.value)}
                  placeholder="مثال: سداد قسط، دفعة من الحساب..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleExecuteCustomerPay}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                تأكيد التحصيل والتسوية 💵
              </button>
              <button
                onClick={() => setShowCustomerPayModal(false)}
                className="bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-4 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Ledger Modal (كشف حساب مورد / مصنع) */}
      {showSupplierLedgerModal && selectedSupplierForLedger && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">كشف حساب المورد والمصنع (Supplier Statement)</h3>
                  <div className="flex items-center gap-4 text-xs text-white/60 mt-1">
                    <span>المورد: <strong className="text-white">{selectedSupplierForLedger.name}</strong></span>
                    <span>المسؤول: <strong className="text-white">{selectedSupplierForLedger.contactName || "-"}</strong></span>
                    <span>الهاتف: <strong className="text-white font-mono">{selectedSupplierForLedger.phone || "-"}</strong></span>
                    <span>مستحقات المورد: <strong className={`font-mono font-bold ${(selectedSupplierForLedger.totalDebt || 0) > 0 ? "text-amber-400" : "text-emerald-400"}`}>{(selectedSupplierForLedger.totalDebt || 0).toLocaleString()} ج.م</strong></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <Printer size={15} />
                  طباعة الكشف
                </button>
                <button
                  onClick={() => setShowSupplierLedgerModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {supplierLedgerTransactions.length === 0 ? (
                <div className="text-center py-12 text-white/40 space-y-2">
                  <FileSpreadsheet size={36} className="mx-auto opacity-30" />
                  <p>لا توجد حركات مسجلة في كشف حساب هذا المورد</p>
                </div>
              ) : (
                <div className="border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-white/5 text-white/60 font-semibold border-b border-white/10">
                      <tr>
                        <th className="p-3">التاريخ والوقت</th>
                        <th className="p-3">نوع الحركة</th>
                        <th className="p-3">رقم الفاتورة / المرجع</th>
                        <th className="p-3">المبلغ</th>
                        <th className="p-3">رصيد المورد التراكمي</th>
                        <th className="p-3">طريقة الدفع / الملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {supplierLedgerTransactions.map((tx: any, idx: number) => (
                        <tr key={tx.id || idx} className="hover:bg-white/[0.02]">
                          <td className="p-3 text-white/60">{new Date(tx.createdAt).toLocaleDateString("ar-EG")} {new Date(tx.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-sans font-bold ${
                              tx.type === "PURCHASE"
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                : tx.type === "PAYMENT"
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                : "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                            }`}>
                              {tx.type === "PURCHASE" ? "فاتورة توريد (+مستحق)" : tx.type === "PAYMENT" ? "سداد دفعة (-سداد)" : tx.type === "RETURN" ? "مردودات مشتريات (-تسوية)" : "رصيد افتتاحي"}
                            </span>
                          </td>
                          <td className="p-3 text-white font-bold">{tx.referenceNumber || "-"}</td>
                          <td className={`p-3 font-bold ${tx.type === "PURCHASE" || tx.type === "OPENING_BALANCE" ? "text-amber-400" : "text-emerald-400"}`}>
                            {tx.type === "PURCHASE" || tx.type === "OPENING_BALANCE" ? "+" : "-"}{Number(tx.amount).toLocaleString()} ج.م
                          </td>
                          <td className="p-3 text-sky-300 font-bold">
                            {(tx.runningBalance ?? 0).toLocaleString()} ج.م
                          </td>
                          <td className="p-3 text-white/70 font-sans">{tx.notes || tx.paymentMethod || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs">
              <span className="text-white/50">إجمالي الحركات: {supplierLedgerTransactions.length}</span>
              <button
                onClick={() => setShowSupplierLedgerModal(false)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-5 rounded-xl transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Payment Modal (سداد دفعة لمورد / مصنع) */}
      {showSupplierPayModal && supplierPaySupplier && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-white/15 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">سداد دفعة نقدية لمورد / مصنع</h3>
                  <p className="text-xs text-white/50">{supplierPaySupplier.name} {supplierPaySupplier.phone ? `(${supplierPaySupplier.phone})` : ""}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSupplierPayModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-xs text-amber-300 font-bold">إجمالي مستحقات المورد الحالية:</span>
              <span className="text-lg font-black font-mono text-amber-400">{(supplierPaySupplier.totalDebt || 0).toLocaleString()} ج.م</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-white/70 font-bold">مبلغ السداد (ج.م) *:</label>
                  <button
                    type="button"
                    onClick={() => setSupplierPayAmount(String(supplierPaySupplier.totalDebt || 0))}
                    className="text-[#00ff66] hover:underline text-[11px]"
                  >
                    سداد كامل المستحق
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={supplierPayAmount}
                  onChange={(e) => setSupplierPayAmount(e.target.value)}
                  placeholder="أدخل مبلغ السداد..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-3 text-white font-mono font-bold text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-white/70 font-bold">طريقة السداد:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSupplierPayMethod("CASH")}
                    className={`p-2.5 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                      supplierPayMethod === "CASH"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    <Wallet size={14} />
                    نقدي من الخزينة
                  </button>
                  <button
                    type="button"
                    onClick={() => setSupplierPayMethod("BANK_TRANSFER")}
                    className={`p-2.5 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                      supplierPayMethod === "BANK_TRANSFER"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    <CreditCard size={14} />
                    تحويل بنكي / محفظة
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-white/70 font-bold">ملاحظات / رقم إيصال التحويل:</label>
                <input
                  type="text"
                  value={supplierPayNotes}
                  onChange={(e) => setSupplierPayNotes(e.target.value)}
                  placeholder="مثال: دفعة تحت حساب طلبيات الأوفر سايز..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleExecuteSupplierPay}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                تأكيد سداد المبلغ للمورد 💵
              </button>
              <button
                onClick={() => setShowSupplierPayModal(false)}
                className="bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-4 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Supplier Modal (إضافة أو تعديل مورد / مصنع) */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-white/15 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {supplierFormData.id ? "تعديل بيانات المورد / المصنع" : "إضافة مورد / مصنع ملابس جديد 🏭"}
                  </h3>
                  <p className="text-xs text-white/50">تسجيل وتحديث بيانات المصانع وشركات استيراد وتوريد الملابس</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddSupplierModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block mb-1.5 text-white/70 font-bold">اسم المورد / المصنع *:</label>
                <input
                  type="text"
                  value={supplierFormData.name}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
                  placeholder="مثال: مصنع النسيج التركي للملابس الجاهزة"
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-white/70">اسم المسؤول / المندوب:</label>
                  <input
                    type="text"
                    value={supplierFormData.contactName}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, contactName: e.target.value })}
                    placeholder="مثال: أ / أحمد الديب"
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-white/70">رقم الهاتف / الواتساب:</label>
                  <input
                    type="text"
                    value={supplierFormData.phone}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                    placeholder="010XXXXXXXX"
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-white/70">العنوان / المحافظة:</label>
                  <input
                    type="text"
                    value={supplierFormData.address}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, address: e.target.value })}
                    placeholder="مثال: المحلة الكبرى، المنطقة الصناعية"
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-white/70">الرصيد الافتتاحي (ج.م):</label>
                  <input
                    type="number"
                    value={supplierFormData.openingBalance}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, openingBalance: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    disabled={!!supplierFormData.id}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-white/70">ملاحظات / أصناف التوريد:</label>
                <textarea
                  value={supplierFormData.notes}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, notes: e.target.value })}
                  placeholder="مثال: متخصص في خامات القطن الميلتون والهودي الصيفي..."
                  rows={2}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveSupplier}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                {supplierFormData.id ? "حفظ التعديلات" : "إضافة المورد وحفظ 🏭"}
              </button>
              <button
                onClick={() => setShowAddSupplierModal(false)}
                className="bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-4 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Purchase Invoice Modal (فاتورة مشتريات / مردودات مشتريات) */}
      {showAddPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-white/15 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">
                    {purchaseFormType === "PURCHASE" ? "تسجيل فاتورة توريد / مشتريات جديدة 📦" : "تسجيل مردودات مشتريات للمورد ↩️"}
                  </h3>
                  <p className="text-xs text-white/50">
                    {purchaseFormType === "PURCHASE"
                      ? "إضافة الأصناف والمقاسات مباشرة إلى رصيد المخزن وتحديث كشف حساب المورد"
                      : "إرجاع قطع إلى المورد وتخفيض رصيد المخزن ومديونية المورد"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddPurchaseModal(false)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {/* Type & Destination & Supplier */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1.5 text-white/70 font-bold">نوع المعاملة:</label>
                  <select
                    value={purchaseFormType}
                    onChange={(e: any) => setPurchaseFormType(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-bold outline-none"
                  >
                    <option value="PURCHASE">📦 فاتورة مشتريات (توريد للمخزن)</option>
                    <option value="RETURN">↩️ مردودات مشتريات (إرجاع للمورد)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-white/70 font-bold">جهة التوريد / المخزن:</label>
                  <select
                    value={purchaseFormBranchId}
                    onChange={(e) => setPurchaseFormBranchId(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white outline-none"
                  >
                    <option value="CENTRAL_WAREHOUSE">🏢 المخزن المركزي الرئيسي (Bazaar Central)</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        📍 {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-white/70 font-bold">المورد / المصنع *:</label>
                  <select
                    value={purchaseFormSupplierId}
                    onChange={(e) => setPurchaseFormSupplierId(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-amber-300 font-bold outline-none"
                  >
                    <option value="">-- اختر المورد أو المصنع --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.contactName ? `(${s.contactName})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Lines */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-white font-bold flex items-center gap-1.5">
                    <Barcode size={15} className="text-[#00ff66]" />
                    الأصناف والمقاسات الموردة:
                  </label>
                  <button
                    type="button"
                    onClick={() => setPurchaseFormLines([...purchaseFormLines, { variantId: "", quantity: 10, costPrice: 200 }])}
                    className="bg-[#00ff66]/10 hover:bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Plus size={14} />
                    إضافة صنف آخر
                  </button>
                </div>

                <div className="space-y-2">
                  {purchaseFormLines.map((line, idx) => (
                    <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-3 flex flex-col md:flex-row items-center gap-3">
                      {/* Variant Select */}
                      <div className="flex-1 w-full">
                        <select
                          value={line.variantId}
                          onChange={(e) => {
                            const newLines = [...purchaseFormLines];
                            newLines[idx].variantId = e.target.value;
                            // Pre-fill costPrice if available
                            products.forEach((p) => {
                              p.variants?.forEach((v: any) => {
                                if (v.id === e.target.value && v.costPrice) {
                                  newLines[idx].costPrice = v.costPrice;
                                }
                              });
                            });
                            setPurchaseFormLines(newLines);
                          }}
                          className="w-full bg-black/70 border border-white/15 rounded-xl p-2 text-white outline-none"
                        >
                          <option value="">-- اختر الصنف واللون والمقاس --</option>
                          {products.map((p) =>
                            p.variants?.map((v: any) => (
                              <option key={v.id} value={v.id}>
                                {p.nameAr} - {v.color} - مقاس {v.size} (باركود: {v.barcode})
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="w-full md:w-28 flex items-center gap-1.5">
                        <span className="text-white/50 text-[11px] whitespace-nowrap">الكمية:</span>
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => {
                            const newLines = [...purchaseFormLines];
                            newLines[idx].quantity = parseInt(e.target.value, 10) || 0;
                            setPurchaseFormLines(newLines);
                          }}
                          className="w-full bg-black/70 border border-white/15 rounded-xl p-2 text-center text-white font-mono font-bold outline-none"
                        />
                      </div>

                      {/* Cost Price */}
                      <div className="w-full md:w-32 flex items-center gap-1.5">
                        <span className="text-white/50 text-[11px] whitespace-nowrap">سعر التكلفة:</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={line.costPrice}
                          onChange={(e) => {
                            const newLines = [...purchaseFormLines];
                            newLines[idx].costPrice = parseFloat(e.target.value) || 0;
                            setPurchaseFormLines(newLines);
                          }}
                          className="w-full bg-black/70 border border-white/15 rounded-xl p-2 text-center text-amber-300 font-mono font-bold outline-none"
                        />
                      </div>

                      {/* Total */}
                      <div className="w-full md:w-28 text-left md:text-right font-mono font-bold text-white/90">
                        {((line.quantity || 0) * (line.costPrice || 0)).toLocaleString()} ج.م
                      </div>

                      {/* Delete */}
                      {purchaseFormLines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPurchaseFormLines(purchaseFormLines.filter((_, i) => i !== idx))}
                          className="w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculations Bar */}
              {(() => {
                const totalAmt = purchaseFormLines.reduce((acc, l) => acc + (l.quantity || 0) * (l.costPrice || 0), 0);
                const remaining = totalAmt - (purchaseFormPaidAmount || 0);
                return (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <span className="text-white/60 block mb-1">إجمالي الفاتورة:</span>
                      <span className="text-xl font-black font-mono text-[#00ff66]">{totalAmt.toLocaleString()} ج.م</span>
                    </div>

                    <div>
                      <label className="text-white/70 block mb-1">المبلغ المدفوع كاش للمورد الآن:</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={purchaseFormPaidAmount}
                        onChange={(e) => setPurchaseFormPaidAmount(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-black/60 border border-white/20 rounded-xl p-2 text-white font-mono font-bold outline-none"
                      />
                    </div>

                    <div>
                      <span className="text-white/60 block mb-1">المتبقي آجل على المنظومة:</span>
                      <span className={`text-xl font-black font-mono ${remaining > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                        {remaining.toLocaleString()} ج.م
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block mb-1.5 text-white/70 font-bold">ملاحظات الفاتورة:</label>
                <input
                  type="text"
                  value={purchaseFormNotes}
                  onChange={(e) => setPurchaseFormNotes(e.target.value)}
                  placeholder="مثال: فاتورة طلبيات تيشرتات الأوفر سايز كولكشن الشتاء..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white outline-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex gap-2">
              <button
                disabled={submittingPurchase}
                onClick={handleExecutePurchase}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {submittingPurchase ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    جاري الحفظ والتسجيل في المخزن...
                  </>
                ) : (
                  <>
                    <CheckCircle size={15} />
                    حفظ واعتماد الفاتورة وتحديث الأرصدة والمخزن 📦
                  </>
                )}
              </button>
              <button
                onClick={() => setShowAddPurchaseModal(false)}
                className="bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-5 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Season Modal (إضافة أو تعديل موسم أزياء) */}
      {showAddSeasonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-white/15 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {seasonFormData.id ? "تعديل الموسم" : "إضافة موسم أزياء جديد ☀️"}
                  </h3>
                  <p className="text-xs text-white/50">تحديد مواسم الموضة والعروض لربط المنتجات والتشكيلات بها</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddSeasonModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block mb-1.5 text-white/70 font-bold">اسم الموسم *:</label>
                <input
                  type="text"
                  value={seasonFormData.name}
                  onChange={(e) => setSeasonFormData({ ...seasonFormData, name: e.target.value })}
                  placeholder="مثال: شتاء 2026، كولكشن العيد، صيف 2026..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-white/70">تاريخ البداية:</label>
                  <input
                    type="date"
                    value={seasonFormData.startDate}
                    onChange={(e) => setSeasonFormData({ ...seasonFormData, startDate: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-white/70">تاريخ النهاية:</label>
                  <input
                    type="date"
                    value={seasonFormData.endDate}
                    onChange={(e) => setSeasonFormData({ ...seasonFormData, endDate: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-white/70">ملاحظات الموسم:</label>
                <textarea
                  value={seasonFormData.notes}
                  onChange={(e) => setSeasonFormData({ ...seasonFormData, notes: e.target.value })}
                  placeholder="مثال: يركز على التيشرتات الأوفر سايز والهوديز القطن..."
                  rows={2}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveSeason}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                {seasonFormData.id ? "حفظ التعديلات" : "حفظ الموسم الجديد ☀️"}
              </button>
              <button
                onClick={() => setShowAddSeasonModal(false)}
                className="bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-4 rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Tag Print Preview (Single & Batch) */}
      {(selectedTagItem || batchTagItems) && (
        <PrintBarcodeTag
          item={selectedTagItem || undefined}
          batchItems={batchTagItems || undefined}
          branches={branches}
          quantity={1}
          onClose={() => {
            setSelectedTagItem(null);
            setBatchTagItems(null);
          }}
        />
      )}

      {/* Orca Tech Signature Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#050508] py-5 px-4 text-center">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="text-xs text-slate-400 font-bold">
            جميع الحقوق محفوظة © {new Date().getFullYear()} لـ <span className="text-[#ffb703]">بزار كاجوال وير • BAZAAR Casual Wear</span>
          </p>

          <p className="text-[11px] text-amber-300/90 font-medium">
            تصميم وتطوير المنظومة الذكية:{" "}
            <strong className="text-white font-black">م / حمزة عباس</strong> — شركة{" "}
            <strong className="text-amber-400 font-black">أوركا للحلول البرمجية والذكاء الاصطناعي (Orca Tech) 🐬</strong>
          </p>

          <p className="text-[10px] text-slate-500 font-mono">
            خدمة الدعم الفني المباشر وتطوير الأنظمة: 01018671000
          </p>
        </div>
      </footer>
    </div>
  );
}
