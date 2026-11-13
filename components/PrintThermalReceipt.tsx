"use client";

import React, { useState } from "react";
import { Printer, X, Download } from "lucide-react";

interface ReceiptProps {
  invoice: any;
  onClose?: () => void;
}

export default function PrintThermalReceipt({ invoice, onClose }: ReceiptProps) {
  const [paperWidth, setPaperWidth] = useState<"80mm" | "58mm">("80mm");

  const handlePrint = () => {
    window.print();
  };

  const branch = invoice.branch || {};
  const customer = invoice.customer || {};
  const lines = invoice.lines || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#121218] border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white my-8">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl text-xl">🧾</span>
            <div>
              <h3 className="font-bold text-lg">فاتورة مبيعات بزار كاجوال وير</h3>
              <p className="text-xs text-white/50">جاهزة للطباعة الحرارية المباشرة (80mm / 58mm)</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Paper format selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPaperWidth("80mm")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              paperWidth === "80mm"
                ? "bg-amber-500 text-black border-amber-500"
                : "bg-white/5 text-white/70 border-white/10"
            }`}
          >
            ورق عريض (80 مم)
          </button>
          <button
            onClick={() => setPaperWidth("58mm")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              paperWidth === "58mm"
                ? "bg-amber-500 text-black border-amber-500"
                : "bg-white/5 text-white/70 border-white/10"
            }`}
          >
            ورق قياسي (58 مم)
          </button>
        </div>

        {/* Printable Thermal Receipt Box */}
        <div
          id="printable-receipt"
          className={`bg-white text-black p-4 rounded-xl shadow-inner font-mono text-[12px] mx-auto border border-gray-300 leading-relaxed ${
            paperWidth === "80mm" ? "w-[340px]" : "w-[260px]"
          }`}
        >
          {/* Header */}
          <div className="text-center pb-2 border-b border-dashed border-gray-400">
            <h2 className="text-base font-black tracking-wider uppercase">BAZAAR CASUAL WEAR</h2>
            <p className="text-[11px] font-bold">بزار كاجوال وير • ملابس شبابي عصرية</p>
            <p className="text-[10px] text-gray-700 font-semibold">{branch.name || "فرع عباس العقاد"}</p>
            <p className="text-[9px] text-gray-600">{branch.address || "مدينة نصر - القاهرة"}</p>
            <p className="text-[10px] font-bold text-gray-800">خدمة العملاء: {branch.phone || "01008038041"}</p>
          </div>

          {/* Invoice Meta */}
          <div className="py-2 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span>رقم الفاتورة:</span>
              <span className="font-bold">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>التاريخ والوقت:</span>
              <span>{new Date(invoice.createdAt || Date.now()).toLocaleString("ar-EG")}</span>
            </div>
            {invoice.user && (
              <div className="flex justify-between">
                <span>الكاشير:</span>
                <span className="font-bold">{invoice.user.name}</span>
              </div>
            )}
            {customer.name && (
              <div className="flex justify-between border-t border-dotted border-gray-300 pt-0.5">
                <span>العميل:</span>
                <span className="font-bold">{customer.name} ({customer.phone})</span>
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
                  const pName = line.variant?.product?.nameAr || line.productName || "قطعة كاجوال";
                  const color = line.variant?.color || line.color || "";
                  const size = line.variant?.size || line.size || "";
                  return (
                    <tr key={idx} className="py-1">
                      <td className="py-1 pr-1 font-semibold leading-tight">
                        <div>{pName}</div>
                        <div className="text-[9px] text-gray-600 font-normal">
                          {color} {size ? `• مقاس ${size}` : ""} • {line.unitPrice} ج
                        </div>
                      </td>
                      <td className="text-center font-bold py-1">{line.quantity}</td>
                      <td className="text-left font-black py-1">{line.subtotal} ج</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="py-2 space-y-1 text-[11px] border-b border-dashed border-gray-400">
            <div className="flex justify-between">
              <span>المجموع الفرعي:</span>
              <span>{invoice.subtotal} ج.م</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-red-600 font-bold">
                <span>الخصم المباشر:</span>
                <span>-{invoice.discountAmount} ج.م</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black border-t border-dotted border-gray-400 pt-1">
              <span>الصافي المطلوب:</span>
              <span className="text-base">{invoice.netTotal} ج.م</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-700 pt-0.5">
              <span>طريقة الدفع:</span>
              <span className="font-bold">
                {invoice.paymentMethod === "cash" && "نقداً (كاش)"}
                {invoice.paymentMethod === "visa" && "فيزا / بطاقة بنكية"}
                {invoice.paymentMethod === "instapay" && "إنستاباي (InstaPay)"}
                {invoice.paymentMethod === "vodafone_cash" && "فودافون كاش"}
                {invoice.paymentMethod === "split" && "دفع مقسم"}
              </span>
            </div>
          </div>

          {/* Customer CRM Loyalty Points */}
          {customer.points !== undefined && (
            <div className="py-1.5 text-center bg-gray-100 rounded my-1 text-[10px]">
              <span>نقاط الولاء المكتسبة: <strong>+{Math.floor(invoice.netTotal / 20)} نقطة</strong></span>
              {customer.points > 0 && (
                <span className="block text-[9px] text-gray-600">إجمالي رصيد نقاطك: {customer.points} نقطة</span>
              )}
            </div>
          )}

          {/* Footer Policy & QR */}
          <div className="text-center pt-2 text-[9px] text-gray-600 space-y-1">
            <p className="font-bold text-gray-800">
              سياسة الاستبدال والاسترجاع: 14 يوماً بأصل الفاتورة والتيكت بحالته الأصلية
            </p>
            <p className="text-[8px]">
              تابعنا على السوشيال ميديا أو حمل تطبيق بزار كاجوال وير
            </p>
            <div className="font-mono text-[8px] text-gray-400 pt-1">
              *** سعدنا بخدمتكم • زورونا مرة أخرى ***
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Printer size={18} />
            طباعة الفاتورة الحرارية
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/15 text-white font-medium py-3 px-4 rounded-xl transition-all"
            >
              إغلاق
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
