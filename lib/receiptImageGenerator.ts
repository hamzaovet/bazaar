/**
 * BAZAAR Casual Wear - High Resolution Receipt Image Generator
 * Generates a crisp, branded receipt image (PNG) for WhatsApp sharing and offline saving.
 */

export interface ReceiptData {
  invoiceNumber: string;
  createdAt: string;
  branch?: {
    name?: string;
    address?: string;
    phone?: string;
  };
  cashierUser?: {
    name?: string;
  };
  customer?: {
    name?: string;
    phone?: string;
    points?: number;
  };
  customerName?: string;
  customerPhone?: string;
  lines: Array<{
    productName?: string;
    variant?: {
      product?: { nameAr?: string };
      color?: string;
      size?: string;
      barcode?: string;
    };
    color?: string;
    size?: string;
    unitPrice: number;
    quantity: number;
    subtotal?: number;
  }>;
  subtotal: number;
  discountAmount?: number;
  netTotal: number;
  paymentMethod?: string;
}

export async function generateReceiptImageBlob(invoice: ReceiptData, customPolicy?: string): Promise<{ blob: Blob; dataUrl: string }> {
  const width = 600; // High resolution width
  const pad = 30;

  // Calculate dynamic height based on lines count
  const baseHeight = 580;
  const itemRowHeight = 42;
  const itemsHeight = invoice.lines.length * itemRowHeight;
  const totalHeight = baseHeight + itemsHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = totalHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not initialize Canvas 2D context");
  }

  // Set RTL direction
  ctx.direction = "rtl";

  // 1. Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, totalHeight);

  // 2. Top Header Bar (Gold / Dark Theme)
  const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
  headerGrad.addColorStop(0, "#0c0c14");
  headerGrad.addColorStop(0.5, "#1b1811");
  headerGrad.addColorStop(1, "#0c0c14");
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, width, 120);

  // Gold accent line under header
  ctx.fillStyle = "#ffb703";
  ctx.fillRect(0, 117, width, 3);

  // Brand Name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px 'Cairo', 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BAZAAR", width / 2, 50);

  ctx.fillStyle = "#ffb703";
  ctx.font = "bold 16px 'Cairo', 'Segoe UI', Arial, sans-serif";
  ctx.fillText("بزار كاجوال وير • ملابس شبابية وكاجوال راقية", width / 2, 80);

  ctx.fillStyle = "#999999";
  ctx.font = "12px 'Cairo', 'Segoe UI', Arial, sans-serif";
  ctx.fillText("فاتورة مبيعات ضريبية مبسطة (Sales Receipt)", width / 2, 102);

  let curY = 145;

  // 3. Branch & Invoice Meta Box
  ctx.fillStyle = "#f8f9fa";
  ctx.fillRect(pad, curY, width - pad * 2, 95);
  ctx.strokeStyle = "#e9ecef";
  ctx.strokeRect(pad, curY, width - pad * 2, 95);

  ctx.fillStyle = "#111111";
  ctx.font = "bold 13px 'Cairo', 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "right";

  const branchName = invoice.branch?.name || "فرع عباس العقاد الرئيسي";
  const branchPhone = invoice.branch?.phone || "01008038041";
  const branchAddr = invoice.branch?.address || "عباس العقاد، مدينة نصر، القاهرة";

  ctx.fillText(`الفرع: ${branchName}`, width - pad - 15, curY + 24);
  ctx.font = "11px 'Cairo', 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#555555";
  ctx.fillText(`العنوان: ${branchAddr}`, width - pad - 15, curY + 45);
  ctx.fillText(`خدمة العملاء والشكاوى: ${branchPhone}`, width - pad - 15, curY + 66);

  // Left Meta Info (Invoice No & Date)
  ctx.textAlign = "left";
  ctx.font = "bold 13px 'Cairo', 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#d90429";
  ctx.fillText(`رقم الفاتورة: ${invoice.invoiceNumber}`, pad + 15, curY + 24);

  const dateObj = new Date(invoice.createdAt || Date.now());
  const dateStr = dateObj.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
  const timeStr = dateObj.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });

  ctx.font = "11px 'Cairo', 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#555555";
  ctx.fillText(`التاريخ: ${dateStr}`, pad + 15, curY + 45);
  ctx.fillText(`الوقت: ${timeStr}`, pad + 15, curY + 66);

  curY += 115;

  // 4. Customer Info Bar
  const custName = invoice.customer?.name || invoice.customerName || "عميل كاشير مباشر";
  const custPhone = invoice.customer?.phone || invoice.customerPhone || "";
  const cashierName = invoice.cashierUser?.name || "كاشير الصالة";

  ctx.fillStyle = "#fff8e7";
  ctx.fillRect(pad, curY, width - pad * 2, 36);
  ctx.strokeStyle = "#ffe5a0";
  ctx.strokeRect(pad, curY, width - pad * 2, 36);

  ctx.textAlign = "right";
  ctx.fillStyle = "#333333";
  ctx.font = "12px 'Cairo', 'Segoe UI', Arial, sans-serif";
  ctx.fillText(`العميل: ${custName} ${custPhone ? `(${custPhone})` : ""}`, width - pad - 15, curY + 23);

  ctx.textAlign = "left";
  ctx.fillText(`الكاشير: ${cashierName}`, pad + 15, curY + 23);

  curY += 50;

  // 5. Items Table Header
  ctx.fillStyle = "#212529";
  ctx.fillRect(pad, curY, width - pad * 2, 34);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px 'Cairo', 'Segoe UI', Arial, sans-serif";

  // Columns layout: [المنتج 45%] [الكمية 15%] [السعر 20%] [الإجمالي 20%]
  ctx.textAlign = "right";
  ctx.fillText("الصنف / الموديل", width - pad - 15, curY + 22);

  ctx.textAlign = "center";
  ctx.fillText("الكمية", pad + 190, curY + 22);
  ctx.fillText("السعر", pad + 115, curY + 22);

  ctx.textAlign = "left";
  ctx.fillText("الإجمالي", pad + 15, curY + 22);

  curY += 34;

  // 6. Item Lines
  invoice.lines.forEach((line, idx) => {
    // Alternating zebra stripe
    if (idx % 2 === 1) {
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(pad, curY, width - pad * 2, itemRowHeight);
    }

    // Border line bottom
    ctx.strokeStyle = "#eeeeee";
    ctx.beginPath();
    ctx.moveTo(pad, curY + itemRowHeight);
    ctx.lineTo(width - pad, curY + itemRowHeight);
    ctx.stroke();

    const name = line.productName || line.variant?.product?.nameAr || "قطعة كاجوال";
    const variantDesc = [line.color || line.variant?.color, line.size || line.variant?.size].filter(Boolean).join(" • ");

    // Product Title
    ctx.textAlign = "right";
    ctx.fillStyle = "#111111";
    ctx.font = "bold 12px 'Cairo', 'Segoe UI', Arial, sans-serif";
    ctx.fillText(name.slice(0, 32), width - pad - 15, curY + 18);

    // Color/Size subtitle
    if (variantDesc) {
      ctx.fillStyle = "#777777";
      ctx.font = "10px 'Cairo', 'Segoe UI', Arial, sans-serif";
      ctx.fillText(variantDesc, width - pad - 15, curY + 34);
    }

    // Qty
    ctx.textAlign = "center";
    ctx.fillStyle = "#111111";
    ctx.font = "bold 13px 'Cairo', Arial, sans-serif";
    ctx.fillText(`${line.quantity}`, pad + 190, curY + 24);

    // Unit Price
    ctx.fillStyle = "#444444";
    ctx.font = "12px 'Cairo', Arial, sans-serif";
    ctx.fillText(`${line.unitPrice} ج`, pad + 115, curY + 24);

    // Line Total
    const lineTotal = (line.quantity * line.unitPrice).toFixed(0);
    ctx.textAlign = "left";
    ctx.fillStyle = "#111111";
    ctx.font = "bold 13px 'Cairo', Arial, sans-serif";
    ctx.fillText(`${lineTotal} ج.م`, pad + 15, curY + 24);

    curY += itemRowHeight;
  });

  curY += 15;

  // 7. Totals Summary Box
  const summaryBoxH = invoice.discountAmount ? 120 : 95;
  ctx.fillStyle = "#f8f9fa";
  ctx.fillRect(pad, curY, width - pad * 2, summaryBoxH);
  ctx.strokeStyle = "#dee2e6";
  ctx.strokeRect(pad, curY, width - pad * 2, summaryBoxH);

  let sumY = curY + 26;

  // Subtotal
  ctx.textAlign = "right";
  ctx.fillStyle = "#555555";
  ctx.font = "13px 'Cairo', 'Segoe UI', Arial, sans-serif";
  ctx.fillText("المجموع الفرعي:", width - pad - 20, sumY);
  ctx.textAlign = "left";
  ctx.fillText(`${invoice.subtotal} ج.م`, pad + 20, sumY);

  // Discount (if any)
  if (invoice.discountAmount && invoice.discountAmount > 0) {
    sumY += 26;
    ctx.textAlign = "right";
    ctx.fillStyle = "#d90429";
    ctx.fillText("الخصم المباشر:", width - pad - 20, sumY);
    ctx.textAlign = "left";
    ctx.fillText(`-${invoice.discountAmount} ج.م`, pad + 20, sumY);
  }

  sumY += 28;
  // Net Total (Highlighted)
  ctx.strokeStyle = "#ffb703";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pad + 15, sumY - 14);
  ctx.lineTo(width - pad - 15, sumY - 14);
  ctx.stroke();

  ctx.textAlign = "right";
  ctx.fillStyle = "#0c0c14";
  ctx.font = "bold 17px 'Cairo', 'Segoe UI', Arial, sans-serif";
  ctx.fillText("الصافي المطلوب:", width - pad - 20, sumY + 8);

  ctx.textAlign = "left";
  ctx.fillStyle = "#d90429";
  ctx.font = "bold 20px 'Cairo', Arial, sans-serif";
  ctx.fillText(`${invoice.netTotal} ج.م`, pad + 20, sumY + 8);

  curY += summaryBoxH + 20;

  // 8. Payment Method & Policy Footer
  const pMethodNames: Record<string, string> = {
    cash: "نقداً (كاش)",
    visa: "فيزا / بطاقة بنكية",
    instapay: "إنستاباي (InstaPay)",
    vodafone_cash: "فودافون كاش",
    split: "دفع مجزأ",
  };
  const pMethodStr = pMethodNames[invoice.paymentMethod || "cash"] || "نقداً (كاش)";

  ctx.textAlign = "center";
  ctx.fillStyle = "#333333";
  ctx.font = "bold 12px 'Cairo', 'Segoe UI', Arial, sans-serif";
  ctx.fillText(`طريقة الدفع: ${pMethodStr} ✅`, width / 2, curY);

  curY += 25;

  const policyText = customPolicy || "سياسة الاستبدال والاسترجاع: 14 يوماً بأصل الفاتورة والقطعة بحالتها والتيكت الأصلي.";
  ctx.fillStyle = "#666666";
  ctx.font = "11px 'Cairo', 'Segoe UI', Arial, sans-serif";
  ctx.fillText(policyText, width / 2, curY);

  curY += 22;
  ctx.fillStyle = "#ffb703";
  ctx.font = "bold 12px 'Cairo', 'Segoe UI', Arial, sans-serif";
  ctx.fillText("سعدنا بزيارتكم • بزار كاجوال وير • خيارك الأول للأناقة", width / 2, curY);

  // Return Blob and Data URL
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create image blob from canvas"));
          return;
        }
        const dataUrl = canvas.toDataURL("image/png");
        resolve({ blob, dataUrl });
      },
      "image/png",
      0.95
    );
  });
}
