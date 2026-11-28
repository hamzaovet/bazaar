"use client";

import React, { useState } from "react";
import {
  X,
  CreditCard,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Upload,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/components/Toast";

interface BookingItem {
  variantId?: string;
  name: string;
  color: string;
  size: string;
  price: number;
  image?: string;
}

interface BookingDepositModalProps {
  item: BookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  defaultDeposit?: number;
}

export default function BookingDepositModal({
  item,
  isOpen,
  onClose,
  defaultDeposit = 100,
}: BookingDepositModalProps) {
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("القاهرة");
  const [depositAmount, setDepositAmount] = useState<number>(defaultDeposit);
  const [notes, setNotes] = useState<string>("");

  // Receipt Upload
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [uploadingReceipt, setUploadingReceipt] = useState<boolean>(false);
  const [receiptPreview, setReceiptPreview] = useState<string>("");

  // Submission state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<any>(null);

  // Copy states
  const [copiedInstapay, setCopiedInstapay] = useState<boolean>(false);
  const [copiedVodafone, setCopiedVodafone] = useState<boolean>(false);

  if (!isOpen || !item) return null;

  const instapayAccount = "bazaar@instapay";
  const vodafoneCashNumber = "01008038041";
  const remainingOnDelivery = Math.max(0, item.price - depositAmount);

  const handleCopy = (text: string, type: "instapay" | "voda") => {
    navigator.clipboard.writeText(text);
    if (type === "instapay") {
      setCopiedInstapay(true);
      setTimeout(() => setCopiedInstapay(false), 2000);
    } else {
      setCopiedVodafone(true);
      setTimeout(() => setCopiedVodafone(false), 2000);
    }
    showToast("تم النسخ إلى الحافظة بنجاح!", "success");
  };

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFile(file);
    const localUrl = URL.createObjectURL(file);
    setReceiptPreview(localUrl);

    // Upload to server
    try {
      setUploadingReceipt(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setReceiptUrl(data.url);
        showToast("تم رفع صورة الإيصال بنجاح! 📸", "success");
      } else {
        showToast("فشل رفع الصورة على الخادم، سيتم إرسالها عبر واتساب", "info");
      }
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ أثناء رفع الصورة", "error");
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!customerPhone || customerPhone.length < 10) {
      showToast("يرجى إدخال رقم هاتف صحيح (موبايل واتساب)", "error");
      return;
    }
    if (!customerName || customerName.trim().length < 2) {
      showToast("يرجى إدخال اسم العميل بالكامل", "error");
      return;
    }
    if (!address || address.trim().length < 5) {
      showToast("يرجى إدخال عنوان التوصيل بالتفصيل", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customerName,
        customerPhone,
        address,
        city,
        depositAmount,
        depositReceiptUrl: receiptUrl || null,
        notes,
        items: [
          {
            variantId: item.variantId,
            name: item.name,
            color: item.color,
            size: item.size,
            unitPrice: item.price,
            quantity: 1,
          },
        ],
      };

      const res = await fetch("/api/orders/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.invoice) {
        setBookingConfirmed(data.invoice);
        showToast("🎉 تم تسجيل حجز القطعة بنجاح! وتم إشعار الإدارة للتجهيز.", "success");

        // Prepare WhatsApp message
        let phone = customerPhone.trim().replace(/\D/g, "");
        if (phone.startsWith("0")) phone = "2" + phone;

        const text = encodeURIComponent(
          `مرحباً بازار كاجوال وير (BAZAAR)! 🛍️✨\nلقد قمت بحجز قطعة جديدة عبر المتجر الإلكتروني:\n\n` +
          `• الموديل: ${item.name}\n` +
          `• اللون: ${item.color} | المقاس: ${item.size}\n` +
          `• الإجمالي: ${item.price} ج.م\n` +
          `• الديبوزيت المدفوع: ${depositAmount} ج.م\n` +
          `• المتبقي عند الاستلام: ${remainingOnDelivery} ج.م\n` +
          `• العنوان: ${city} - ${address}\n` +
          `• رقم الحجز: #${data.invoice.invoiceNumber}\n` +
          (receiptUrl ? `• إيصال التحويل: ${receiptUrl}\n` : "") +
          `\nيرجى تأكيد موعد وصول المندوب والتسليم.`
        );

        // Open WhatsApp chat to Bazaar Hotline
        window.open(`https://wa.me/201008038041?text=${text}`, "_blank");
      } else {
        showToast(data.error || "فشل تسجيل طلب الحجز", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("حدث خطأ أثناء الاتصال بالخادم", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#101018] border border-amber-500/40 rounded-3xl w-full max-w-xl shadow-2xl text-white my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl shadow">
              📦
            </div>
            <div>
              <h3 className="font-black text-white text-base">
                حجز القطعة وتوصيل فوري (ديبوزيت إنستاباي)
              </h3>
              <p className="text-xs text-white/50">
                ادفع عربون الشحن وثبّت حجز قطعتك فوراً من الفرع الرئيسي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {bookingConfirmed ? (
          /* Confirmation Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#00ff66]/20 border border-[#00ff66]/40 text-[#00ff66] flex items-center justify-center text-3xl mx-auto shadow-xl shadow-[#00ff66]/20 animate-bounce">
              ✓
            </div>
            <h4 className="text-xl font-black text-white">تم تأكيد وتثبيت الحجز بنجاح!</h4>
            <p className="text-xs text-white/70 max-w-md mx-auto leading-relaxed">
              تم تسجيل طلب الحجز برقم الفاتورة <strong className="text-amber-400 font-mono">#{bookingConfirmed.invoiceNumber}</strong>. جارٍ مراجعة التحويل وتجهيز شحنتك للتوصيل الفوري.
            </p>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-right space-y-2 max-w-md mx-auto font-mono">
              <div className="flex justify-between">
                <span className="text-white/60">القطعة المحجوزة:</span>
                <span className="text-white font-bold font-sans">{item.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">اللون والمقاس:</span>
                <span className="text-amber-400 font-sans">{item.color} | {item.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">الديبوزيت المسدد:</span>
                <span className="text-[#00ff66] font-bold">{depositAmount} ج.م</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1">
                <span className="text-white/60">المتبقي عند استلام الأوردر:</span>
                <span className="text-white font-black text-sm">{remainingOnDelivery} ج.م</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs shadow active:scale-95 transition-all"
              >
                تم والعودة للمتجر
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Item Card with Watermark */}
            <div className="flex items-center gap-4 p-3.5 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden">
              <div className="w-16 h-16 rounded-xl bg-black/60 overflow-hidden shrink-0 border border-white/10 relative">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🧥</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold text-[9px]">
                    ✨ توقيع بازار • VIP ORIGINAL
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm truncate mt-0.5">{item.name}</h4>
                <div className="text-[11px] text-white/60 mt-0.5">
                  اللون: <strong className="text-white">{item.color}</strong> | المقاس: <strong className="text-white">{item.size}</strong>
                </div>
              </div>
              <div className="text-left shrink-0">
                <div className="text-sm font-black text-[#ffb703] font-mono">{item.price} ج.م</div>
                <div className="text-[10px] text-white/50">إجمالي السعر</div>
              </div>
            </div>

            {/* Financial Math Banner */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-2xl text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-white/60 text-[10px] block">العربون / الديبوزيت المطلوب:</span>
                <span className="text-amber-400 font-black text-base">{depositAmount} ج.م</span>
              </div>
              <div className="space-y-0.5 text-left">
                <span className="text-white/60 text-[10px] block">المتبقي يد بيد عند الاستلام:</span>
                <span className="text-[#00ff66] font-black text-base">{remainingOnDelivery} ج.م</span>
              </div>
            </div>

            {/* InstaPay QR Code & Account Info */}
            <div className="p-4 bg-black/50 border border-white/10 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <QrCode size={15} />
                  <span>طريقة سداد الديبوزيت (انستاباي / فودافون كاش):</span>
                </div>
              </div>

              {/* InstaPay Address Box */}
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-sm">⚡</span>
                  <div>
                    <span className="text-[10px] text-white/50 block">حساب إنستاباي الرسمي (InstaPay):</span>
                    <span className="font-mono font-bold text-white text-xs">{instapayAccount}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(instapayAccount, "instapay")}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  {copiedInstapay ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedInstapay ? "تم النسخ" : "نسخ المعرف"}</span>
                </button>
              </div>

              {/* Vodafone Cash Box */}
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-sm">📱</span>
                  <div>
                    <span className="text-[10px] text-white/50 block">محفظة فودافون كاش (Vodafone Cash):</span>
                    <span className="font-mono font-bold text-white text-xs">{vodafoneCashNumber}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(vodafoneCashNumber, "voda")}
                  className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  {copiedVodafone ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedVodafone ? "تم النسخ" : "نسخ الرقم"}</span>
                </button>
              </div>

              {/* Receipt Upload Input */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-white/70 block mb-1.5 flex items-center justify-between">
                  <span>إرفاق سكرين شوت إيصال التحويل:</span>
                  {uploadingReceipt && <span className="text-amber-400 text-[10px]">جاري رفع الصورة...</span>}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border border-dashed border-white/20 hover:border-amber-400/50 rounded-xl p-3 text-center cursor-pointer bg-white/5 hover:bg-white/10 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 text-xs text-white/70">
                      <Upload size={14} className="text-amber-400" />
                      <span>{receiptFile ? receiptFile.name : "اضغط لاختيار صورة الإيصال"}</span>
                    </div>
                  </label>
                  {receiptPreview && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#00ff66] shrink-0">
                      <img src={receiptPreview} alt="Receipt" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Details Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">اسم العميل بالكامل:</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="الاسم ثلاثي"
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-white/70 block mb-1">رقم الموبايل (واتساب):</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/70 block mb-1">المحافظة / المدينة:</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-white outline-none"
                  >
                    <option value="القاهرة">القاهرة</option>
                    <option value="الجيزة">الجيزة</option>
                    <option value="الإسكندرية">الإسكندرية</option>
                    <option value="القليوبية">القليوبية</option>
                    <option value="الشرقية">الشرقية</option>
                    <option value="الدقهلية">الدقهلية</option>
                    <option value="الغربية">الغربية</option>
                    <option value="محافظة أخرى">محافظة أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">عنوان التوصيل بالتفصيل:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="المنطقة - الشارع - رقم العقار - علامة مميزة"
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Confirm Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={submitting || uploadingReceipt}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Truck size={16} />
                <span>
                  {submitting ? "جاري تسجيل الحجز..." : "تأكيد الحجز وتحويل الديبوزيت 🚀"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
