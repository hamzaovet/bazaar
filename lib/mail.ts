import nodemailer from "nodemailer";

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(toEmail: string, code: string, customerName = "عميل بزار كاجوال") {
  try {
    const user = process.env.EMAIL_USER || "hamzaovet@gmail.com";
    const pass = process.env.EMAIL_PASS || "goyl rmse icox vrdh";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"بزار كاجوال وير 👑" <${user}>`,
      to: toEmail,
      subject: `كود تفعيل حسابك في بزار كاجوال وير: ${code}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #0a0a0f; color: #f8f9fa; padding: 35px 20px; border-radius: 20px; border: 2px solid #f59e0b; max-width: 520px; margin: 0 auto; text-align: center;">
          <div style="background: #14141d; padding: 15px; border-radius: 16px; display: inline-block; border: 1px solid rgba(245, 158, 11, 0.3); margin-bottom: 15px;">
            <h1 style="color: #f59e0b; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 1px;">👑 بزار كاجوال وير • BAZAAR</h1>
            <p style="color: #a1a1aa; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase; font-family: monospace;">STREETWEAR LUXURY BRAND • CAIRO</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 25px; margin-top: 15px; text-align: right;">
            <p style="font-size: 15px; color: #ffffff; margin-top: 0;">أهلاً بك يا <strong>${customerName}</strong>،</p>
            <p style="font-size: 13px; color: #d4d4d8; line-height: 1.8;">
              يسعدنا انضمامك لعائلة بزار كاجوال وير. لتأكيد حسابك أو متابعة طلباتك ونقاط ولائك، استخدم رمز التفعيل السري التالي:
            </p>
            
            <div style="background: #000000; padding: 20px; border-radius: 14px; text-align: center; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #f59e0b; border: 2px dashed #f59e0b; margin: 25px 0;">
              ${code}
            </div>
            
            <p style="font-size: 11px; color: #71717a; text-align: center; margin-bottom: 0;">
              ⏱️ هذا الرمز صالح لمدة 15 دقيقة لمرة واحدة فقط لأغراض أمان الحساب.
            </p>
          </div>

          <div style="margin-top: 25px; font-size: 11px; color: #a1a1aa; border-top: 1px solid rgba(245, 158, 11, 0.2); padding-top: 15px;">
            <p style="margin: 5px 0;">📍 فرع عباس العقاد: بجوار أبو العز السوري وسنتر علم الدين</p>
            <p style="margin: 5px 0;">📍 فرع أول عباس: شارع كشري التحرير بجوار كافيه طاولة</p>
            <p style="margin: 5px 0; color: #f59e0b;">خدمة العملاء: 01008038041 • واتساب: 01008038041</p>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (err) {
    console.error("Nodemailer error:", err);
    return { success: false, error: err };
  }
}

export async function sendInvoiceEmail(toEmail: string, invoice: any) {
  try {
    const user = process.env.EMAIL_USER || "hamzaovet@gmail.com";
    const pass = process.env.EMAIL_PASS || "goyl rmse icox vrdh";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    const linesHtml = (invoice.lines || [])
      .map(
        (l: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #333;">${l.productName} (${l.color} - ${l.size})</td>
          <td style="padding: 8px; border-bottom: 1px solid #333; text-align: center;">${l.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #333; text-align: left;">${l.total || l.subtotal} ج.م</td>
        </tr>
      `
      )
      .join("");

    await transporter.sendMail({
      from: `"بزار كاجوال وير 👑" <${user}>`,
      to: toEmail,
      subject: `فاتورة مشترياتك من بزار كاجوال وير: ${invoice.invoiceNumber}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #0a0a0f; color: #f8f9fa; padding: 30px; border-radius: 16px; border: 1px solid #f59e0b; max-width: 550px; margin: 0 auto;">
          <h2 style="color: #f59e0b; text-align: center; margin-bottom: 5px;">فاتورة إلكترونية معتمدة</h2>
          <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 0;">بزار كاجوال وير • ${invoice.branch?.name || "الفرع"}</p>
          <hr style="border: 0; border-top: 1px dashed #444; margin: 15px 0;" />
          
          <table style="width: 100%; font-size: 13px; margin-bottom: 15px;">
            <tr>
              <td><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</td>
              <td style="text-align: left;"><strong>التاريخ:</strong> ${new Date(invoice.createdAt || Date.now()).toLocaleDateString("ar-EG")}</td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px;">
            <thead>
              <tr style="background-color: #1a1a24; color: #f59e0b;">
                <th style="padding: 8px; text-align: right;">الصنف</th>
                <th style="padding: 8px; text-align: center;">العدد</th>
                <th style="padding: 8px; text-align: left;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${linesHtml}
            </tbody>
          </table>

          <div style="background-color: #15151e; padding: 15px; border-radius: 12px; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; color: #f59e0b;">
              <span>الصافي المدفوع:</span>
              <span>${invoice.netTotal || invoice.finalTotal} ج.م</span>
            </div>
          </div>

          <p style="text-align: center; font-size: 11px; color: #777; margin-top: 20px;">
            شكراً لتسوقك من بزار كاجوال وير • الاستبدال والاسترجاع خلال 14 يوماً بأصل الفاتورة
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (err) {
    console.error("Send invoice email error:", err);
    return { success: false, error: err };
  }
}
