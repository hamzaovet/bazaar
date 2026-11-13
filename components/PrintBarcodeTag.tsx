"use client";

import React, { useState, useMemo } from "react";
import { generateCode128Svg } from "@/lib/barcode";
import {
  Printer,
  X,
  Sliders,
  Check,
  RotateCcw,
  Plus,
  Minus,
  Eye,
  Tag,
  Barcode as BarcodeIcon,
  Maximize2,
  Columns,
  Layers,
} from "lucide-react";

export type StickerPresetSize = "38x25" | "50x25" | "2-up";

interface BarcodeTagProps {
  item: {
    productName: string;
    size: string;
    color: string;
    barcode: string;
    price: number;
    sku?: string;
    storeName?: string;
    subtitle?: string;
  };
  quantity?: number;
  onClose?: () => void;
}

export default function PrintBarcodeTag({
  item,
  quantity: initialQuantity = 1,
  onClose,
}: BarcodeTagProps) {
  // --- Label Dimension & Layout Settings ---
  // Default to 38x25 mm (Standard in Egypt, safe for 40x25 and 38x25 rolls)
  const [sizePreset, setSizePreset] = useState<StickerPresetSize>("38x25");
  const [quantity, setQuantity] = useState<number>(initialQuantity || 1);

  // --- Dynamic Editable Content ---
  const [storeName, setStoreName] = useState<string>(item.storeName || "BAZAAR");
  const [subtitle, setSubtitle] = useState<string>(item.subtitle || "كاجوال وير • شبابي");
  const [productName, setProductName] = useState<string>(item.productName || "قطعة كاجوال");
  const [color, setColor] = useState<string>(item.color || "أسود");
  const [size, setSize] = useState<string>(item.size || "XL");
  const [price, setPrice] = useState<number>(item.price || 0);
  const [currency, setCurrency] = useState<string>("ج.م");
  const [barcodeText, setBarcodeText] = useState<string>(item.barcode || "2001001001");

  // --- Visibility Toggles ---
  const [showStoreName, setShowStoreName] = useState<boolean>(true);
  const [showSubtitle, setShowSubtitle] = useState<boolean>(false); // off by default for 38x25 to keep it ultra clean
  const [showProductName, setShowProductName] = useState<boolean>(true);
  const [showBadges, setShowBadges] = useState<boolean>(true);
  const [showBarcodeSvg, setShowBarcodeSvg] = useState<boolean>(true);
  const [showBarcodeText, setShowBarcodeText] = useState<boolean>(true);
  const [showPrice, setShowPrice] = useState<boolean>(true);

  // --- Barcode Tuning ---
  const [barWidth, setBarWidth] = useState<number>(1.15); // 1.0 - 1.3
  const [barcodeHeight, setBarcodeHeight] = useState<number>(24); // 20 - 32px
  const [activeTab, setActiveTab] = useState<"edit" | "presets">("edit");

  // Generate Barcode SVG reactively
  const barcodeSvg = useMemo(() => {
    return generateCode128Svg(barcodeText, barcodeHeight, barWidth);
  }, [barcodeText, barcodeHeight, barWidth]);

  const handlePrint = () => {
    window.print();
  };

  const handleResetToDefaults = () => {
    setStoreName(item.storeName || "BAZAAR");
    setSubtitle(item.subtitle || "كاجوال وير • شبابي");
    setProductName(item.productName || "قطعة كاجوال");
    setColor(item.color || "أسود");
    setSize(item.size || "XL");
    setPrice(item.price || 0);
    setBarcodeText(item.barcode || "2001001001");
    setSizePreset("38x25");
    setShowStoreName(true);
    setShowSubtitle(false);
    setShowProductName(true);
    setShowBadges(true);
    setShowBarcodeSvg(true);
    setShowBarcodeText(true);
    setShowPrice(true);
    setBarWidth(1.15);
    setBarcodeHeight(24);
  };

  // Label width & height in millimeters
  const labelWidthMm = sizePreset === "50x25" ? 50 : 38;
  const labelHeightMm = 25;

  // Single sticker component for Live Preview and Print Output
  const renderStickerContent = (isPrint = false) => {
    const is50 = sizePreset === "50x25";
    return (
      <div
        className={`w-full h-full flex flex-col justify-between text-black select-none ${
          isPrint ? "bg-white" : ""
        }`}
        style={{
          boxSizing: "border-box",
          padding: is50 ? "1.2mm 2.2mm" : "0.8mm 1.5mm",
          overflow: "hidden",
          fontFamily: "'Cairo', 'Segoe UI', system-ui, sans-serif",
          lineHeight: 1.15,
        }}
        dir="rtl"
      >
        {/* Top Header: Store Name & Subtitle */}
        {(showStoreName || showSubtitle) && (
          <div className="flex items-center justify-between border-b border-black/80 pb-[1px] mb-[1px]">
            {showStoreName && (
              <span
                className="font-black tracking-wider uppercase"
                style={{ fontSize: is50 ? "10.5px" : "9px", letterSpacing: "0.5px" }}
              >
                {storeName}
              </span>
            )}
            {showSubtitle && (
              <span
                className="text-gray-800 font-bold truncate max-w-[60%]"
                style={{ fontSize: is50 ? "8px" : "6.5px" }}
              >
                {subtitle}
              </span>
            )}
          </div>
        )}

        {/* Product Name */}
        {showProductName && (
          <div
            className="font-black text-right truncate leading-none text-black"
            style={{ fontSize: is50 ? "10px" : "8.5px", margin: "1px 0" }}
          >
            {productName}
          </div>
        )}

        {/* Attributes Badges: Size & Color */}
        {showBadges && (
          <div
            className="flex items-center justify-between text-black font-mono leading-none my-[1px]"
            style={{ fontSize: is50 ? "9px" : "7.5px" }}
          >
            <div className="flex items-center gap-1 font-bold">
              <span className="text-[7px] text-gray-700">اللون:</span>
              <span className="truncate max-w-[70px]">{color}</span>
            </div>
            <div className="bg-black text-white px-1 py-[1px] rounded font-black tracking-tight">
              مقاس {size}
            </div>
          </div>
        )}

        {/* Barcode Graphic */}
        {showBarcodeSvg && (
          <div
            className="my-[1px] flex justify-center items-center overflow-hidden w-full"
            style={{ height: `${barcodeHeight}px` }}
            dangerouslySetInnerHTML={{ __html: barcodeSvg }}
          />
        )}

        {/* Bottom Row: Barcode Digits & Price */}
        <div className="flex items-center justify-between border-t border-black/80 pt-[1px] mt-[1px]">
          {showBarcodeText ? (
            <span
              className="font-mono font-bold tracking-widest text-black"
              style={{ fontSize: is50 ? "8.5px" : "7.5px" }}
            >
              {barcodeText}
            </span>
          ) : (
            <span />
          )}

          {showPrice && (
            <div className="flex items-center gap-0.5 text-black font-black leading-none">
              <span style={{ fontSize: is50 ? "11.5px" : "10px" }}>{price}</span>
              <span style={{ fontSize: is50 ? "7.5px" : "6.5px" }}>{currency}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 overflow-y-auto">
      {/* ── Dynamic Embedded Print CSS ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @page {
          size: ${sizePreset === "50x25" ? "50mm 25mm" : sizePreset === "2-up" ? "80mm 25mm" : "38mm 25mm"};
          margin: 0 !important;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            overflow: hidden !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-barcode-tag-area,
          #printable-barcode-tag-area * {
            visibility: visible !important;
          }
          #printable-barcode-tag-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .sticker-print-page-single {
            width: ${labelWidthMm}mm !important;
            height: ${labelHeightMm}mm !important;
            max-height: ${labelHeightMm}mm !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            overflow: hidden !important;
            background: #ffffff !important;
          }
          .sticker-print-page-2up {
            width: 80mm !important;
            height: 25mm !important;
            max-height: 25mm !important;
            box-sizing: border-box !important;
            display: flex !important;
            justify-content: space-between !important;
            page-break-after: always !important;
            break-after: page !important;
            overflow: hidden !important;
            background: #ffffff !important;
          }
          .sticker-print-col {
            width: 38mm !important;
            height: 25mm !important;
            max-height: 25mm !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
        }
      `,
        }}
      />

      <div className="bg-[#121218] border border-amber-500/40 rounded-3xl w-full max-w-4xl shadow-2xl text-white my-auto flex flex-col overflow-hidden max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <BarcodeIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  استوديو طباعة استيكر وتيكت الباركود
                </h3>
                <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  معاينة ديناميكية حية
                </span>
              </div>
              <p className="text-xs text-white/50">
                مقاسات قياسية موحدة (38×25 مم / 50×25 مم) متوافقة مع طابعات Xprinter الحرارية في مصر
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefaults}
              title="إعادة ضبط الحقول للقيم الأصلية"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all text-xs flex items-center gap-1.5"
            >
              <RotateCcw size={15} />
              <span className="hidden sm:inline">إعادة ضبط</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Split between Controls & Live Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT / MAIN CONTROLS (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Size Preset Picker */}
            <div>
              <label className="text-xs font-bold text-white/70 block mb-2 flex items-center gap-1.5">
                <Tag size={14} className="text-amber-400" />
                مقاس استيكر الباركود (Label Dimension):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSizePreset("38x25")}
                  className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    sizePreset === "38x25"
                      ? "bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500 text-white shadow-md shadow-amber-500/10"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-black text-xs text-amber-300">38 × 25 مم</span>
                    {sizePreset === "38x25" && <Check size={14} className="text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-white/70 leading-tight">
                    القياسي المعتمد (الأكثر توفراً والأرخص في مصر • رول 40×25)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSizePreset("50x25")}
                  className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    sizePreset === "50x25"
                      ? "bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500 text-white shadow-md shadow-amber-500/10"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-black text-xs text-amber-300">50 × 25 مم</span>
                    {sizePreset === "50x25" && <Check size={14} className="text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-white/70 leading-tight">
                    مقاس موسع (يشيل الاسم والتفاصيل والأسعار بارتياح)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSizePreset("2-up")}
                  className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    sizePreset === "2-up"
                      ? "bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500 text-white shadow-md shadow-amber-500/10"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-black text-xs text-amber-300">38×25 مزدوج</span>
                    {sizePreset === "2-up" && <Check size={14} className="text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-white/70 leading-tight">
                    2 استيكر في الصف على رول 80 مم (عرض عمودين)
                  </span>
                </button>
              </div>
            </div>

            {/* 2. Quantity Selector Bar */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-amber-400" />
                <span className="text-xs font-bold text-white">عدد النسخ المطلوب طباعتها:</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white"
                >
                  <Minus size={14} />
                </button>

                <input
                  type="number"
                  min={1}
                  max={500}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-16 bg-black/60 border border-white/20 rounded-xl py-1.5 text-center text-amber-300 font-mono font-bold text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white"
                >
                  <Plus size={14} />
                </button>

                <div className="flex items-center gap-1 mr-2 border-r border-white/10 pr-2">
                  {[1, 5, 10, 25].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`text-[11px] font-mono font-bold px-2 py-1 rounded-lg border transition-all ${
                        quantity === q
                          ? "bg-amber-500 text-black border-amber-500"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Dynamic Editable Fields */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-white/70 block">
                تعديل نصوص الاستيكر مباشرة:
              </span>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-white/50 block mb-1">اسم البراند / المحل:</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/50 block mb-1">الوصف المختصر:</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-white/50 block mb-1">اسم الموديل / الصنف:</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-white/50 block mb-1">المقاس:</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/50 block mb-1">اللون:</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/50 block mb-1">السعر:</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl p-2 text-amber-300 font-mono font-bold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-white/50 block mb-1">كود الباركود الرقمي:</label>
                <input
                  type="text"
                  value={barcodeText}
                  onChange={(e) => setBarcodeText(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-2 text-white font-mono font-bold outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* 4. Live Toggles */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-white/60 block mb-1">
                تخصيص العناصر المرئية في الاستيكر:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-white/80 select-none">
                  <input
                    type="checkbox"
                    checked={showStoreName}
                    onChange={(e) => setShowStoreName(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>اسم البراند</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white/80 select-none">
                  <input
                    type="checkbox"
                    checked={showSubtitle}
                    onChange={(e) => setShowSubtitle(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>الوصف الفرعي</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white/80 select-none">
                  <input
                    type="checkbox"
                    checked={showProductName}
                    onChange={(e) => setShowProductName(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>اسم القطعة</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white/80 select-none">
                  <input
                    type="checkbox"
                    checked={showBadges}
                    onChange={(e) => setShowBadges(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>اللون والمقاس</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white/80 select-none">
                  <input
                    type="checkbox"
                    checked={showBarcodeText}
                    onChange={(e) => setShowBarcodeText(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>أرقام الباركود</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white/80 select-none">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>السعر</span>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT: DYNAMIC LIVE PREVIEW (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5">
            <div className="w-full">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-amber-400" />
                  <span className="text-xs font-bold text-white">المعاينة الحية الفورية</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {sizePreset === "50x25"
                    ? "50 × 25 مم"
                    : sizePreset === "2-up"
                    ? "2 × (38×25 مم)"
                    : "38 × 25 مم"}
                </span>
              </div>

              {/* Realistic Thermal Label Preview Box */}
              <div className="bg-[#242430] p-4 rounded-2xl flex flex-col items-center justify-center min-h-[220px] shadow-inner relative overflow-hidden">
                {/* Background Grid Pattern representing paper roll */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

                {sizePreset === "2-up" ? (
                  /* 2-up preview container */
                  <div className="flex items-center gap-2 w-full max-w-[320px] justify-center relative z-10">
                    <div
                      className="bg-white rounded-lg shadow-xl border border-gray-300 overflow-hidden"
                      style={{
                        width: "148px",
                        height: "98px",
                      }}
                    >
                      {renderStickerContent(false)}
                    </div>
                    <div
                      className="bg-white rounded-lg shadow-xl border border-gray-300 overflow-hidden"
                      style={{
                        width: "148px",
                        height: "98px",
                      }}
                    >
                      {renderStickerContent(false)}
                    </div>
                  </div>
                ) : (
                  /* Single sticker preview */
                  <div
                    className="bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden transition-all duration-200 relative z-10"
                    style={{
                      width: sizePreset === "50x25" ? "240px" : "185px",
                      height: "120px",
                    }}
                  >
                    {renderStickerContent(false)}
                  </div>
                )}

                {/* Dimensions badge indicator */}
                <div className="mt-4 text-[10px] text-white/50 font-mono text-center relative z-10">
                  {sizePreset === "38x25" && (
                    <span>📏 العرض: 38 مم | الارتفاع: 25 مم (معتمد للرول 40×25 مم)</span>
                  )}
                  {sizePreset === "50x25" && (
                    <span>📏 العرض: 50 مم | الارتفاع: 25 مم (مساحة تفاصيل أكبر)</span>
                  )}
                  {sizePreset === "2-up" && (
                    <span>📏 العرض الإجمالي: 80 مم (استيكرين 38×25 مم بجوار بعض)</span>
                  )}
                </div>
              </div>

              {/* Printing Tips Reminder */}
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
                <span className="font-bold block mb-0.5">💡 تعليمات الطباعة على طابعات Xprinter:</span>
                في نافذة الطباعة المنبثقة، تأكد من ضبط الهوامش (Margins) على <strong>None</strong>،
                وحجم الورق على المقاس المختار، ولن يتم سحب أي استيكر فارغ نهائياً.
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="w-full flex gap-2 pt-4 border-t border-white/10 mt-4">
              <button
                onClick={handlePrint}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-xs"
              >
                <Printer size={16} />
                طباعة الآن ({quantity} {quantity > 1 ? "نسخ" : "نسخة"})
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all"
                >
                  إلغاء
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── HIDDEN PRINT-ONLY TARGET CONTAINER ── */}
      <div id="printable-barcode-tag-area" className="no-screen">
        {sizePreset === "2-up" ? (
          // 2-up rows
          Array.from({ length: Math.ceil(quantity / 2) }).map((_, rowIdx) => (
            <div key={rowIdx} className="sticker-print-page-2up">
              <div className="sticker-print-col">{renderStickerContent(true)}</div>
              <div className="sticker-print-col">
                {rowIdx * 2 + 1 < quantity ? renderStickerContent(true) : <div />}
              </div>
            </div>
          ))
        ) : (
          // Single sticker pages
          Array.from({ length: quantity }).map((_, idx) => (
            <div key={idx} className="sticker-print-page-single">
              {renderStickerContent(true)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
