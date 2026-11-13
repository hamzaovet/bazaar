import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Starting BAZAAR Casual Wear rich seeding...");

  // 1. System Settings
  await prisma.systemSettings.upsert({
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
  console.log("✅ Branches seeded.");

  // 3. Categories
  const categories = [
    { slug: "oversized-tees", nameAr: "تيشرتات أوفر سايز", nameEn: "Oversized Tees", icon: "Shirt", sortOrder: 1 },
    { slug: "casual-shirts", nameAr: "قمصان كاجوال وكتان", nameEn: "Casual & Linen Shirts", icon: "Shirt", sortOrder: 2 },
    { slug: "jeans-cargo", nameAr: "بناطيل جينز وكارجو", nameEn: "Jeans & Cargo Pants", icon: "Layers", sortOrder: 3 },
    { slug: "hoodies-sweats", nameAr: "سويت شيرت وهوديز", nameEn: "Hoodies & Sweatshirts", icon: "Flame", sortOrder: 4 },
    { slug: "blazers-jackets", nameAr: "بليزرات وجواكت كاجوال", nameEn: "Blazers & Jackets", icon: "Briefcase", sortOrder: 5 },
    { slug: "sneakers", nameAr: "أحذية وسنيكرز كاجوال", nameEn: "Casual Sneakers", icon: "Footprints", sortOrder: 6 },
    { slug: "accessories", nameAr: "إكسسوارات وكابات", nameEn: "Accessories", icon: "Watch", sortOrder: 7 },
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

  // Clear existing product variants and products to ensure clean seed with new barcodes & color images
  console.log("🧹 Refreshing product catalog...");
  await prisma.branchStock.deleteMany({});
  await prisma.stockTransferLine.deleteMany({});
  await prisma.invoiceLine.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});

  // 4. Products with Dynamic Multi-Color Variants & Exact Matching Images!
  const products = [
    {
      sku: "BAZ-TEE-01",
      nameAr: "تيشرت أوفر سايز بريميوم جرافيك رويال",
      catSlug: "oversized-tees",
      basePrice: 480,
      costPrice: 240,
      material: "قطن 100% ميلتون صيفي معالج ضد الانكماش 260 جرام",
      featuredImage: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
      variants: [
        // أسود ملكي
        { size: "M", color: "أسود ملكي", colorHex: "#111111", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80", barcode: "20010010011", central: 50, b1: 20, b2: 15 },
        { size: "L", color: "أسود ملكي", colorHex: "#111111", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80", barcode: "20010010012", central: 60, b1: 25, b2: 20 },
        { size: "XL", color: "أسود ملكي", colorHex: "#111111", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80", barcode: "20010010013", central: 50, b1: 20, b2: 15 },
        { size: "2XL", color: "أسود ملكي", colorHex: "#111111", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80", barcode: "20010010014", central: 40, b1: 15, b2: 10 },
        // أبيض ثلجي
        { size: "M", color: "أبيض ثلجي", colorHex: "#F8F9FA", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80", barcode: "20010010015", central: 40, b1: 15, b2: 15 },
        { size: "L", color: "أبيض ثلجي", colorHex: "#F8F9FA", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80", barcode: "20010010016", central: 50, b1: 20, b2: 18 },
        { size: "XL", color: "أبيض ثلجي", colorHex: "#F8F9FA", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80", barcode: "20010010017", central: 40, b1: 15, b2: 12 },
        // زيتي داكن
        { size: "L", color: "زيتي داكن", colorHex: "#2E3B2E", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80", barcode: "20010010018", central: 30, b1: 12, b2: 10 },
        { size: "XL", color: "زيتي داكن", colorHex: "#2E3B2E", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80", barcode: "20010010019", central: 30, b1: 10, b2: 10 },
      ],
    },
    {
      sku: "BAZ-TEE-02",
      nameAr: "تيشرت أوفر سايز مينيمال هيفي ويت 300G",
      catSlug: "oversized-tees",
      basePrice: 520,
      costPrice: 260,
      material: "قطن مصري 100% هيفي ويت 300 جرام ياقة دائرية متماسكة",
      featuredImage: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
      variants: [
        // بيج ساند
        { size: "M", color: "بيج ترابي", colorHex: "#D2B48C", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80", barcode: "20010010021", central: 35, b1: 15, b2: 12 },
        { size: "L", color: "بيج ترابي", colorHex: "#D2B48C", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80", barcode: "20010010022", central: 40, b1: 16, b2: 14 },
        { size: "XL", color: "بيج ترابي", colorHex: "#D2B48C", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80", barcode: "20010010023", central: 30, b1: 12, b2: 10 },
        // كحلي نايت
        { size: "M", color: "كحلي داكن", colorHex: "#0D1B2A", image: "https://images.unsplash.com/photo-1618354691792-d1d42acfd860?auto=format&fit=crop&w=800&q=80", barcode: "20010010024", central: 30, b1: 12, b2: 10 },
        { size: "L", color: "كحلي داكن", colorHex: "#0D1B2A", image: "https://images.unsplash.com/photo-1618354691792-d1d42acfd860?auto=format&fit=crop&w=800&q=80", barcode: "20010010025", central: 35, b1: 14, b2: 12 },
        { size: "XL", color: "كحلي داكن", colorHex: "#0D1B2A", image: "https://images.unsplash.com/photo-1618354691792-d1d42acfd860?auto=format&fit=crop&w=800&q=80", barcode: "20010010026", central: 25, b1: 10, b2: 8 },
      ],
    },
    {
      sku: "BAZ-PNT-01",
      nameAr: "بنطلون كارجو باراشوت ووتر بروف 6 جيوب",
      catSlug: "jeans-cargo",
      basePrice: 690,
      costPrice: 340,
      material: "ريكر وساتان معالج ووتر بروف خفيف ومريح استك قابل للشد",
      featuredImage: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
      variants: [
        // أسود مات
        { size: "30", color: "أسود مات", colorHex: "#1C1C1C", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80", barcode: "20010030011", central: 20, b1: 8, b2: 6 },
        { size: "32", color: "أسود مات", colorHex: "#1C1C1C", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80", barcode: "20010030012", central: 30, b1: 12, b2: 10 },
        { size: "34", color: "أسود مات", colorHex: "#1C1C1C", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80", barcode: "20010030013", central: 35, b1: 14, b2: 12 },
        { size: "36", color: "أسود مات", colorHex: "#1C1C1C", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80", barcode: "20010030014", central: 25, b1: 10, b2: 8 },
        // زيتي تكتيكال
        { size: "32", color: "زيتي تكتيكال", colorHex: "#3B4D3B", image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80", barcode: "20010030015", central: 25, b1: 10, b2: 8 },
        { size: "34", color: "زيتي تكتيكال", colorHex: "#3B4D3B", image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80", barcode: "20010030016", central: 30, b1: 12, b2: 10 },
        { size: "36", color: "زيتي تكتيكال", colorHex: "#3B4D3B", image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80", barcode: "20010030017", central: 20, b1: 8, b2: 6 },
        // بيج سفاري
        { size: "32", color: "بيج سفاري", colorHex: "#C2B280", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80", barcode: "20010030018", central: 25, b1: 10, b2: 8 },
        { size: "34", color: "بيج سفاري", colorHex: "#C2B280", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80", barcode: "20010030019", central: 25, b1: 10, b2: 8 },
      ],
    },
    {
      sku: "BAZ-JNS-01",
      nameAr: "بنطلون جينز وايد ليج بوي فريند تركي",
      catSlug: "jeans-cargo",
      basePrice: 750,
      costPrice: 390,
      material: "دينم تركي ثقيل 100% قطن صامد لا يتسع مع اللبس",
      featuredImage: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80",
      variants: [
        // أزرق ثلجي
        { size: "31", color: "أزرق ثلجي مغسول", colorHex: "#5B84B1", image: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80", barcode: "20010030021", central: 20, b1: 8, b2: 6 },
        { size: "32", color: "أزرق ثلجي مغسول", colorHex: "#5B84B1", image: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80", barcode: "20010030022", central: 30, b1: 12, b2: 10 },
        { size: "34", color: "أزرق ثلجي مغسول", colorHex: "#5B84B1", image: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80", barcode: "20010030023", central: 30, b1: 12, b2: 10 },
        { size: "36", color: "أزرق ثلجي مغسول", colorHex: "#5B84B1", image: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80", barcode: "20010030024", central: 20, b1: 8, b2: 6 },
        // أزرق داكن إنديجو
        { size: "32", color: "أزرق إنديجو غامق", colorHex: "#1B2A47", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80", barcode: "20010030025", central: 25, b1: 10, b2: 8 },
        { size: "34", color: "أزرق إنديجو غامق", colorHex: "#1B2A47", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80", barcode: "20010030026", central: 25, b1: 10, b2: 8 },
        // أسود كربون مغسول
        { size: "32", color: "أسود كربون مغسول", colorHex: "#2B2B2B", image: "https://images.unsplash.com/photo-1584865288642-42078afe6942?auto=format&fit=crop&w=800&q=80", barcode: "20010030027", central: 20, b1: 8, b2: 6 },
        { size: "34", color: "أسود كربون مغسول", colorHex: "#2B2B2B", image: "https://images.unsplash.com/photo-1584865288642-42078afe6942?auto=format&fit=crop&w=800&q=80", barcode: "20010030028", central: 20, b1: 8, b2: 6 },
      ],
    },
    {
      sku: "BAZ-HDY-01",
      nameAr: "هودي أوفر سايز ميلتون 3 فتلة مبطن فرو ناعم",
      catSlug: "hoodies-sweats",
      basePrice: 790,
      costPrice: 410,
      material: "ميلتون قطن 3 فتلة 380 جرام مبطن فرو حراري فائق النعومة",
      featuredImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
      variants: [
        // أسود ملكي
        { size: "M", color: "أسود ملكي", colorHex: "#111111", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80", barcode: "20010040011", central: 25, b1: 10, b2: 8 },
        { size: "L", color: "أسود ملكي", colorHex: "#111111", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80", barcode: "20010040012", central: 35, b1: 15, b2: 12 },
        { size: "XL", color: "أسود ملكي", colorHex: "#111111", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80", barcode: "20010040013", central: 30, b1: 12, b2: 10 },
        // رمادي شاركول
        { size: "M", color: "رمادي شاركول", colorHex: "#36454F", image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80", barcode: "20010040014", central: 20, b1: 8, b2: 6 },
        { size: "L", color: "رمادي شاركول", colorHex: "#36454F", image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80", barcode: "20010040015", central: 30, b1: 12, b2: 10 },
        { size: "XL", color: "رمادي شاركول", colorHex: "#36454F", image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80", barcode: "20010040016", central: 25, b1: 10, b2: 8 },
        // بيج كريمي
        { size: "L", color: "بيج كافيه", colorHex: "#E1D4C0", image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80", barcode: "20010040017", central: 25, b1: 10, b2: 8 },
        { size: "XL", color: "بيج كافيه", colorHex: "#E1D4C0", image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80", barcode: "20010040018", central: 20, b1: 8, b2: 6 },
      ],
    },
    {
      sku: "BAZ-SHT-01",
      nameAr: "قميص كتان بيور كاجوال ياقة صيني",
      catSlug: "casual-shirts",
      basePrice: 650,
      costPrice: 320,
      material: "كتان تركي طبيعي 100% مغسول ضد التجاعيد",
      featuredImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
      variants: [
        // أوف وايت
        { size: "M", color: "أوف وايت نقي", colorHex: "#FAF9F6", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80", barcode: "20010020011", central: 25, b1: 10, b2: 8 },
        { size: "L", color: "أوف وايت نقي", colorHex: "#FAF9F6", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80", barcode: "20010020012", central: 30, b1: 12, b2: 10 },
        { size: "XL", color: "أوف وايت نقي", colorHex: "#FAF9F6", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80", barcode: "20010020013", central: 25, b1: 10, b2: 8 },
        // كحلي ليلي
        { size: "M", color: "كحلي ليلي", colorHex: "#0B1D3A", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80", barcode: "20010020014", central: 25, b1: 10, b2: 8 },
        { size: "L", color: "كحلي ليلي", colorHex: "#0B1D3A", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80", barcode: "20010020015", central: 35, b1: 15, b2: 12 },
        { size: "XL", color: "كحلي ليلي", colorHex: "#0B1D3A", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80", barcode: "20010020016", central: 30, b1: 12, b2: 10 },
        // زيتي باستيل
        { size: "L", color: "زيتي مينت", colorHex: "#4A5D4E", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80", barcode: "20010020017", central: 20, b1: 8, b2: 6 },
        { size: "XL", color: "زيتي مينت", colorHex: "#4A5D4E", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80", barcode: "20010020018", central: 20, b1: 8, b2: 6 },
      ],
    },
    {
      sku: "BAZ-BLZ-01",
      nameAr: "بليزر كاجوال إيطالي سليم فيت",
      catSlug: "blazers-jackets",
      basePrice: 1250,
      costPrice: 650,
      material: "صوف مخلوط ليكرا مرن مبطن ستان بريميوم",
      featuredImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
      variants: [
        // كحلي كلاسيك
        { size: "48", color: "كحلي كلاسيك", colorHex: "#0D1B2A", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80", barcode: "20010050011", central: 15, b1: 5, b2: 4 },
        { size: "50", color: "كحلي كلاسيك", colorHex: "#0D1B2A", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80", barcode: "20010050012", central: 20, b1: 8, b2: 6 },
        { size: "52", color: "كحلي كلاسيك", colorHex: "#0D1B2A", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80", barcode: "20010050013", central: 20, b1: 8, b2: 6 },
        // رمادي إيطالي
        { size: "50", color: "رمادي إيطالي", colorHex: "#4A4E5A", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80", barcode: "20010050014", central: 15, b1: 6, b2: 5 },
        { size: "52", color: "رمادي إيطالي", colorHex: "#4A4E5A", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80", barcode: "20010050015", central: 15, b1: 6, b2: 5 },
        // أسود سهرة
        { size: "50", color: "أسود سهرة فخم", colorHex: "#111111", image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80", barcode: "20010050016", central: 15, b1: 6, b2: 4 },
        { size: "52", color: "أسود سهرة فخم", colorHex: "#111111", image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80", barcode: "20010050017", central: 15, b1: 6, b2: 4 },
      ],
    },
    {
      sku: "BAZ-SNK-01",
      nameAr: "سنيكرز كاجوال جلد طبيعي نعل فوم طبي مريح",
      catSlug: "sneakers",
      basePrice: 850,
      costPrice: 450,
      material: "جلد طبيعي فائق النعومة مع نعل خفيف ممتص للصدمات",
      featuredImage: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
      variants: [
        // أبيض ملكي حقيقي 100%
        { size: "41", color: "أبيض ملكي بيور", colorHex: "#FFFFFF", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80", barcode: "20010070011", central: 15, b1: 6, b2: 5 },
        { size: "42", color: "أبيض ملكي بيور", colorHex: "#FFFFFF", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80", barcode: "20010070012", central: 25, b1: 10, b2: 8 },
        { size: "43", color: "أبيض ملكي بيور", colorHex: "#FFFFFF", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80", barcode: "20010070013", central: 30, b1: 12, b2: 10 },
        { size: "44", color: "أبيض ملكي بيور", colorHex: "#FFFFFF", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80", barcode: "20010070014", central: 20, b1: 8, b2: 6 },
        { size: "45", color: "أبيض ملكي بيور", colorHex: "#FFFFFF", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80", barcode: "20010070015", central: 10, b1: 4, b2: 3 },
        // أسود تريبل بلاك
        { size: "42", color: "أسود تريبل بلاك", colorHex: "#111111", image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80", barcode: "20010070016", central: 20, b1: 8, b2: 6 },
        { size: "43", color: "أسود تريبل بلاك", colorHex: "#111111", image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80", barcode: "20010070017", central: 25, b1: 10, b2: 8 },
        { size: "44", color: "أسود تريبل بلاك", colorHex: "#111111", image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80", barcode: "20010070018", central: 18, b1: 7, b2: 5 },
        // هافان جملي حقيقي
        { size: "42", color: "هافان جملي أصلي", colorHex: "#A0522D", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80", barcode: "20010070019", central: 15, b1: 6, b2: 5 },
        { size: "43", color: "هافان جملي أصلي", colorHex: "#A0522D", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80", barcode: "20010070020", central: 20, b1: 8, b2: 6 },
      ],
    },
    {
      sku: "BAZ-JKT-01",
      nameAr: "جاكت فارستي كوليدج ستريت وير فينتدج",
      catSlug: "blazers-jackets",
      basePrice: 1100,
      costPrice: 580,
      material: "جوخ ثقيل مطعم بأكمام جلد فاخرة وأزرار كبس",
      featuredImage: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
      variants: [
        // أخضر فينتدج
        { size: "L", color: "أخضر فارستي فينتدج", colorHex: "#1B4D3E", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80", barcode: "20010080011", central: 20, b1: 8, b2: 6 },
        { size: "XL", color: "أخضر فارستي فينتدج", colorHex: "#1B4D3E", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80", barcode: "20010080012", central: 25, b1: 10, b2: 8 },
        // أسود وبومبر
        { size: "L", color: "أسود تريبل بومبر", colorHex: "#111111", image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80", barcode: "20010080013", central: 20, b1: 8, b2: 6 },
        { size: "XL", color: "أسود تريبل بومبر", colorHex: "#111111", image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80", barcode: "20010080014", central: 20, b1: 8, b2: 6 },
      ],
    },
    {
      sku: "BAZ-ACC-01",
      nameAr: "كاب ستريت وير بيسبول تطريز بارز",
      catSlug: "accessories",
      basePrice: 280,
      costPrice: 120,
      material: "قطن جبردين مع حزام ضبط خلفي معدني",
      featuredImage: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
      variants: [
        { size: "Free", color: "أسود مات", colorHex: "#111111", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80", barcode: "20010090011", central: 50, b1: 20, b2: 20 },
        { size: "Free", color: "بيج ترابي", colorHex: "#C2B280", image: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=800&q=80", barcode: "20010090012", central: 30, b1: 15, b2: 15 },
      ],
    },
    {
      sku: "BAZ-ACC-02",
      nameAr: "شنطة كروس كاجوال ووتر بروف متعددة الجيوب",
      catSlug: "accessories",
      basePrice: 380,
      costPrice: 180,
      material: "نايلون أكسفورد ووتر بروف بسحابات مقاومة للماء",
      featuredImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      variants: [
        { size: "Standard", color: "أسود تكتيكال", colorHex: "#1C1C1C", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", barcode: "20010090021", central: 40, b1: 15, b2: 15 },
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
        featuredImage: p.featuredImage,
        isFeatured: true,
      },
      create: {
        sku: p.sku,
        nameAr: p.nameAr,
        categoryId: catId,
        basePrice: p.basePrice,
        costPrice: p.costPrice,
        material: p.material,
        featuredImage: p.featuredImage,
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
          image: v.image,
          priceOverride: p.basePrice,
          costPriceOverride: p.costPrice,
          stockCentral: v.central,
        },
        create: {
          productId: product.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          image: v.image,
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

  console.log("🎉 Successfully seeded 10 rich product categories with color-matched images!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
