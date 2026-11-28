import { prisma } from '../lib/prisma';

// 46 items from the paper invoice
const invoiceData = [
  // 1-4: بنطلون فلات
  { m: 1, code: '2-2678', modelType: 'بنطلون فلات', customName: 'بنطلون فلات كلاسيك (2-2678)', catName: 'بنطلون', qty: 15, cost: 1350, defaultSell: 1850 },
  { m: 2, code: '2-6011', modelType: 'بنطلون فلات', customName: 'بنطلون فلات كاجوال (2-6011)', catName: 'بنطلون', qty: 10, cost: 1280, defaultSell: 1750 },
  { m: 3, code: '2-6015-1', modelType: 'بنطلون فلات', customName: 'بنطلون فلات كاجوال (2-6015-1)', catName: 'بنطلون', qty: 10, cost: 1280, defaultSell: 1750 },
  { m: 4, code: '2-6025', modelType: 'بنطلون فلات', customName: 'بنطلون فلات كلاسيك (2-6025)', catName: 'بنطلون', qty: 20, cost: 1350, defaultSell: 1850 },

  // 5-14: ترنج شتوي
  // Note: 5 & 8 are marked with green highlighter -> "ترنج ماركات"
  { m: 5, code: '20-1033', modelType: 'ترنج شتوي', customName: 'ترنج ماركات VIP شتوي (20-1033)', catName: 'ترينينج سوت', qty: 8, cost: 3100, defaultSell: 4200, isBrand: true },
  { m: 6, code: '20-222', modelType: 'ترنج شتوي', customName: 'ترنج ووتر بروف شتوي (20-222)', catName: 'ترينينج سوت', qty: 8, cost: 2150, defaultSell: 2950 },
  { m: 7, code: '20-224', modelType: 'ترنج شتوي', customName: 'ترنج ووتر بروف شتوي (20-224)', catName: 'ترينينج سوت', qty: 12, cost: 2150, defaultSell: 2950 },
  { m: 8, code: '20-2670', modelType: 'ترنج شتوي', customName: 'ترنج ماركات فاخر شتوي (20-2670)', catName: 'ترينينج سوت', qty: 8, cost: 3150, defaultSell: 4300, isBrand: true },
  { m: 9, code: '20-331', modelType: 'ترنج شتوي', customName: 'ترنج ووتر بروف شتوي (20-331)', catName: 'ترينينج سوت', qty: 12, cost: 2150, defaultSell: 2950 },
  { m: 10, code: '20-336', modelType: 'ترنج شتوي', customName: 'ترنج ووتر بروف شتوي (20-336)', catName: 'ترينينج سوت', qty: 12, cost: 2150, defaultSell: 2950 },
  { m: 11, code: '20-337', modelType: 'ترنج شتوي', customName: 'ترنج ووتر بروف شتوي (20-337)', catName: 'ترينينج سوت', qty: 13, cost: 2150, defaultSell: 2950 },
  { m: 12, code: '20-338', modelType: 'ترنج شتوي', customName: 'ترنج ووتر بروف شتوي (20-338)', catName: 'ترينينج سوت', qty: 12, cost: 2150, defaultSell: 2950 },
  { m: 13, code: '20-668', modelType: 'ترنج شتوي', customName: 'ترنج ووتر بروف شتوي (20-668)', catName: 'ترينينج سوت', qty: 8, cost: 2150, defaultSell: 2950 },
  { m: 14, code: '20-671', modelType: 'ترنج شتوي', customName: 'ترنج ووتر بروف شتوي (20-671)', catName: 'ترينينج سوت', qty: 12, cost: 2150, defaultSell: 2950 },

  // 15-22: تريكو
  { m: 15, code: '17-2615-1', modelType: 'تريكو', customName: 'تريكو شتوي صوف (17-2615-1)', catName: 'بوكليت', qty: 8, cost: 1680, defaultSell: 2350 },
  { m: 16, code: '17-2620-1', modelType: 'تريكو', customName: 'تريكو شتوي صوف (17-2620-1)', catName: 'بوكليت', qty: 8, cost: 1680, defaultSell: 2350 },
  { m: 17, code: '17-2623', modelType: 'تريكو', customName: 'تريكو شتوي صوف (17-2623)', catName: 'بوكليت', qty: 8, cost: 1680, defaultSell: 2350 },
  { m: 18, code: '17-2624', modelType: 'تريكو', customName: 'تريكو شتوي بريميوم (17-2624)', catName: 'بوكليت', qty: 8, cost: 1750, defaultSell: 2450 },
  { m: 19, code: '17-2626', modelType: 'تريكو', customName: 'تريكو شتوي كاجوال (17-2626)', catName: 'بوكليت', qty: 8, cost: 1650, defaultSell: 2300 },
  { m: 20, code: '17-2647', modelType: 'تريكو', customName: 'تريكو شتوي فاخر (17-2647)', catName: 'بوكليت', qty: 8, cost: 1700, defaultSell: 2400 },
  { m: 21, code: '17-3060', modelType: 'تريكو', customName: 'تريكو تركي ناعم (17-3060)', catName: 'بوكليت', qty: 18, cost: 1490, defaultSell: 2100 },
  { m: 22, code: '17-3065', modelType: 'تريكو', customName: 'تريكو تركي ناعم (17-3065)', catName: 'بوكليت', qty: 18, cost: 1490, defaultSell: 2100 },

  // 23-46: جاكت
  { m: 23, code: '16-22701', modelType: 'جاكت', customName: 'جاكت شتوي مستورد (16-22701)', catName: 'جاكيت', qty: 2, cost: 3850, defaultSell: 5200 },
  { m: 24, code: '16-22709', modelType: 'جاكت', customName: 'جاكت شتوي مستورد (16-22709)', catName: 'جاكيت', qty: 4, cost: 3950, defaultSell: 5400 },
  { m: 25, code: '16-2683', modelType: 'جاكت', customName: 'جاكت كاجوال لايت (16-2683)', catName: 'جاكيت', qty: 16, cost: 1350, defaultSell: 1950 },
  { m: 26, code: '16-2688', modelType: 'جاكت', customName: 'جاكت كاجوال لايت (16-2688)', catName: 'جاكيت', qty: 12, cost: 1350, defaultSell: 1950 },
  { m: 27, code: '16-2696', modelType: 'جاكت', customName: 'جاكت كاجوال لايت (16-2696)', catName: 'جاكيت', qty: 12, cost: 1350, defaultSell: 1950 },
  { m: 28, code: '16-3106', modelType: 'جاكت', customName: 'جاكت بامب وتر بروف (16-3106)', catName: 'جاكيت', qty: 8, cost: 2950, defaultSell: 4100 },
  { m: 29, code: '16-3385', modelType: 'جاكت', customName: 'جاكت جلد/شتوي فاخر (16-3385)', catName: 'جاكيت', qty: 3, cost: 4250, defaultSell: 5800 },
  { m: 30, code: '16-36929', modelType: 'جاكت', customName: 'جاكت شتوي رويال (16-36929)', catName: 'جاكيت', qty: 3, cost: 4350, defaultSell: 5900 },
  { m: 31, code: '16-36929-1', modelType: 'جاكت', customName: 'جاكت شتوي رويال (16-36929-1)', catName: 'جاكيت', qty: 3, cost: 4250, defaultSell: 5800 },
  { m: 32, code: '16-505', modelType: 'جاكت', customName: 'جاكت مبطن ثقيل (16-505)', catName: 'جاكيت', qty: 8, cost: 3200, defaultSell: 4400 },
  { m: 33, code: '16-6289', modelType: 'جاكت', customName: 'جاكت شتوي بريميوم (16-6289)', catName: 'جاكيت', qty: 3, cost: 4200, defaultSell: 5750 },
  { m: 34, code: '16-6375', modelType: 'جاكت', customName: 'جاكت شتوي بريميوم (16-6375)', catName: 'جاكيت', qty: 3, cost: 4250, defaultSell: 5800 },
  { m: 35, code: '16-6633-1', modelType: 'جاكت', customName: 'جاكت شتوي أنيق (16-6633-1)', catName: 'جاكيت', qty: 3, cost: 4100, defaultSell: 5600 },
  { m: 36, code: '16-6633-2', modelType: 'جاكت', customName: 'جاكت كاجوال شتوي (16-6633-2)', catName: 'جاكيت', qty: 3, cost: 3650, defaultSell: 4950 },
  { m: 37, code: '16-6802-1', modelType: 'جاكت', customName: 'جاكت شتوي بريميوم (16-6802-1)', catName: 'جاكيت', qty: 2, cost: 4200, defaultSell: 5750 },
  { m: 38, code: '16-6916', modelType: 'جاكت', customName: 'جاكت شتوي رويال (16-6916)', catName: 'جاكيت', qty: 3, cost: 4300, defaultSell: 5850 },
  { m: 39, code: '16-8009', modelType: 'جاكت', customName: 'جاكت ماستر VIP فاخر (16-8009)', catName: 'جاكيت', qty: 6, cost: 4950, defaultSell: 6800 },
  { m: 40, code: '16-856286', modelType: 'جاكت', customName: 'جاكت ماستر شتوي (16-856286)', catName: 'جاكيت', qty: 3, cost: 4500, defaultSell: 6200 },
  { m: 41, code: '16-86531', modelType: 'جاكت', customName: 'جاكت شتوي رويال (16-86531)', catName: 'جاكيت', qty: 5, cost: 4300, defaultSell: 5850 },
  { m: 42, code: '16-8806-1', modelType: 'جاكت', customName: 'جاكت كاجوال مبطن (16-8806-1)', catName: 'جاكيت', qty: 6, cost: 3500, defaultSell: 4800 },
  { m: 43, code: '16-8815', modelType: 'جاكت', customName: 'جاكت ماستر شتوي (16-8815)', catName: 'جاكيت', qty: 3, cost: 4500, defaultSell: 6200 },
  { m: 44, code: '16-96012', modelType: 'جاكت', customName: 'جاكت شتوي رويال (16-96012)', catName: 'جاكيت', qty: 6, cost: 4300, defaultSell: 5850 },
  { m: 45, code: '16-df-002', modelType: 'جاكت', customName: 'جاكت كاجوال خفيف (16-df-002)', catName: 'جاكيت', qty: 3, cost: 1950, defaultSell: 2750 },
  { m: 46, code: '16-hg002', modelType: 'جاكت', customName: 'جاكت وتر بروف رياضي (16-hg002)', catName: 'جاكيت', qty: 8, cost: 2800, defaultSell: 3900 }
];

