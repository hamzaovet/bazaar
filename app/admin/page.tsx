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
    "overview" | "inventory" | "barcodes" | "ai" | "transfers" | "treasury" | "customers" | "users"
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
  const [dataLoading, setDataLoading] = useState<boolean>(false);

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
      const [bRes, pRes, cRes, iRes, tRes, sRes, custRes, setRes, uRes] = await Promise.all([
        fetch("/api/branches"),
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/invoices"),
        fetch("/api/stock-transfers"),
        fetch("/api/shifts?status=ALL"),
        fetch("/api/customers"),
        fetch("/api/settings"),
        fetch("/api/users"),
      ]);

      const [b, p, c, i, t, s, cust, st, u] = await Promise.all([
        bRes.json(),
        pRes.json(),
        cRes.json(),
        iRes.json(),
        tRes.json(),
        sRes.json(),
        custRes.json(),
        setRes.json(),
        uRes.json(),
      ]);

      if (b.branches) setBranches(b.branches);
      if (p.products) setProducts(p.products);
      if (c.categories) setCategories(c.categories);
      if (i.invoices) setInvoices(i.invoices);
      if (t.transfers) setTransfers(t.transfers);
      if (s.shifts) setShifts(s.shifts);
      if (cust.customers) setCustomers(cust.customers);
      if (u.users) setUsersList(u.users);
      if (st.settings) {
        setSettings(st.settings);
        setHeroBannerUrl(st.settings.heroBannerImage || "");
        setHeroTaglineInput(st.settings.heroTagline || "");
        setHeroDescInput(st.settings.heroDescription || "");
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

        {/* TAB 3: BARCODE MAKER */}
        {activeTab === "barcodes" && (
          <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <span className="p-2.5 bg-[#ffb703]/10 text-[#ffb703] rounded-xl text-xl">🏷️</span>
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
                      <p className="font-mono text-[9px] text-[#ffb703] mt-1">{v.barcode}</p>
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
                      className="bg-[#ffb703] hover:bg-amber-400 text-black px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-[#ffb703]/20 transition-all"
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

        {/* TAB 7: CUSTOMERS CRM */}
        {activeTab === "customers" && (
          <div className="bg-[#12121a] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white pb-3 border-b border-white/10 flex items-center gap-2">
              <Users size={18} className="text-[#00ff66]" />
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
                      <td className="py-2.5 font-mono text-[#ffb703]">{c.phone}</td>
                      <td className="py-2.5 font-bold text-[#00ff66]">{c.points} نقطة 🌟</td>
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

      {/* Barcode Tag Print Preview */}
      {selectedTagItem && (
        <PrintBarcodeTag
          item={selectedTagItem}
          quantity={1}
          onClose={() => setSelectedTagItem(null)}
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
