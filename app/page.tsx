"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShoppingBag,
  MapPin,
  Phone,
  Search,
  Flame,
  Check,
  ChevronDown,
  X,
  Plus,
  Minus,
  MessageCircle,
  Share2,
  SlidersHorizontal,
  QrCode,
  ShieldCheck,
  Heart,
  User,
  Mail,
  KeyRound,
  ArrowRight,
  LogOut,
  ExternalLink,
  Menu,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import PrintableCard from "@/components/PrintableCard";
import { useToast } from "@/components/Toast";

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  whatsapp?: string;
  googleMapsUrl?: string;
  isDayOffEnabled?: boolean;
}

interface Category {
  id: string;
  nameAr: string;
  slug: string;
  icon?: string;
}

interface ProductVariant {
  id: string;
  color: string;
  colorHex?: string;
  image?: string;
  size: string;
  barcode: string;
  priceOverride?: number;
  stockCentral: number;
  branchStocks?: { branchId: string; quantity: number }[];
}

interface Product {
  id: string;
  nameAr: string;
  sku?: string;
  description?: string;
  basePrice: number;
  costPrice: number;
  discountPrice?: number;
  featuredImage?: string;
  material?: string;
  category?: Category;
  variants: ProductVariant[];
}

interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  color: string;
  size: string;
  image?: string;
  price: number;
  quantity: number;
}