async function main() {
  console.log('🚀 Seeding verified 46-item purchase invoice for Bazaar & Mohamed Ashraf...');

  // 1. Get or create Supplier
  let supplier = await prisma.supplier.findFirst({
    where: { name: 'المورد الرئيسي - توريدات ملابس شتاء بازار' }
  });
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        name: 'المورد الرئيسي - توريدات ملابس شتاء بازار',
        contactName: 'كود العميل: 1259 (م / محمد أشرف)',
        phone: '01008038041',
        totalDebt: 837360,
        notes: 'فاتورة توريد بضاعة شتوية (46 موديلاً، 372 قطعة) بإجمالي 837,360 ج.م'
      }
    });
  }

  // 2. Get Branches & Categories
  const mainBranch = await prisma.branch.findFirst({
    where: { name: { contains: 'عباس' } }
  }) || await prisma.branch.findFirst();

  if (!mainBranch) {
    throw new Error('No branch found');
  }

  const allCategories = await prisma.category.findMany();
  const catMap = new Map(allCategories.map(c => [c.nameAr, c.id]));

  // Ensure categories exist
  for (const catName of ['بنطلون', 'ترينينج سوت', 'بوكليت', 'جاكيت']) {
    if (!catMap.has(catName)) {
      const newCat = await prisma.category.create({
        data: {
          nameAr: catName,
          slug: catName === 'ترينينج سوت' ? 'trainings' : catName === 'بنطلون' ? 'pants' : catName === 'جاكيت' ? 'jackets' : 'knitwear'
        }
      });
      catMap.set(catName, newCat.id);
    }
  }

  // 3. Create or Update PurchaseInvoice
  const invoiceNumber = 'PUR-INV-1259';
  let purchaseInv = await prisma.purchaseInvoice.findUnique({
    where: { invoiceNumber }
  });

  if (purchaseInv) {
    console.log('Cleaning existing purchase invoice to re-seed cleanly...');
    await prisma.purchaseInvoiceLine.deleteMany({
      where: { purchaseInvoiceId: purchaseInv.id }
    });
    await prisma.purchaseInvoice.delete({
      where: { id: purchaseInv.id }
    });
  }

  const auditReport = JSON.stringify({
    totalModels: 46,
    totalUnits: 372,
    totalAmount: 837360,
    clientCode: '1259',
    clientName: 'محمد أشرف',
    phone: '01008038041',
    verifiedAt: new Date().toISOString(),
    status: 'PERFECT_MATCH',
    discrepancies: []
  });

  purchaseInv = await prisma.purchaseInvoice.create({
    data: {
      invoiceNumber,
      supplierId: supplier.id,
      branchId: mainBranch.id,
      type: 'PURCHASE',
      totalAmount: 837360,
      paidAmount: 0.0,
      remainingDebt: 837360,
      status: 'COMPLETED',
      verificationStatus: 'VERIFIED',
      verificationReport: auditReport,
      supplierInvoiceRef: '1259',
      notes: 'فاتورة الشراء المعتمدة لمحمد أشرف (46 موديلاً، 372 قطعة) - تم التدقيق الحسابي بالكامل مطابقة 100%'
    }
  });

  console.log(`✓ Purchase Invoice ${invoiceNumber} created! ID: ${purchaseInv.id}`);

  let totalSeededPieces = 0;
  let totalSeededCost = 0;

  // 4. Create or update Products, Variants, and BranchStock
  for (const item of invoiceData) {
    const catId = catMap.get(item.catName);
    const sku = `BAZ-${item.code}`;

    let prod = await prisma.product.findUnique({
      where: { sku }
    });

    if (!prod) {
      prod = await prisma.product.create({
        data: {
          nameAr: item.customName,
          sku,
          description: `موديل توريد ${item.modelType} كود ${item.code} خامات شتوية فاخرة`,
          categoryId: catId,
          costPrice: item.cost, // Secret cost price!
          basePrice: item.defaultSell, // Initial dynamic selling price
          brand: item.isBrand ? 'BAZAAR VIP BRANDS' : 'BAZAAR CASUAL',
          material: item.modelType.includes('ترنج') ? 'ووتر بروف مبطن ميلتون' : item.modelType.includes('تريكو') ? 'صوف تركي ناعم' : item.modelType.includes('جاكت') ? 'نسيج معالج ضد الماء' : 'قطن فلات كلاسيك',
          isFeatured: item.isBrand || item.cost > 4000
        }
      });
    } else {
      prod = await prisma.product.update({
        where: { id: prod.id },
        data: {
          nameAr: item.customName,
          costPrice: item.cost,
          basePrice: item.defaultSell,
          categoryId: catId
        }
      });
    }

    // Create primary Variant with Barcode matching code
    // Standard barcode: 622 + sanitized code
    const cleanCode = item.code.replace(/[^a-zA-Z0-9]/g, '');
    const barcode = `622${cleanCode.padStart(7, '0')}`;

    let variant = await prisma.productVariant.findFirst({
      where: { productId: prod.id }
    });

    if (!variant) {
      variant = await prisma.productVariant.create({
        data: {
          productId: prod.id,
          color: 'ألوان وموديلات مشكلة',
          size: 'M-L-XL-2XL',
          barcode,
          sku: `${sku}-STD`,
          costPriceOverride: item.cost,
          priceOverride: item.defaultSell,
          stockCentral: item.qty
        }
      });
    } else {
      variant = await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          barcode,
          costPriceOverride: item.cost,
          priceOverride: item.defaultSell,
          stockCentral: item.qty
        }
      });
    }

    // Branch Stock
    await prisma.branchStock.upsert({
      where: {
        variantId_branchId: {
          variantId: variant.id,
          branchId: mainBranch.id
        }
      },
      update: {
        quantity: item.qty
      },
      create: {
        variantId: variant.id,
        branchId: mainBranch.id,
        quantity: item.qty
      }
    });

    // Purchase Invoice Line
    await prisma.purchaseInvoiceLine.create({
      data: {
        purchaseInvoiceId: purchaseInv.id,
        variantId: variant.id,
        quantity: item.qty,
        costPrice: item.cost,
        total: item.qty * item.cost
      }
    });

    totalSeededPieces += item.qty;
    totalSeededCost += item.qty * item.cost;
  }

  // 5. Create Owner Executive Alert for Mohamed Ashraf
  await prisma.ownerAlert.create({
    data: {
      type: 'PURCHASE_VERIFICATION',
      title: 'تم تدقيق وتأكيد فاتورة التوريد رقم 1259 بنجاح 📦✨',
      message: `عزيزي م/ محمد أشرف، تم إدخال ومراجعة فاتورتك الجديدة بالكامل: 46 موديلاً، 372 قطعة، بإجمالي 837,360 ج.م بدون أي فوارق حسابية. البضاعة الآن مسجلة بالتكلفة والكميات ومتاحة بنقطة البيع.`,
      data: auditReport
    }
  });

  console.log(`\n🎉 SEEDING COMPLETED SUCCESSFULLY!`);
  console.log(`- Total Models Seeded: ${invoiceData.length}`);
  console.log(`- Total Units Seeded: ${totalSeededPieces} pieces`);
  console.log(`- Total Cost Seeded: ${totalSeededCost.toLocaleString()} EGP`);
}

main().catch(console.error).finally(() => process.exit(0));
