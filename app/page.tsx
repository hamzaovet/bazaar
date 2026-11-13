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
} from "lucide-react";
import CardQRModal from "@/components/CardQRModal";

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
  price: number;
  quantity: number;
}

export default function StorefrontPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [chosenColor, setChosenColor] = useState<string>("");
  const [chosenSize, setChosenSize] = useState<string>("");

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState<boolean>(false);

  // Customer Loyalty Lookup Modal
  const [showLoyaltyModal, setShowLoyaltyModal] = useState<boolean>(false);
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerData, setCustomerData] = useState<any>(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState<boolean>(false);

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [bRes, cRes, pRes] = await Promise.all([
          fetch("/api/branches"),
          fetch("/api/categories"),
          fetch("/api/products"),
        ]);

        const bData = await bRes.json();
        const cData = await cRes.json();
        const pData = await pRes.json();

        if (bData.branches) setBranches(bData.branches);
        if (cData.categories) setCategories(cData.categories);
        if (pData.products) setProducts(pData.products);
      } catch (err) {
        console.error("Storefront fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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

  // Open Product Variant Selection
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    if (product.variants && product.variants.length > 0) {
      setChosenColor(product.variants[0].color);
      setChosenSize(product.variants[0].size);
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
    const branchName = selectedBranch ? selectedBranch.name : "الفرع الأقرب لي";

    let text = `مرحباً بزار كاجوال وير، أود طلب الأصناف التالية من (${branchName}):\n\n`;
    cart.forEach((item, idx) => {
      text += `${idx + 1}. ${item.name} - لون: ${item.color} - مقاس: ${item.size} - عدد: ${item.quantity} (السعر: ${item.price * item.quantity} ج.م)\n`;
    });
    text += `\nإجمالي الأوردر: ${cartTotal} ج.م\nيرجى تأكيد التوافر وتفاصيل الاستلام أو الدليفري.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/201008038041?text=${encoded}`, "_blank");
  };

  // Customer Loyalty Lookup
  const handleLoyaltyLookup = async () => {
    if (!customerPhone) return;
    try {
      setLoyaltyLoading(true);
      const res = await fetch(`/api/customers?phone=${customerPhone.trim()}`);
      const data = await res.json();
      if (data.customer) {
        setCustomerData(data.customer);
      } else {
        setCustomerData({ notFound: true });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoyaltyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black py-1.5 px-4 text-xs font-black text-center flex items-center justify-center gap-2 tracking-wide">
        <Sparkles size={14} />
        <span>عرض الافتتاح الملكي: خامات قطنية تركي وأوفر سايز عصري بجميع الفروع | خدمة التوصيل متاحة 🚀</span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-[#0d0d14]/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                B
              </span>
              <div>
                <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 uppercase">
                  BAZAAR
                </h1>
                <p className="text-[10px] text-white/50 -mt-1 font-semibold">CASUAL WEAR</p>
              </div>
            </a>
          </div>

          {/* Branch Picker (عباس العقاد / كشري التحرير / الكل) */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => setSelectedBranchId("all")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedBranchId === "all"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "text-white/70 hover:text-white"
              }`}
            >
              جميع الفروع
            </button>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBranchId(b.id)}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  selectedBranchId === b.id
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <MapPin size={12} />
                <span>{b.name}</span>
              </button>
            ))}
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-2">
            {/* The Royal 1-QR Card Button */}
            <button
              onClick={() => setShowQRModal(true)}
              className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <QrCode size={16} />
              <span className="hidden sm:inline">كارت العلامة</span>
              <span>1-QR</span>
            </button>

            {/* Customer Loyalty Account */}
            <button
              onClick={() => setShowLoyaltyModal(true)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Sparkles size={16} className="text-amber-400" />
              <span className="hidden sm:inline">نقاطك الملكية</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <ShoppingBag size={16} />
              <span>السلة</span>
              {cart.length > 0 && (
                <span className="w-5 h-5 bg-black text-amber-400 rounded-full flex items-center justify-center text-[10px] font-black -mr-1">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Branch Selector */}
        <div className="flex md:hidden gap-1 mt-2.5 overflow-x-auto no-scrollbar pt-1 border-t border-white/5">
          <button
            onClick={() => setSelectedBranchId("all")}
            className={`whitespace-nowrap px-3 py-1 text-xs font-bold rounded-lg border ${
              selectedBranchId === "all"
                ? "bg-amber-500 text-black border-amber-500"
                : "bg-white/5 text-white/70 border-white/10"
            }`}
          >
            جميع الفروع
          </button>
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBranchId(b.id)}
              className={`whitespace-nowrap px-3 py-1 text-xs font-bold rounded-lg border ${
                selectedBranchId === b.id
                  ? "bg-amber-500 text-black border-amber-500"
                  : "bg-white/5 text-white/70 border-white/10"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-8 md:py-12 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-[#161622] via-[#1a1a28] to-[#161622] border border-amber-500/20 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Flame size={14} />
              <span>كولكشن الشارع المصري • صيف وشتاء 2026</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-wide text-white">
              براند الشارع المصري الفاخر <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                BAZAAR CASUAL WEAR
              </span>
            </h2>
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              تيشرتات أوفر سايز هيفي ويت، بناطيل كارجو وجينز تركي، هوديز ميلتون مبطن، وبليزرات سليم فيت. خامات قطنية معالجة لا تنكمش وتدوم طويلاً.
            </p>

            {/* Search Input */}
            <div className="relative pt-2 max-w-lg">
              <Search className="absolute right-3.5 top-5 text-white/40" size={18} />
              <input
                type="text"
                placeholder="ابحث بالاسم، الموديل، اللون (أسود، زيتي...) أو المقاس (XL, 34)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-2xl py-3 pr-11 pl-4 text-xs md:text-sm text-white placeholder-white/40 outline-none transition-all shadow-inner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Scroller */}
      <section className="px-4 max-w-7xl mx-auto w-full mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              selectedCategory === "all"
                ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20"
                : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
            }`}
          >
            🔥 جميع التشكيلة ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                selectedCategory === c.slug
                  ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20"
                  : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
              }`}
            >
              {c.nameAr}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 max-w-7xl mx-auto w-full flex-1 mb-12">
        {loading ? (
          <div className="text-center py-20 text-white/60">
            <div className="animate-spin text-4xl mb-3">👑</div>
            <p className="font-bold text-sm">جاري تحميل أحدث موديلات بزار كاجوال وير...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 p-8">
            <p className="text-lg font-bold text-white mb-2">لم يتم العثور على قطع تطابق بحثك</p>
            <p className="text-xs text-white/50">جرب البحث بكلمات أخرى أو اختر قسماً آخر من الأعلى</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((p) => {
              // Extract unique colors and sizes
              const colors = Array.from(new Set(p.variants.map((v) => v.color)));
              const sizes = Array.from(new Set(p.variants.map((v) => v.size)));

              return (
                <div
                  key={p.id}
                  className="bg-[#14141d] border border-white/10 hover:border-amber-500/50 rounded-2xl p-3.5 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-amber-500/5"
                >
                  <div>
                    {/* Badge & Category */}
                    <div className="flex items-center justify-between text-[10px] text-white/50 mb-2 font-bold">
                      <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                        {p.category?.nameAr || "كاجوال"}
                      </span>
                      {p.sku && <span className="font-mono text-amber-400">{p.sku}</span>}
                    </div>

                    {/* Product Mock Visual / Graphic */}
                    <div
                      onClick={() => openProductModal(p)}
                      className="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group-hover:scale-[1.02] transition-transform"
                    >
                      <div className="text-4xl">👕</div>
                      <span className="text-[10px] font-black tracking-widest text-white/40 uppercase mt-2">
                        BAZAAR CASUAL
                      </span>
                      <div className="absolute inset-x-0 bottom-0 py-1 bg-black/60 backdrop-blur-sm text-center text-[10px] text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        معاينة واختيار المقاس
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => openProductModal(p)}
                      className="font-bold text-sm text-white mt-3 line-clamp-2 hover:text-amber-400 cursor-pointer transition-colors leading-snug"
                    >
                      {p.nameAr}
                    </h3>

                    {/* Material info */}
                    {p.material && (
                      <p className="text-[11px] text-white/50 line-clamp-1 mt-1">{p.material}</p>
                    )}

                    {/* Available Sizes preview */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {sizes.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/70"
                        >
                          {s}
                        </span>
                      ))}
                      {sizes.length > 4 && (
                        <span className="text-[9px] font-mono px-1 py-0.5 text-white/40">
                          +{sizes.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Action Button */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-amber-400">
                        {p.basePrice} <span className="text-[10px] text-white/70 font-normal">ج.م</span>
                      </div>
                    </div>
                    <button
                      onClick={() => openProductModal(p)}
                      className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all"
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

      {/* Product Selection Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#121218] border border-amber-500/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-white my-8 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 left-5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70"
            >
              <X size={20} />
            </button>

            <div className="text-right">
              <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 font-bold">
                {selectedProduct.category?.nameAr || "كاجوال"}
              </span>
              <h3 className="text-xl font-black text-white mt-2 leading-snug">
                {selectedProduct.nameAr}
              </h3>
              {selectedProduct.material && (
                <p className="text-xs text-white/60 mt-1 font-medium">{selectedProduct.material}</p>
              )}
              <div className="text-2xl font-black text-amber-400 mt-2">
                {selectedProduct.basePrice} <span className="text-xs text-white/70 font-normal">ج.م</span>
              </div>
            </div>

            {/* Color Selector */}
            <div className="mt-6 text-right">
              <label className="text-xs font-bold text-white/70 block mb-2">
                اختر اللون: <strong className="text-amber-400">{chosenColor}</strong>
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(selectedProduct.variants.map((v) => v.color))).map((c) => {
                  const variant = selectedProduct.variants.find((v) => v.color === c);
                  const isSelected = chosenColor === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setChosenColor(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                        isSelected
                          ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20"
                          : "bg-white/5 text-white/80 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/40"
                        style={{ backgroundColor: variant?.colorHex || "#333" }}
                      />
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mt-4 text-right">
              <label className="text-xs font-bold text-white/70 block mb-2">
                اختر المقاس: <strong className="text-amber-400">{chosenSize}</strong>
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
                          ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20"
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
            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <MapPin size={14} />
                <span>توافر هذا المقاس واللون في الفروع:</span>
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
                          ? "bg-emerald-500/20 text-emerald-400"
                          : qty > 0
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {qty > 0 ? `متوفر (${qty} قطع)` : "نفد من هذا الفرع"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={addToCart}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-sm"
              >
                <ShoppingBag size={18} />
                <span>إضافة إلى سلة الشراء</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111118] border-l border-white/10 h-full flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">🛍️</span>
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
                    <div>
                      <h4 className="font-bold text-xs text-white line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-white/50">
                        {item.color} • مقاس {item.size} • {item.price} ج
                      </p>
                      <div className="font-black text-amber-400 text-xs mt-1">
                        {item.price * item.quantity} ج.م
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
                  <span className="text-lg font-black text-amber-400">{cartTotal} ج.م</span>
                </div>
                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all text-sm"
                >
                  <MessageCircle size={18} />
                  <span>تأكيد الطلب عبر واتساب المباشر</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Loyalty Points Lookup Modal */}
      {showLoyaltyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#121218] border border-amber-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white relative">
            <button
              onClick={() => {
                setShowLoyaltyModal(false);
                setCustomerData(null);
              }}
              className="absolute top-5 left-5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70"
            >
              <X size={20} />
            </button>

            <div className="text-center pb-4">
              <span className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl inline-block text-2xl mb-2">
                👑
              </span>
              <h3 className="text-xl font-black text-white">بوابة عملاء بزار الملكية</h3>
              <p className="text-xs text-white/50 mt-1">
                استعلم عن رصيد نقاط الولاء، الهدايا، وسجل مشترياتك برقم هاتفك
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="tel"
                  placeholder="أدخل رقم الموبايل (مثال: 01008038041)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/40 outline-none transition-all text-center font-mono"
                />
              </div>
              <button
                onClick={handleLoyaltyLookup}
                disabled={loyaltyLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-xs"
              >
                {loyaltyLoading ? "جاري الاستعلام..." : "استعلام عن حسابي ونقاطي"}
              </button>
            </div>

            {/* Result */}
            {customerData && (
              <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                {customerData.notFound ? (
                  <p className="text-xs text-white/60">
                    لم نجد حساباً مسجلاً بهذا الرقم حتى الآن. سيتم إنشاء حسابك وتجميع نقاطك تلقائياً عند أول عملية شراء من فروعنا!
                  </p>
                ) : (
                  <div className="space-y-2">
                    <h4 className="font-bold text-white text-base">{customerData.name}</h4>
                    <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full font-black text-xs">
                      رصيد نقاطك: {customerData.points} نقطة 🌟
                    </div>
                    <div className="text-xs text-white/70">
                      إجمالي المشتريات: <strong>{customerData.totalPurchases} ج.م</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1-QR Smart Brand Modal */}
      {showQRModal && <CardQRModal onClose={() => setShowQRModal(false)} />}

      {/* Footer */}
      <footer className="bg-[#09090d] border-t border-white/10 py-8 px-4 text-center text-xs text-white/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} بزار كاجوال وير - BAZAAR Casual Wear. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <a href="/card" className="hover:text-amber-400 font-bold">
              كارت العلامة الذكي 1-QR
            </a>
            <a href="/admin" className="text-amber-400 hover:underline flex items-center gap-1 font-bold">
              <ShieldCheck size={14} />
              <span>دخول الإدارة ونقاط البيع POS</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