export default function StorefrontPage() {
  const { showToast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modals
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [chosenColor, setChosenColor] = useState<string>("");
  const [chosenSize, setChosenSize] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState<boolean>(false);

  // Customer Auth (OTP + Registration)
  const [customer, setCustomer] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authStep, setAuthStep] = useState<"DETAILS" | "OTP">("DETAILS");
  const [authName, setAuthName] = useState<string>("");
  const [authPhone, setAuthPhone] = useState<string>("");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [otpInput, setOtpInput] = useState<string>("");
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string>("");

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProduct(null);
        setShowAuthModal(false);
        setShowCart(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [bRes, cRes, pRes, sRes] = await Promise.all([
          fetch("/api/branches"),
          fetch("/api/categories"),
          fetch("/api/products"),
          fetch("/api/settings"),
        ]);

        const bData = await bRes.json();
        const cData = await cRes.json();
        const pData = await pRes.json();
        const sData = await sRes.json();

        if (bData.branches) setBranches(bData.branches);
        if (cData.categories) setCategories(cData.categories);
        if (pData.products) setProducts(pData.products);
        if (sData.settings) setSettings(sData.settings);
      } catch (err) {
        console.error("Storefront fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Check logged in customer from localStorage
    const savedCustomer = localStorage.getItem("bazaar_customer");
    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch (e) {
        // Ignored
      }
    }
  }, []);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" || p.category?.slug === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.material?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variants.some(
        (v) =>
          v.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.size.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesCategory && matchesSearch;
  });

  // Open Product Variant Selection Modal
  const openProductModal = (product: Product, initialColor?: string) => {
    setSelectedProduct(product);
    if (product.variants && product.variants.length > 0) {
      const targetVariant = initialColor
        ? product.variants.find((v) => v.color === initialColor) || product.variants[0]
        : product.variants[0];

      setChosenColor(targetVariant.color);
      setChosenSize(targetVariant.size);
      setActiveImage(targetVariant.image || product.featuredImage || "");
    } else {
      setActiveImage(product.featuredImage || "");
    }
  };

  // Change Color and update picture dynamically
  const handleColorChange = (color: string) => {
    setChosenColor(color);
    if (selectedProduct) {
      const match = selectedProduct.variants.find((v) => v.color === color && v.image);
      if (match?.image) {
        setActiveImage(match.image);
      }
      // Also adjust size if current chosen size isn't in this color
      const availableSizes = selectedProduct.variants
        .filter((v) => v.color === color)
        .map((v) => v.size);
      if (!availableSizes.includes(chosenSize) && availableSizes.length > 0) {
        setChosenSize(availableSizes[0]);
      }
    }
  };

  // Add to cart
  const addToCart = () => {
    if (!selectedProduct) return;
    const variant = selectedProduct.variants.find(
      (v) => v.color === chosenColor && v.size === chosenSize
    );
    if (!variant) return;

    const price = variant.priceOverride || selectedProduct.basePrice;

    setCart((prev) => {
      const existing = prev.find((item) => item.variantId === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          variantId: variant.id,
          productId: selectedProduct.id,
          name: selectedProduct.nameAr,
          color: chosenColor,
          size: chosenSize,
          image: variant.image || selectedProduct.featuredImage,
          price,
          quantity: 1,
        },
      ];
    });

    setSelectedProduct(null);
    setShowCart(true);
  };

  const updateCartQty = (variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variantId === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // WhatsApp checkout
  const handleWhatsAppCheckout = () => {
    const selectedBranch = branches.find((b) => b.id === selectedBranchId);
    const branchName = selectedBranch ? selectedBranch.name : "الفرع الأقرب لي (عباس العقاد)";

    let text = `مرحباً بزار كاجوال وير، أود طلب الأصناف التالية من (${branchName}):\n\n`;
    cart.forEach((item, idx) => {
      text += `${idx + 1}. ${item.name} - لون: ${item.color} - مقاس: ${item.size} - عدد: ${item.quantity} (السعر: ${item.price * item.quantity} ج.م)\n`;
    });
    text += `\nإجمالي الأوردر: ${cartTotal} ج.م`;
    if (customer?.name) {
      text += `\nاسم العميل: ${customer.name} (${customer.phone || ""})`;
    }
    text += `\nيرجى تأكيد التوافر وتفاصيل الاستلام أو الدليفري.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/201008038041?text=${encoded}`, "_blank");
  };

  // Customer Send OTP
  const handleSendOtp = async () => {
    if (!authPhone || !authEmail || !authEmail.includes("@")) {
      setAuthError("يرجى إدخال رقم الهاتف وبريد إلكتروني صحيح لاستلام كود التفعيل");
      return;
    }

    try {
      setOtpLoading(true);
      setAuthError("");
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SEND",
          email: authEmail,
          phone: authPhone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAuthStep("OTP");
        setAuthSuccessMsg(`تم إرسال كود التفعيل المكون من 6 أرقام إلى بريدك: ${authEmail}`);
      } else {
        setAuthError(data.error || "فشل إرسال كود التفعيل");
      }
    } catch (e) {
      setAuthError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setOtpLoading(false);
    }
  };

  // Customer Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length < 4) {
      setAuthError("يرجى إدخال كود التفعيل المستلم");
      return;
    }

    try {
      setOtpLoading(true);
      setAuthError("");
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY",
          email: authEmail,
          phone: authPhone,
          code: otpInput,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const cRes = await fetch(`/api/customers?phone=${authPhone}`);
        const cData = await cRes.json();
        const customerProfile = cData.customer || {
          name: authName || "عميل بزار كاجوال",
          phone: authPhone,
          email: authEmail,
          points: 50,
          totalPurchases: 0,
        };

        setCustomer(customerProfile);
        localStorage.setItem("bazaar_customer", JSON.stringify(customerProfile));
        setShowAuthModal(false);
        setAuthStep("DETAILS");
        setOtpInput("");
        showToast(`أهلاً بك يا ${customerProfile.name} في بزار كاجوال وير 👑! تم تفعيل حسابك بنجاح.`, "success");
      } else {
        setAuthError(data.error || "كود التفعيل غير صحيح");
      }
    } catch (e) {
      setAuthError("حدث خطأ أثناء فحص الكود");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem("bazaar_customer");
    setCustomer(null);
  };

  return (
    <div className="min-h-screen bg-[#07070b] text-gray-100 flex flex-col selection:bg-[#00ff66] selection:text-black">
      {/* Top Banner Ticker with Neon Accents */}
      <div className="bg-gradient-to-r from-[#ffb703] via-[#fb8500] to-[#00ff66] text-black py-1.5 px-4 text-xs font-black text-center flex items-center justify-center gap-2 tracking-wide">
        <Sparkles size={14} />
        <span>كولكشن الشارع المصري الجديد • قطن تركي وأوفر سايز عصري بجميع الفروع | خدمة التوصيل متاحة 🚀</span>
      </div>

      {/* Main Navbar - Fully Responsive Mobile & Desktop */}
      <header className="sticky top-0 z-40 bg-[#0a0a10]/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo matching Store Signage */}
          <div className="flex items-center gap-3">
            <a href="/" className="hover:opacity-95 transition-opacity">
              <BrandLogo size="md" />
            </a>
          </div>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Direct Admin Access Button */}
            <a
              href="/admin"
              className="bg-white/5 hover:bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:text-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              title="دخول الإدارة ونقاط البيع POS"
            >
              <ShieldCheck size={16} />
              <span>لوحة الإدارة POS</span>
            </a>

            {/* The Royal 1-QR Card Button */}
            <a
              href="/card"
              className="bg-[#00ff66]/10 hover:bg-[#00ff66]/20 border border-[#00ff66]/40 text-[#00ff66] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <QrCode size={16} />
              <span>كارت العلامة 1-QR</span>
            </a>

            {/* Customer Login / Loyalty Account */}
            {customer ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-white/10 border border-[#ffb703]/40 text-[#ffb703] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <User size={15} />
                <span className="max-w-[80px] truncate">{customer.name}</span>
                <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded-full text-[#00ff66]">
                  {customer.points || 0}🌟
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthStep("DETAILS");
                  setShowAuthModal(true);
                }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
              >
                <User size={15} className="text-[#00ff66]" />
                <span>حساب العميل (OTP)</span>
              </button>
            )}

            {/* Desktop Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-gradient-to-r from-[#ffb703] to-[#fb8500] hover:brightness-110 text-black px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-[#ffb703]/20 active:scale-95 transition-all"
            >
              <ShoppingBag size={16} />
              <span>السلة</span>
              {cart.length > 0 && (
                <span className="w-5 h-5 bg-black text-[#00ff66] rounded-full flex items-center justify-center text-[10px] font-black">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Right Actions: Cart & Quick Menu Drawer Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-gradient-to-r from-[#ffb703] to-[#fb8500] text-black px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#ffb703]/20 active:scale-95"
            >
              <ShoppingBag size={15} />
              <span>السلة</span>
              {cart.length > 0 && (
                <span className="w-4 h-4 bg-black text-[#00ff66] rounded-full flex items-center justify-center text-[9px] font-black">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/10 border border-white/10 text-white active:scale-95 transition-all"
              aria-label="القائمة السريعة"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Sheet */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/10 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-3 gap-2">
              <a
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex flex-col items-center justify-center gap-1 text-center"
              >
                <ShieldCheck size={18} />
                <span>لوحة الإدارة POS</span>
              </a>

              <a
                href="/card"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] text-[11px] font-bold flex flex-col items-center justify-center gap-1 text-center"
              >
                <QrCode size={18} />
                <span>كارت 1-QR</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthStep("DETAILS");
                  setShowAuthModal(true);
                }}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[11px] font-bold flex flex-col items-center justify-center gap-1 text-center"
              >
                <User size={18} className="text-[#00ff66]" />
                <span>{customer ? customer.name.slice(0, 8) : "دخول OTP"}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Branch Selector Bar (عباس العقاد / كشري التحرير / الكل) */}
      <div className="bg-[#0b0b14] border-b border-white/5 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-white/50 font-bold whitespace-nowrap hidden sm:inline">
            📍 اختر الفرع:
          </span>
          <button
            onClick={() => setSelectedBranchId("all")}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedBranchId === "all"
                ? "bg-[#ffb703] text-black border-[#ffb703] shadow-md shadow-[#ffb703]/20 font-black"
                : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
            }`}
          >
            🔥 جميع الفروع
          </button>
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBranchId(b.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                selectedBranchId === b.id
                  ? "bg-[#00ff66] text-black border-[#00ff66] shadow-md shadow-[#00ff66]/20 font-black"
                  : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
              }`}
            >
              <MapPin size={12} />
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hero Section: Minimalist & Stylish Streetwear Visual */}
      <section className="relative px-4 py-6 md:py-10 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-br from-[#101018] via-[#141422] to-[#0d0d16] border border-[#00ff66]/25 rounded-3xl p-5 md:p-8 relative overflow-hidden shadow-2xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#ffb703]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00ff66]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center relative z-10">
            {/* Right Column: Clean Brand Identity & Fast Search */}
            <div className="lg:col-span-7 space-y-4 text-right">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] text-xs font-black">
                <Flame size={14} />
                <span>THE ROYAL STREETWEAR COLLECTION • 2026</span>
              </div>

              {/* Glowing Store Signage Brand Logo */}
              <div className="pt-1">
                <BrandLogo size="xl" />
              </div>

              {/* Short & Punchy Subtitle - No Wall of Text */}
              <p className="text-white/80 text-sm md:text-base font-semibold leading-relaxed">
                أرقى خامات الأوفر سايز، الكارجو، الهوديز، والكاجوال بفرعي عباس العقاد وأول عباس بالقاهرة.
              </p>

              {/* Search Input with Neon Accent */}
              <div className="relative pt-2 max-w-xl">
                <Search className="absolute right-3.5 top-5 text-[#00ff66]" size={18} />
                <input
                  type="text"
                  placeholder="ابحث بالاسم، الموديل، اللون (أسود، زيتي...) أو المقاس (XL, 34)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/70 border border-white/20 focus:border-[#00ff66] rounded-2xl py-3 pr-11 pl-4 text-xs md:text-sm text-white placeholder-white/40 outline-none transition-all shadow-inner"
                />
              </div>

              {/* Quick Filter Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {["تيشرتات أوفر سايز", "بناطيل كارجو", "جينز تركي", "هوديز", "سنيكرز"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag.split(" ")[0])}
                    className="text-[11px] font-bold text-white/60 hover:text-[#00ff66] bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/5 transition-all"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Left Column ("الفدان الواسع"): Editorial Streetwear Outfit Card (100% Dynamic & Editable from Dashboard) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#00ff66]/30 shadow-2xl group bg-black/40">
                <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={
                      settings?.heroBannerImage ||
                      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=80"
                    }
                    alt="Bazaar Casual Wear Men Streetwear"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Ambient Overlay Badges */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-1 text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black bg-[#00ff66] text-black px-2.5 py-0.5 rounded-full shadow-md">
                      الأكثر مبيعاً ⚡
                    </span>
                    <span className="text-xs font-mono font-bold text-[#ffb703]">
                      COLLECTION 2026
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white mt-1">
                    {settings?.heroTagline || "طقم الأوفر سايز والكارجو التكتيكال"}
                  </h4>
                  <p className="text-[11px] text-white/70">
                    {settings?.heroDescription || "قطن مصري 100% هيفي ويت معالج ضد الانكماش مع نسيج كارجو ووتر بروف"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Wrap Bar - Fully Responsive with No Cutting Off! */}
      <section className="px-4 max-w-7xl mx-auto w-full mb-4">
        <div className="flex flex-wrap gap-2 py-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
              selectedCategory === "all"
                ? "bg-gradient-to-r from-[#ffb703] to-[#fb8500] text-black border-[#ffb703] shadow-md shadow-[#ffb703]/20 font-black"
                : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
            }`}
          >
            🔥 جميع التشكيلة ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                selectedCategory === c.slug
                  ? "bg-[#00ff66] text-black border-[#00ff66] shadow-md shadow-[#00ff66]/20 font-black"
                  : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
              }`}
            >
              {c.nameAr}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid with Color Previews */}
      <section className="px-4 max-w-7xl mx-auto w-full flex-1 mb-12">
        {loading ? (
          <div className="text-center py-20 text-white/60">
            <div className="animate-spin text-4xl mb-3">👑</div>
            <p className="font-bold text-sm">جاري تحميل تشكيلة بزار كاجوال وير...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 p-8">
            <p className="text-base font-bold text-white mb-2">لم يتم العثور على قطع تطابق بحثك</p>
            <p className="text-xs text-white/50">جرب البحث بكلمات أخرى أو تصفح الأقسام من الأعلى</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((p) => {
              const colors = Array.from(new Set(p.variants.map((v) => v.color)));
              const sizes = Array.from(new Set(p.variants.map((v) => v.size)));
              const displayImg = p.featuredImage || p.variants[0]?.image;

              return (
                <div
                  key={p.id}
                  className="bg-[#12121a] border border-white/10 hover:border-[#00ff66]/50 rounded-2xl p-3 flex flex-col justify-between transition-all group hover:shadow-2xl hover:shadow-[#00ff66]/10"
                >
                  <div>
                    {/* Badge & Category */}
                    <div className="flex items-center justify-between text-[10px] text-white/50 mb-2 font-bold">
                      <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5 text-[#00ff66]">
                        {p.category?.nameAr || "كاجوال"}
                      </span>
                      {p.sku && <span className="font-mono text-[#ffb703]">{p.sku}</span>}
                    </div>

                    {/* Product Image */}
                    <div
                      onClick={() => openProductModal(p)}
                      className="w-full aspect-[4/3] rounded-xl bg-black/60 border border-white/5 overflow-hidden cursor-pointer relative group-hover:scale-[1.02] transition-transform"
                    >
                      {displayImg ? (
                        <img
                          src={displayImg}
                          alt={p.nameAr}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-4xl">
                          👕
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 py-1.5 bg-black/75 backdrop-blur-sm text-center text-[10px] text-[#00ff66] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        معاينة واختيار المقاس واللون
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => openProductModal(p)}
                      className="font-bold text-sm text-white mt-3 line-clamp-2 hover:text-[#ffb703] cursor-pointer transition-colors leading-snug"
                    >
                      {p.nameAr}
                    </h3>

                    {/* Material info */}
                    {p.material && (
                      <p className="text-[11px] text-white/50 line-clamp-1 mt-1">{p.material}</p>
                    )}

                    {/* Interactive Color Dots Preview */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <span className="text-[10px] text-white/40">الألوان:</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {p.variants
                          .filter((v, idx, arr) => arr.findIndex((x) => x.color === v.color) === idx)
                          .slice(0, 5)
                          .map((v, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                openProductModal(p, v.color);
                              }}
                              className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm hover:scale-125 transition-transform"
                              style={{ backgroundColor: v.colorHex || "#444" }}
                              title={`اختر لون ${v.color}`}
                            />
                          ))}
                      </div>
                    </div>

                    {/* Available Sizes preview */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sizes.slice(0, 5).map((s) => (
                        <span
                          key={s}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/70"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action Button */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-[#ffb703]">
                        {p.basePrice} <span className="text-[10px] text-white/70 font-normal">ج.م</span>
                      </div>
                    </div>
                    <button
                      onClick={() => openProductModal(p)}
                      className="bg-gradient-to-r from-[#00ff66] to-emerald-500 hover:brightness-110 text-black px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md shadow-[#00ff66]/20 active:scale-95 transition-all"
                    >
                      اختيار
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Dynamic Product Variant Selection Modal (الصورة والمقاسات تتغير مع اللون!) */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start pt-6 pb-20"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-[#101018] border border-[#00ff66]/30 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl text-white relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Modal Top Bar - Never cut off on mobile! */}
            <div className="sticky top-0 z-30 bg-[#101018]/95 backdrop-blur-md -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 p-4 border-b border-white/10 flex items-center justify-between rounded-t-3xl mb-4">
              <button
                onClick={() => setSelectedProduct(null)}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-white/10 transition-all"
              >
                <ArrowRight size={16} />
                <span>الرجوع للمتجر</span>
              </button>

              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 active:scale-95 transition-all"
                title="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            {/* Product Image switches when color changes! */}
            <div className="w-full aspect-video rounded-2xl bg-black/60 overflow-hidden mb-4 border border-white/10 relative">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={selectedProduct.nameAr}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">
                  👕
                </div>
              )}
              <div className="absolute top-3 right-3 bg-black/80 px-3 py-1 rounded-full text-xs font-bold text-[#00ff66] border border-[#00ff66]/40 shadow-lg">
                اللون الحالي: {chosenColor}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs bg-[#ffb703]/10 text-[#ffb703] px-3 py-1 rounded-full border border-[#ffb703]/30 font-bold">
                {selectedProduct.category?.nameAr || "كاجوال"}
              </span>
              <h3 className="text-xl font-black text-white mt-2 leading-snug">
                {selectedProduct.nameAr}
              </h3>
              {selectedProduct.material && (
                <p className="text-xs text-white/60 mt-1 font-medium">{selectedProduct.material}</p>
              )}
              <div className="text-2xl font-black text-[#ffb703] mt-2">
                {selectedProduct.basePrice} <span className="text-xs text-white/70 font-normal">ج.م</span>
              </div>
            </div>

            {/* Color Selector */}
            <div className="mt-5 text-right">
              <label className="text-xs font-bold text-white/70 block mb-2">
                اضغط على اللون لتغيير الصورة والمقاس: <strong className="text-[#00ff66]">{chosenColor}</strong>
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(selectedProduct.variants.map((v) => v.color))).map((c) => {
                  const variant = selectedProduct.variants.find((v) => v.color === c);
                  const isSelected = chosenColor === c;
                  return (
                    <button
                      key={c}
                      onClick={() => handleColorChange(c)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                        isSelected
                          ? "bg-[#00ff66] text-black border-[#00ff66] shadow-lg shadow-[#00ff66]/30 font-black scale-105"
                          : "bg-white/5 text-white/80 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/40 shadow"
                        style={{ backgroundColor: variant?.colorHex || "#333" }}
                      />
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector for this specific color */}
            <div className="mt-4 text-right">
              <label className="text-xs font-bold text-white/70 block mb-2">
                المقاسات المتوفرة للون ({chosenColor}): <strong className="text-[#ffb703]">{chosenSize}</strong>
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Set(
                    selectedProduct.variants
                      .filter((v) => v.color === chosenColor)
                      .map((v) => v.size)
                  )
                ).map((s) => {
                  const isSelected = chosenSize === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setChosenSize(s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? "bg-[#ffb703] text-black border-[#ffb703] shadow-lg shadow-[#ffb703]/30 font-black"
                          : "bg-white/5 text-white/80 border-white/10 hover:border-white/20"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Branch Stock Availability */}
            <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="font-bold text-[#00ff66] flex items-center gap-1.5">
                <MapPin size={14} />
                <span>رصيد القطعة بالمقاس ({chosenSize}) واللون ({chosenColor}) بالفروع:</span>
              </div>
              {branches.map((b) => {
                const variant = selectedProduct.variants.find(
                  (v) => v.color === chosenColor && v.size === chosenSize
                );
                const bStock = variant?.branchStocks?.find((bs) => bs.branchId === b.id);
                const qty = bStock ? bStock.quantity : 0;
                return (
                  <div key={b.id} className="flex justify-between items-center text-white/80">
                    <span>{b.name}</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        qty > 2
                          ? "bg-emerald-500/20 text-[#00ff66]"
                          : qty > 0
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {qty > 0 ? `متوفر (${qty} قطع بالصالة)` : "نفد من صالة هذا الفرع"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Add to Cart Action */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={addToCart}
                className="flex-1 bg-gradient-to-r from-[#00ff66] via-emerald-400 to-[#00ff66] hover:brightness-110 text-black font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#00ff66]/20 active:scale-95 transition-all text-sm"
              >
                <ShoppingBag size={18} />
                <span>إضافة إلى سلة الشراء</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Registration & OTP Verification Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#101018] border border-[#00ff66]/40 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white relative">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setAuthError("");
                setAuthSuccessMsg("");
              }}
              className="absolute top-5 left-5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70"
            >
              <X size={20} />
            </button>

            {/* If Customer is already logged in, show Profile and Loyalty status */}
            {customer ? (
              <div className="text-center space-y-4 py-2">
                <span className="p-3 bg-[#00ff66]/10 text-[#00ff66] rounded-2xl inline-block text-3xl">
                  👑
                </span>
                <h3 className="text-xl font-black text-white">{customer.name}</h3>
                <p className="text-xs text-white/50">{customer.email} • {customer.phone}</p>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center space-y-2">
                  <div className="text-xs text-white/70">رصيد نقاط الولاء الملكية:</div>
                  <div className="text-3xl font-black text-[#ffb703] font-mono">
                    {customer.points || 0} <span className="text-sm font-normal text-white">نقطة 🌟</span>
                  </div>
                  <p className="text-[10px] text-white/50">
                    تحصل على 1 نقطة مقابل كل 20 ج.م مشتريات من فروع بزار كاجوال وير
                  </p>
                </div>

                <button
                  onClick={handleCustomerLogout}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  تسجيل الخروج من الحساب
                </button>
              </div>
            ) : (
              /* OTP Registration / Login Form */
              <div>
                <div className="text-center pb-4">
                  <span className="p-3 bg-[#00ff66]/10 text-[#00ff66] rounded-2xl inline-block text-2xl mb-2">
                    🔐
                  </span>
                  <h3 className="text-xl font-black text-white">تسجيل حساب عميل بالـ OTP</h3>
                  <p className="text-xs text-white/50 mt-1">
                    أدخل بياناتك لتصلك رسالة كود التفعيل السري على بريدك الإلكتروني
                  </p>
                </div>

                {authError && (
                  <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-300 mb-3 text-center font-bold">
                    {authError}
                  </div>
                )}

                {authSuccessMsg && (
                  <div className="p-3 bg-[#00ff66]/15 border border-[#00ff66]/30 rounded-xl text-xs text-[#00ff66] mb-3 text-center font-bold">
                    {authSuccessMsg}
                  </div>
                )}

                {authStep === "DETAILS" ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block mb-1 text-white/70 font-bold">اسم العميل:</label>
                      <input
                        type="text"
                        placeholder="مثال: أحمد مصطفى"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full bg-black/50 border border-white/15 focus:border-[#00ff66] rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-white/70 font-bold">رقم الموبايل:</label>
                      <input
                        type="tel"
                        placeholder="010XXXXXXXX"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full bg-black/50 border border-white/15 focus:border-[#00ff66] rounded-xl p-2.5 text-white outline-none font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-white/70 font-bold">البريد الإلكتروني (لاستلام كود الـ OTP):</label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-black/50 border border-white/15 focus:border-[#00ff66] rounded-xl p-2.5 text-white outline-none font-mono text-center"
                      />
                    </div>

                    <button
                      onClick={handleSendOtp}
                      disabled={otpLoading}
                      className="w-full mt-2 bg-gradient-to-r from-[#00ff66] to-emerald-500 hover:brightness-110 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-[#00ff66]/20 active:scale-95 transition-all"
                    >
                      {otpLoading ? "جاري إرسال كود التفعيل..." : "إرسال كود التفعيل (Send OTP) ✉️"}
                    </button>
                  </div>
                ) : (
                  /* OTP Entry Step */
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block mb-2 text-white/70 text-center font-bold">
                        أدخل كود التفعيل المكون من 6 أرقام:
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="••••••"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="w-full bg-black/60 border border-[#00ff66]/50 rounded-2xl py-3 px-4 text-center font-mono text-2xl font-black text-[#00ff66] tracking-[8px] outline-none"
                      />
                    </div>

                    <button
                      onClick={handleVerifyOtp}
                      disabled={otpLoading}
                      className="w-full bg-gradient-to-r from-[#00ff66] to-emerald-500 hover:brightness-110 text-black font-black py-3 rounded-xl text-xs shadow-lg shadow-[#00ff66]/20 active:scale-95 transition-all"
                    >
                      {otpLoading ? "جاري التحقق..." : "تأكيد وتفعيل الحساب الآن 🚀"}
                    </button>

                    <button
                      onClick={() => setAuthStep("DETAILS")}
                      className="w-full text-center text-white/50 hover:text-white py-1 text-xs"
                    >
                      تغيير البريد الإلكتروني أو إعادة الإرسال
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shopping Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#101018] border-l border-white/10 h-full flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#00ff66]/10 text-[#00ff66] rounded-xl">🛍️</span>
                <h3 className="font-bold text-lg text-white">سلة المشتريات ({cart.length})</h3>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-white/50">
                  <div className="text-4xl mb-2">🛒</div>
                  <p className="font-bold text-sm">سلتك فارغة حالياً</p>
                  <p className="text-xs mt-1">تصفح الكتالوج وأضف القطع التي تناسب ذوقك</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.variantId}
                    className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10"
                        />
                      )}
                      <div>
                        <h4 className="font-bold text-xs text-white line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] text-white/50">
                          {item.color} • مقاس {item.size} • {item.price} ج
                        </p>
                        <div className="font-black text-[#ffb703] text-xs mt-1">
                          {item.price * item.quantity} ج.م
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => updateCartQty(item.variantId, -1)}
                        className="text-white/70 hover:text-white p-1"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold font-mono px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.variantId, 1)}
                        className="text-white/70 hover:text-white p-1"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex justify-between text-sm font-bold">
                  <span>إجمالي الطلب:</span>
                  <span className="text-lg font-black text-[#ffb703]">{cartTotal} ج.م</span>
                </div>
                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:brightness-110 text-white font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all text-sm"
                >
                  <MessageCircle size={18} />
                  <span>تأكيد الطلب عبر واتساب المباشر</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable VIP Card Modal */}
      {showPrintModal && <PrintableCard onClose={() => setShowPrintModal(false)} />}

      {/* Footer with Orca Tech Signature */}
      <footer className="bg-[#050508] border-t border-white/10 pt-8 pb-4 px-4 text-xs text-white/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pb-6">
          <BrandLogo size="sm" showTagline={false} />
          <p>© {new Date().getFullYear()} بزار كاجوال وير - BAZAAR Casual Wear. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <a href="/card" className="hover:text-[#00ff66] font-bold">
              كارت العلامة الذكي 1-QR
            </a>
            <a href="/admin" className="text-amber-400 hover:underline flex items-center gap-1 font-bold">
              <ShieldCheck size={14} />
              <span>لوحة الإدارة ونقاط البيع POS</span>
            </a>
          </div>
        </div>

        {/* Orca Tech Signature Bottom Bar (Direct from Saddam system) */}
        <div className="border-t border-amber-500/20 bg-black/60 py-5 px-4 sm:px-8 text-center space-y-2 rounded-2xl max-w-7xl mx-auto">
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
