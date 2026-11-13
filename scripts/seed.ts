import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Starting BAZAAR Casual Wear seeding...");

  // 1. System Settings
  const settings = await prisma.systemSettings.upsert({
    where: { id: 1 },
    update: {
      brandNameAr: "بزار كاجوال وير",
      brandNameEn: "BAZAAR Casual Wear",
      hotline: "01008038041",
      whatsappNumber: "01008038041",
      facebookUrl: "https://www.facebook.com/share/1Dq8mYkoij/",
      facebookUrl2: "https://www.facebook.com/profile.php?id=100090095202108&mibextid=wwXIfr",
      tiktokUrl: "https://www.tiktok.com/@mohamed_ashraf327?_r=1&_t=ZS-9BMGDqeFbr2",
      instagramUrl: "https://www.instagram.com/bazaar_casual_wear",
      isMasterLocked: false,
    },
    create: {
      id: 1,
      brandNameAr: "بزار كاجوال وير",
      brandNameEn: "BAZAAR Casual Wear",
      hotline: "01008038041",
      whatsappNumber: "01008038041",
      facebookUrl: "https://www.facebook.com/share/1Dq8mYkoij/",
      facebookUrl2: "https://www.facebook.com/profile.php?id=100090095202108&mibextid=wwXIfr",
      tiktokUrl: "https://www.tiktok.com/@mohamed_ashraf327?_r=1&_t=ZS-9BMGDqeFbr2",
      instagramUrl: "https://www.instagram.com/bazaar_casual_wear",
      isMasterLocked: false,
    },
  });
  console.log("✅ System settings initialized.");

  // 2. Branches
  const b1 = await prisma.branch.upsert({
    where: { code: "BR-ABBAS-MAIN" },
    update: {
      name: "فرع عباس العقاد الرئيسي",
      address: "عباس العقاد بجوار أبو العز السوري وصالون صدام وسنتر علم الدين",
      phone: "01008038041",
      whatsapp: "201008038041",
      googleMapsUrl: "https://maps.app.goo.gl/MzCnj5n3mP29uurK6?g_st=ic",
      isActive: true,
      isDayOffEnabled: false,
      weeklyDayOff: "NONE",
    },
    create: {
      code: "BR-ABBAS-MAIN",
      name: "فرع عباس العقاد الرئيسي",
      address: "عباس العقاد بجوار أبو العز السوري وصالون صدام وسنتر علم الدين",
      phone: "01008038041",
      whatsapp: "201008038041",
      googleMapsUrl: "https://maps.app.goo.gl/MzCnj5n3mP29uurK6?g_st=ic",
      isActive: true,
      isDayOffEnabled: false,
      weeklyDayOff: "NONE",
    },
  });

  const b2 = await prisma.branch.upsert({
    where: { code: "BR-TAHRIR" },
    update: {
      name: "فرع أول عباس - كشري التحرير",
      address: "أول عباس العقاد شارع كشري التحرير بجوار كافيه طاولة وحلاق طه منصور",
      phone: "01008038041",
      whatsapp: "201008038041",
      googleMapsUrl: "https://maps.app.goo.gl/SV4L5Xeksm1GTPxGA?g_st=com.google.maps.preview.copy",
      isActive: true,
      isDayOffEnabled: false,
      weeklyDayOff: "NONE",
    },
    create: {
      code: "BR-TAHRIR",
      name: "فرع أول عباس - كشري التحرير",
      address: "أول عباس العقاد شارع كشري التحرير بجوار كافيه طاولة وحلاق طه منصور",
      phone: "01008038041",
      whatsapp: "201008038041",
      googleMapsUrl: "https://maps.app.goo.gl/SV4L5Xeksm1GTPxGA?g_st=com.google.maps.preview.copy",
      isActive: true,
      isDayOffEnabled: false,
      weeklyDayOff: "NONE",
    },
  });
  console.log("✅ Branches seeded: BR-ABBAS-MAIN & BR-TAHRIR.");

  // 3. Users & RBAC
  const usersData = [
    {
      username: "maestro",
      password: "123456789",
      pin: "157230",
      name: "المايسترو (Maestro)",
      role: "owner",
      branchId: null,
      phone: "01008038041",
    },
    {
      username: "mohamed_ashraf",
      password: "123456789",
      pin: "112233",
      name: "م/ محمد أشرف (المدير العام)",
      role: "general_manager",
      branchId: null,
      phone: "01008038041",
    },
    {
      username: "mgr_abbas",
      password: "123456789",
      pin: "1234",
      name: "مدير فرع عباس الرئيسي",
      role: "branch_manager",
      branchId: b1.id,
      phone: "01210520500",
    },
    {
      username: "mgr_tahrir",
      password: "123456789",
      pin: "1234",
      name: "مدير فرع كشري التحرير",
      role: "branch_manager",
      branchId: b2.id,
      phone: "01008183647",
    },
    {
      username: "cashier_abbas",
      password: "123456789",
      pin: "1234",
      name: "كاشير فرع عباس",
      role: "cashier",
      branchId: b1.id,
      phone: "01001582583",
    },
    {
      username: "cashier_tahrir",
      password: "123456789",
      pin: "1234",
      name: "كاشير فرع كشري التحرير",
      role: "cashier",
      branchId: b2.id,
      phone: "01001582583",
    },
    {
      username: "storekeeper",
      password: "123456789",
      pin: "1234",
      name: "أمين المخزن المركزي",
      role: "storekeeper",
      branchId: null,
      phone: "01008038041",
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {
        password: u.password,
        pin: u.pin,
        name: u.name,
        role: u.role,
        branchId: u.branchId,
        phone: u.phone,
        isActive: true,
      },
      create: {
        username: u.username,
        password: u.password,
        pin: u.pin,
        name: u.name,
        role: u.role,
        branchId: u.branchId,
        phone: u.phone,
        isActive: true,
      },
    });
  }
  console.log("✅ Users seeded (Maestro, GM, Managers, Cashiers, Storekeeper).");

  // 4. Categories
  const categories = [
    {
      slug: "oversized-tees",
      nameAr: "تيشرتات أوفر سايز",
      nameEn: "Oversized Tees",
      icon: "Shirt",
      sortOrder: 1,
    },
    {
      slug: "casual-shirts",
      nameAr: "قمصان كاجوال وكتان",
      nameEn: "Casual & Linen Shirts",
      icon: "Shirt",
      sortOrder: 2,
    },
    {
      slug: "jeans-cargo",
      nameAr: "بناطيل جينز وكارجو",
      nameEn: "Jeans & Cargo Pants",
      icon: "Layers",
      sortOrder: 3,
    },
    {
      slug: "hoodies-sweats",
      nameAr: "سويت شيرت وهوديز",
      nameEn: "Hoodies & Sweatshirts",
      icon: "Flame",
      sortOrder: 4,
    },
    {
      slug: "blazers-jackets",
      nameAr: "بليزرات وجواكت كاجوال",
      nameEn: "Blazers & Jackets",
      icon: "Briefcase",
      sortOrder: 5,
    },
    {
      slug: "shorts-sweatpants",
      nameAr: "شورتات وبناطيل بيكا",
      nameEn: "Shorts & Sweatpants",
      icon: "Scissors",
      sortOrder: 6,
    },
    {
      slug: "sneakers",
      nameAr: "أحذية وسنيكرز كاجوال",
      nameEn: "Casual Sneakers",
      icon: "Footprints",
      sortOrder: 7,
    },
    {
      slug: "accessories",
      nameAr: "إكسسوارات ومحافظ وأحزمة",
      nameEn: "Accessories",
      icon: "Watch",
      sortOrder: 8,
    },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nameAr: c.nameAr, nameEn: c.nameEn, icon: c.icon, sortOrder: c.sortOrder },
      create: { slug: c.slug, nameAr: c.nameAr, nameEn: c.nameEn, icon: c.icon, sortOrder: c.sortOrder },
    });
    catMap[c.slug] = created.id;
  }
  console.log("✅ Categories seeded.");

  // 5. Products & Product Variants
  const products = [
    {
      sku: "BAZ-TEE-01",
      nameAr: "تيشرت أوفر سايز بريميوم جرافيك أسود",
      catSlug: "oversized-tees",
      basePrice: 480,
      costPrice: 240,
      material: "قطن 100% ميلتون صيفي معالج ضد الانكماش",
      variants: [
        { size: "M", color: "أسود ملكي", colorHex: "#111111", barcode: "20010010011", central: 50, b1: 20, b2: 15 },
        { size: "L", color: "أسود ملكي", colorHex: "#111111", barcode: "20010010012", central: 60, b1: 25, b2: 20 },
        { size: "XL", color: "أسود ملكي", colorHex: "#111111", barcode: "20010010013", central: 50, b1: 20, b2: 15 },
        { size: "2XL", color: "أسود ملكي", colorHex: "#111111", barcode: "20010010014", central: 40, b1: 15, b2: 10 },
        { size: "L", color: "أبيض ثلجي", colorHex: "#F8F9FA", barcode: "20010010015", central: 40, b1: 15, b2: 15 },
        { size: "XL", color: "أبيض ثلجي", colorHex: "#F8F9FA", barcode: "20010010016", central: 40, b1: 15, b2: 15 },
      ],
    },
    {
      sku: "BAZ-TEE-02",
      nameAr: "تيشرت بيكيه قطن هيفي ويت مينيمال زيتي",
      catSlug: "oversized-tees",
      basePrice: 520,
      costPrice: 260,
      material: "قطن مصري 100% هيفي ويت 280 جرام",
      variants: [
        { size: "M", color: "زيتي داكن", colorHex: "#2E3B2E", barcode: "20010010021", central: 30, b1: 12, b2: 10 },
        { size: "L", color: "زيتي داكن", colorHex: "#2E3B2E", barcode: "20010010022", central: 40, b1: 15, b2: 12 },
        { size: "XL", color: "زيتي داكن", colorHex: "#2E3B2E", barcode: "20010010023", central: 35, b1: 14, b2: 10 },
        { size: "L", color: "بيج ترابي", colorHex: "#D2B48C", barcode: "20010010024", central: 30, b1: 10, b2: 10 },
        { size: "XL", color: "بيج ترابي", colorHex: "#D2B48C", barcode: "20010010025", central: 30, b1: 10, b2: 10 },
      ],
    },
    {
      sku: "BAZ-SHT-01",
      nameAr: "قميص كتان بيور كاجوال ياقة صيني كحلي",
      catSlug: "casual-shirts",
      basePrice: 650,
      costPrice: 320,
      material: "كتان تركي طبيعي 100%",
      variants: [
        { size: "M", color: "كحلي ليلي", colorHex: "#0B1D3A", barcode: "20010020011", central: 25, b1: 10, b2: 8 },
        { size: "L", color: "كحلي ليلي", colorHex: "#0B1D3A", barcode: "20010020012", central: 35, b1: 15, b2: 12 },
        { size: "XL", color: "كحلي ليلي", colorHex: "#0B1D3A", barcode: "20010020013", central: 30, b1: 12, b2: 10 },
        { size: "2XL", color: "كحلي ليلي", colorHex: "#0B1D3A", barcode: "20010020014", central: 20, b1: 8, b2: 6 },
        { size: "L", color: "سماوي باستيل", colorHex: "#87CEEB", barcode: "20010020015", central: 25, b1: 10, b2: 8 },
        { size: "XL", color: "سماوي باستيل", colorHex: "#87CEEB", barcode: "20010020016", central: 25, b1: 10, b2: 8 },
      ],
    },
    {
      sku: "BAZ-PNT-01",
      nameAr: "بنطلون كارجو باراشوت ووتر بروف أسود",
      catSlug: "jeans-cargo",
      basePrice: 690,
      costPrice: 340,
      material: "ريكر وساتان معالج ووتر بروف مريح",
      variants: [
        { size: "30", color: "أسود مات", colorHex: "#1C1C1C", barcode: "20010030011", central: 20, b1: 8, b2: 6 },
        { size: "32", color: "أسود مات", colorHex: "#1C1C1C", barcode: "20010030012", central: 30, b1: 12, b2: 10 },
        { size: "34", color: "أسود مات", colorHex: "#1C1C1C", barcode: "20010030013", central: 35, b1: 14, b2: 12 },
        { size: "36", color: "أسود مات", colorHex: "#1C1C1C", barcode: "20010030014", central: 25, b1: 10, b2: 8 },
        { size: "38", color: "أسود مات", colorHex: "#1C1C1C", barcode: "20010030015", central: 15, b1: 6, b2: 5 },
      ],
    },
    {
      sku: "BAZ-JNS-01",
      nameAr: "بنطلون جينز بوي فريند ستريت تركي أزرق مغسول",
      catSlug: "jeans-cargo",
      basePrice: 750,
      costPrice: 390,
      material: "دينم تركي ثقيل 100% قطن",
      variants: [
        { size: "31", color: "أزرق ثلجي مغسول", colorHex: "#4682B4", barcode: "20010030021", central: 20, b1: 8, b2: 6 },
        { size: "32", color: "أزرق ثلجي مغسول", colorHex: "#4682B4", barcode: "20010030022", central: 30, b1: 12, b2: 10 },
        { size: "34", color: "أزرق ثلجي مغسول", colorHex: "#4682B4", barcode: "20010030023", central: 30, b1: 12, b2: 10 },
        { size: "36", color: "أزرق ثلجي مغسول", colorHex: "#4682B4", barcode: "20010030024", central: 20, b1: 8, b2: 6 },
      ],
    },
    {
      sku: "BAZ-HDY-01",
      nameAr: "هودي أوفر سايز ميلتون مبطن فرو رمادي غامق",
      catSlug: "hoodies-sweats",
      basePrice: 790,
      costPrice: 410,
      material: "ميلتون قطن 3 فتلة معالج مبطن فرو ناعم",
      variants: [
        { size: "M", color: "رمادي شاركول", colorHex: "#36454F", barcode: "20010040011", central: 25, b1: 10, b2: 8 },
        { size: "L", color: "رمادي شاركول", colorHex: "#36454F", barcode: "20010040012", central: 35, b1: 15, b2: 12 },
        { size: "XL", color: "رمادي شاركول", colorHex: "#36454F", barcode: "20010040013", central: 30, b1: 12, b2: 10 },
        { size: "2XL", color: "رمادي شاركول", colorHex: "#36454F", barcode: "20010040014", central: 20, b1: 8, b2: 6 },
      ],
    },
    {
      sku: "BAZ-BLZ-01",
      nameAr: "بليزر كاجوال إيطالي سليم فيت كحلي",
      catSlug: "blazers-jackets",
      basePrice: 1250,
      costPrice: 650,
      material: "صوف مخلوط ليكرا مرن مبطن ستان",
      variants: [
        { size: "48", color: "كحلي كلاسيك", colorHex: "#0D1B2A", barcode: "20010050011", central: 15, b1: 5, b2: 4 },
        { size: "50", color: "كحلي كلاسيك", colorHex: "#0D1B2A", barcode: "20010050012", central: 20, b1: 8, b2: 6 },
        { size: "52", color: "كحلي كلاسيك", colorHex: "#0D1B2A", barcode: "20010050013", central: 20, b1: 8, b2: 6 },
        { size: "54", color: "كحلي كلاسيك", colorHex: "#0D1B2A", barcode: "20010050014", central: 15, b1: 5, b2: 4 },
      ],
    },
    {
      sku: "BAZ-SNK-01",
      nameAr: "سنيكرز كاجوال جلد طبيعي أبيض ونعل مريح",
      catSlug: "sneakers",
      basePrice: 850,
      costPrice: 450,
      material: "جلد طبيعي فائق النعومة مع نعل فوم طبي",
      variants: [
        { size: "41", color: "أبيض ملكي", colorHex: "#FFFFFF", barcode: "20010070011", central: 15, b1: 6, b2: 5 },
        { size: "42", color: "أبيض ملكي", colorHex: "#FFFFFF", barcode: "20010070012", central: 25, b1: 10, b2: 8 },
        { size: "43", color: "أبيض ملكي", colorHex: "#FFFFFF", barcode: "20010070013", central: 30, b1: 12, b2: 10 },
        { size: "44", color: "أبيض ملكي", colorHex: "#FFFFFF", barcode: "20010070014", central: 20, b1: 8, b2: 6 },
        { size: "45", color: "أبيض ملكي", colorHex: "#FFFFFF", barcode: "20010070015", central: 10, b1: 4, b2: 3 },
      ],
    },
  ];

  for (const p of products) {
    const catId = catMap[p.catSlug];
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        nameAr: p.nameAr,
        categoryId: catId,
        basePrice: p.basePrice,
        costPrice: p.costPrice,
        material: p.material,
        isFeatured: true,
      },
      create: {
        sku: p.sku,
        nameAr: p.nameAr,
        categoryId: catId,
        basePrice: p.basePrice,
        costPrice: p.costPrice,
        material: p.material,
        isFeatured: true,
      },
    });

    for (const v of p.variants) {
      const variant = await prisma.productVariant.upsert({
        where: { barcode: v.barcode },
        update: {
          productId: product.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          priceOverride: p.basePrice,
          costPriceOverride: p.costPrice,
          stockCentral: v.central,
        },
        create: {
          productId: product.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          barcode: v.barcode,
          priceOverride: p.basePrice,
          costPriceOverride: p.costPrice,
          stockCentral: v.central,
        },
      });

      // Branch 1 stock
      await prisma.branchStock.upsert({
        where: {
          variantId_branchId: {
            branchId: b1.id,
            variantId: variant.id,
          },
        },
        update: { quantity: v.b1, alertLowQuantity: 3 },
        create: { branchId: b1.id, variantId: variant.id, quantity: v.b1, alertLowQuantity: 3 },
      });

      // Branch 2 stock
      await prisma.branchStock.upsert({
        where: {
          variantId_branchId: {
            branchId: b2.id,
            variantId: variant.id,
          },
        },
        update: { quantity: v.b2, alertLowQuantity: 3 },
        create: { branchId: b2.id, variantId: variant.id, quantity: v.b2, alertLowQuantity: 3 },
      });
    }
  }
  console.log("✅ Products and variants seeded with stock in central warehouse and both branches.");

  // 6. Promotional Offers
  await prisma.offer.createMany({
    data: [
      {
        titleAr: "عرض الافتتاح الملكي: اشترِ تيشرتين أوفر سايز واحصل على الثالث بخصم 50%",
        badge: "عرض ملكي 🔥",
        price: 999,
        oldPrice: 1440,
        discountPercent: 30,
        isActive: true,
        branchId: null, // all branches
      },
      {
        titleAr: "خصم خاص على جميع بناطيل الكارجو والجينز",
        badge: "تخفيضات 🏷️",
        price: 590,
        oldPrice: 690,
        discountPercent: 15,
        isActive: true,
        branchId: b1.id,
      },
      {
        titleAr: "بزار كاجوال فرع كشري التحرير: باقة الشارع كارجو + هودي",
        badge: "باكيدج التوفير 🚀",
        price: 1290,
        oldPrice: 1480,
        discountPercent: 15,
        isActive: true,
        branchId: b2.id,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Offers seeded.");

  console.log("🎉 BAZAAR Casual Wear seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
