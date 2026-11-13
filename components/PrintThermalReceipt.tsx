"use client";

import React, { useState } from "react";
import { Printer, X, Sliders, Check, RotateCcw, Eye, FileText } from "lucide-react";

interface ReceiptProps {
  invoice: any;
  onClose?: () => void;
}

export default function PrintThermalReceipt({ invoice, onClose }: ReceiptProps) {
  // Standard Thermal Receipt width: 80mm Continuous (72mm actual printable area)
  const [paperWidth, setPaperWidth] = useState<"80mm" | "58mm">("80mm");

  // Dynamic Toggles & Editable Customizations
  const [showStoreHeader, setShowStoreHeader] = useState<boolean>(true);
  const [showBranchInfo, setShowBranchInfo] = useState<boolean>(true);
  const [showCashier, setShowCashier] = useState<boolean>(true);
  const [showCustomer, setShowCustomer] = useState<boolean>(true);
  const [showPoints, setShowPoints] = useState<boolean>(true);
  const [showPolicy, setShowPolicy] = useState<boolean>(true);
  const [customFooter, setCustomFooter] = useState<string>(
    "سياسة الاستبدال والاسترجاع: 14 يوماً بأصل الفاتورة والتيكت بحالته الأصلية"
  );

  const handlePrint = () => {
    window.print();
  };

  const branch = invoice.branch || {};
  const customer = invoice.customer || {};
  const lines = invoice.lines || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 overflow-y-auto">
      {/* ── Dynamic Embedded Print CSS for Continuous 80mm / 72mm Printable Area ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @page {
          size: ${paperWidth === "80mm" ? "80mm auto" : "58mm auto"};
          margin: 0 !important;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: hidden !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-receipt,
          #printable-receipt * {
            visibility: visible !important;
          }
          #printable-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${paperWidth === "80mm" ? "72mm" : "52mm"} !important;
            max-width: ${paperWidth === "80mm" ? "72mm" : "52mm"} !important;
            margin: 0 auto !important;
            padding: 1.5mm 2.5mm !important;
            box-shadow: none !important;
            border: none !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            font-size: ${paperWidth === "80mm" ? "11px" : "9.5px"} !important;
            line-height: 1.25 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
        }
      `,
        }}
      />

      <div className="bg-[#121218] border border-amber-500/40 rounded-3xl w-full max-w-3xl shadow-2xl text-white my-auto flex flex-col overflow-hidden max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  معاينة وطباعة فاتورة الريسيت الحرارية
                </h3>
                <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  ورق متصل Continuous
                </span>
              </div>
              <p className="text-xs text-white/50">
                عرض قياسي 80 مم (عرض طباعة فعلي آمن 72 مم) مع هوامش جانبية تمنع سقوط النص
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Body: Controls & Live Receipt Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: CONTROLS & TOGGLES (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Paper format selector */}
            <div>
              <label className="text-xs font-bold text-white/70 block mb-2">
                مقاس رول ورق الريسيت (Continuous Roll):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaperWidth("80mm")}
                  className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    paperWidth === "80mm"
                      ? "bg-amber-500/20 border-amber-500 text-white"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-black text-xs text-amber-300">80 مم (القياسي)</span>
                    {paperWidth === "80mm" && <Check size={14} className="text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-white/60 mt-0.5">
                    الفعلي 72 مم (الأكثر انتشاراً في الكاشير)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaperWidth("58mm")}
                  className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    paperWidth === "58mm"
                      ? "bg-amber-500/20 border-amber-500 text-white"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-black text-xs text-amber-300">58 مم</span>
                    {paperWidth === "58mm" && <Check size={14} className="text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-white/60 mt-0.5">
                    طابعات بلوتوث / ماكينات الدفع الصغيرة
                  </span>
                </button>
              </div>
            </div>

            {/* Live Toggles */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-white/60 block mb-1">
                تخصيص محتويات الفاتورة:
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-white/80 select-none">
                <input
                  type="checkbox"
                  checked={showStoreHeader}
                  onChange={(e) => setShowStoreHeader(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span>ترويسة البراند والشعار (BAZAAR)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white/80 select-none">
                <input
                  type="checkbox"
                  checked={showBranchInfo}
                  onChange={(e) => setShowBranchInfo(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span>بيانات الفرع والعنوان ورقم خدمة العملاء</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white/80 select-none">
                <input
                  type="checkbox"
                  checked={showCashier}
                  onChange={(e) => setShowCashier(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span>اسم الكاشير / البائع المسؤول</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white/80 select-none">
                <input
                  type="checkbox"
                  checked={showCustomer}
                  onChange={(e) => setShowCustomer(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span>بيانات العميل (الاسم ورقم الموبايل)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white/80 select-none">
                <input
                  type="checkbox"
                  checked={showPoints}
                  onChange={(e) => setShowPoints(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span>نقاط الولاء المكتسبة في الفاتورة</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white/80 select-none">
                <input
                  type="checkbox"
                  checked={showPolicy}
                  onChange={(e) => setShowPolicy(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span>سياسة الاستبدال والاسترجاع</span>
              </label>
            </div>

            {/* Custom Footer Input */}
            <div>
              <label className="text-[11px] text-white/60 block mb-1">
                تعديل نص سياسة الاستبدال أو رسالة الختام:
              </label>
              <textarea
                value={customFooter}
                onChange={(e) => setCustomFooter(e.target.value)}
                rows={3}
                className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white text-xs outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          {/* RIGHT: REALISTIC LIVE THERMAL RECEIPT PREVIEW (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-between bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5">
            <div className="w-full">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-amber-400" />
                  <span className="text-xs font-bold text-white">معاينة الفاتورة قبل الطباعة</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {paperWidth} (Printable: {paperWidth === "80mm" ? "72mm" : "52mm"})
                </span>
              </div>

              {/* Realistic Thermal Receipt Paper Box */}
              <div className="bg-[#242430] p-4 rounded-2xl flex flex-col items-center justify-center shadow-inner relative max-h-[500px] overflow-y-auto">
                <div
                  id="printable-receipt"
                  className={`bg-white text-black p-4 rounded-xl shadow-2xl font-mono text-[11px] mx-auto border border-gray-300 leading-relaxed transition-all duration-200 ${
                    paperWidth === "80mm" ? "w-[320px]" : "w-[250px]"
                  }`}
                  dir="rtl"
                >
                  {/* Header */}
                  {showStoreHeader && (
                    <div className="text-center pb-2 border-b border-dashed border-gray-400">
                      <h2 className="text-base font-black tracking-wider uppercase font-sans">
                        BAZAAR CASUAL WEAR
                      </h2>
                      <p className="text-[11px] font-bold font-sans">بزار كاجوال وير • ملابس شبابي عصرية</p>
                    </div>
                  )}

                  {showBranchInfo && (
                    <div className="text-center py-1.5 border-b border-dashed border-gray-300 text-[10px]">
                      <p className="font-bold text-gray-800">{branch.name || "فرع عباس العقاد الرئيسي"}</p>
                      <p className="text-[9px] text-gray-600">{branch.address || "مدينة نصر - القاهرة"}</p>
                      <p className="text-[9.5px] font-bold text-gray-800">
                        خدمة العملاء: {branch.phone || "01008038041"}
                      </p>
                    </div>
                  )}

                  {/* Invoice Meta */}
                  <div className="py-2 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
                    <div className="flex justify-between">
                      <span>رقم الفاتورة:</span>
                      <span className="font-bold font-mono">{invoice.invoiceNumber || "INV-2026-0001"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>التاريخ والوقت:</span>
                      <span>{new Date(invoice.createdAt || Date.now()).toLocaleString("ar-EG")}</span>
                    </div>
                    {showCashier && (invoice.user?.name || invoice.userName) && (
                      <div className="flex justify-between">
                        <span>الكاشير:</span>
                        <span className="font-bold">{invoice.user?.name || invoice.userName}</span>
                      </div>
                    )}
                    {showCustomer && customer.name && (
                      <div className="flex justify-between border-t border-dotted border-gray-300 pt-0.5">
                        <span>العميل:</span>
                        <span className="font-bold">
                          {customer.name} {customer.phone ? `(${customer.phone})` : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Items Table */}
                  <div className="py-2 border-b border-dashed border-gray-400">
                    <table className="w-full text-right text-[11px]">
                      <thead>
                        <tr className="border-b border-gray-400 font-black text-[10px]">
                          <th className="py-1">الصنف والمقاس</th>
                          <th className="text-center py-1">العدد</th>
                          <th className="text-left py-1">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dotted divide-gray-200">
                        {lines.map((line: any, idx: number) => {
                          const pName =
                            line.variant?.product?.nameAr ||
                            line.productName ||
                            line.name ||
                            "قطعة كاجوال";
                          const color = line.variant?.color || line.color || "";
                          const size = line.variant?.size || line.size || "";
                          return (
                            <tr key={idx} className="py-1">
                              <td className="py-1 pr-1 font-semibold leading-tight font-sans">
                                <div>{pName}</div>
                                <div className="text-[9px] text-gray-600 font-normal font-mono">
                                  {color} {size ? `• مقاس ${size}` : ""} • {line.unitPrice} ج
                                </div>
                              </td>
                              <td className="text-center font-bold py-1 font-mono">{line.quantity}</td>
                              <td className="text-left font-black py-1 font-mono">{line.subtotal} ج</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="py-2 space-y-1 text-[11px] border-b border-dashed border-gray-400">
                    <div className="flex justify-between font-mono">
                      <span>المجموع الفرعي:</span>
                      <span>{invoice.subtotal} ج.م</span>
                    </div>
                    {invoice.discountAmount > 0 && (
                      <div className="flex justify-between text-red-600 font-bold font-mono">
                        <span>الخصم المباشر:</span>
                        <span>-{invoice.discountAmount} ج.م</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black border-t border-dotted border-gray-400 pt-1 font-mono">
                      <span>الصافي المطلوب:</span>
                      <span className="text-base font-black">{invoice.netTotal} ج.م</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-700 pt-0.5">
                      <span>طريقة الدفع:</span>
                      <span className="font-bold">
                        {invoice.paymentMethod === "cash" && "نقداً (كاش)"}
                        {invoice.paymentMethod === "visa" && "فيزا / بطاقة بنكية"}
                        {invoice.paymentMethod === "instapay" && "إنستاباي (InstaPay)"}
                        {invoice.paymentMethod === "vodafone_cash" && "فودافون كاش"}
                        {invoice.paymentMethod === "split" && "دفع مقسم"}
                        {!invoice.paymentMethod && "نقداً (كاش)"}
                      </span>
                    </div>
                  </div>

                  {/* Customer CRM Loyalty Points */}
                  {showPoints && (
                    <div className="py-1.5 text-center bg-gray-100 rounded my-1 text-[10px]">
                      <span>
                        نقاط الولاء المكتسبة:{" "}
                        <strong>+{Math.floor(invoice.netTotal / 20)} نقطة 🌟</strong>
                      </span>
                      {customer.points > 0 && (
                        <span className="block text-[9px] text-gray-600 font-mono">
                          إجمالي رصيد نقاطك: {customer.points} نقطة
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer Policy */}
                  {showPolicy && customFooter && (
                    <div className="text-center pt-2 text-[9px] text-gray-600 space-y-1 font-sans">
                      <p className="font-bold text-gray-800 leading-tight">{customFooter}</p>
                      <div className="font-mono text-[8px] text-gray-400 pt-1">
                        *** سعدنا بخدمتكم • زورونا مرة أخرى ***
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Print Button */}
            <div className="w-full flex gap-2 pt-4 border-t border-white/10 mt-4">
              <button
                onClick={handlePrint}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-xs"
              >
                <Printer size={16} />
                طباعة الفاتورة الحرارية الآن
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all"
                >
                  إغلاق
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
