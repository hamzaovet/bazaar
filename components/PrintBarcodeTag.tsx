"use client";

import React from "react";
import { generateCode128Svg } from "@/lib/barcode";
import { Printer, X } from "lucide-react";

interface BarcodeTagProps {
  item: {
    productName: string;
    size: string;
    color: string;
    barcode: string;
    price: number;
    sku?: string;
  };
  quantity?: number;
  onClose?: () => void;
}

export default function PrintBarcodeTag({ item, quantity = 1, onClose }: BarcodeTagProps) {
  const barcodeSvg = generateCode128Svg(item.barcode, 36);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#121218] border border-amber-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">🏷️</span>
            <div>
              <h3 className="font-bold text-lg">طباعة تكت وباركود الملابس</h3>
              <p className="text-xs text-white/50">مقاس قياسي 50 × 25 مم أو تيكت الملابس</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Thermal Sticker Preview Box */}
        <div className="bg-white text-black p-4 rounded-xl shadow-inner mb-6 mx-auto w-[280px] border border-gray-300">
          <div className="text-center border-b border-dashed border-gray-400 pb-1 mb-2">
            <h4 className="text-[13px] font-black tracking-wider uppercase">BAZAAR CASUAL WEAR</h4>
            <p className="text-[9px] text-gray-600 font-bold">بزار كاجوال وير • ملابس شبابي</p>
          </div>

          <div className="text-right text-[11px] font-bold leading-snug mb-1">
            <span className="line-clamp-1">{item.productName}</span>
          </div>

          <div className="flex justify-between items-center text-[10px] bg-gray-100 px-2 py-0.5 rounded font-mono mb-2">
            <span>اللون: <strong>{item.color}</strong></span>
            <span className="bg-black text-white px-1.5 py-0.2 rounded font-bold">المقاس: {item.size}</span>
          </div>

          <div
            className="my-1 flex justify-center overflow-hidden"
            dangerouslySetInnerHTML={{ __html: barcodeSvg }}
          />

          <div className="text-center font-mono text-[10px] tracking-widest text-gray-800 font-bold mb-1">
            {item.barcode}
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-dashed border-gray-400 text-[11px] font-black">
            <span>السعر:</span>
            <span className="text-sm font-black">{item.price} ج.م</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Printer size={18} />
            طباعة الاستيكر الآن ({quantity} نسخة)
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/15 text-white font-medium py-3 px-4 rounded-xl transition-all"
            >
              إلغاء
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
