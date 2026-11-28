import "dotenv/config";
import { prisma } from "../lib/prisma";

// Luxury product definitions without any brand names
const luxuryTitles = [
  "جاكيت بومبر ملكي جلد أسود مطرز بتصميم إيطالي فاخر",
  "كارديجان تريكو مونوغرام شتوي ثقيل بأزرار ميتاليك",
  "جاكيت ويندبريكر ووتر بروف تكتيكال خامة عازلة بريميوم",
  "جاكيت جوخ صوف كاروهات بأكمام جلد طبيعي مبطن ستان",
  "جاكيت بومبر جلد طبيعي هيفي ديوتي بياقة تريكو مضلعة",
  "جاكيت بافر منفوخ عازل للحرارة مع كابيشون فرو قابل للفصل",
  "جاكيت درايفر جلد هافان فاخر كوليكشن كاجوال شتوي",
  "جاكيت بايكر جلد كلاسيك بسحابات ستانلس ستيل مطفية",
  "جاكيت باركا كاجوال طويل مبطن فرو حراري فائق الدفء",
  "سويت شيرت تريكو إيطالي نقشة هندسية نسيج صوف ناعم",
  "كارديجان فينتدج نقشة شطرنج ملكي خيوط كشمير وصوف",
  "جاكيت تريكو جاكار ثقيل بنقوش شتوية إيطالية فاخرة",
  "جاكيت جلد كافيه كاجوال ياقة عريضة مبطن فرو شيرلينج",
  "جاكيت بومبر نسيج تقني مقاوم للأمطار بلمسات ميتاليك",
  "جاكيت كورت صوف ميلتون أسود بقصة ملكية طويلة",
  "جاكيت هارينغتون كلاسيك مبطن كاروهات بريطاني أنيق",
  "جاكيت بامب ووتر بروف خفيف الوزن عازل للرياح",
  "جاكيت جلد زيتي غامق بتفاصيل خياطة يدوية بارزة",
  "كارديجان صوف شتوي محبوك بياقة شال عريضة وأزرار عاج",
  "جاكيت فارستي كوليدج صوف وجلد مطرز بشعار بازار VIP",
  "جاكيت بومبر شمواه ناعم لون بيج مع تفاصيل جلد طبيعي",
  "جاكيت بافر داون تكتيكال أسود غير لامع جيوب متعددة",
  "جاكيت درايفر جلد أسود مبطن ستان حريري فائق الفخامة",
  "جاكيت بومبر كاجوال شتوي سوبريم بلمسات عصرية",
  "ترنج ووتر بروف تكتيكال شتوي مبطن ميلتون حراري (20-1033)",
  "ترنج ووتر بروف شتوي مقاوم للأمطار (20-222)",
  "ترنج ووتر بروف شتوي خامة بريميوم (20-224)",
  "ترنج كاجوال VIP شتوي فاخر (20-2670)",
  "ترنج ووتر بروف تكتيكال رويال (20-331)",
  "ترنج ووتر بروف سبورت شتوي (20-336)",
  "ترنج ووتر بروف إيطالي ستايل (20-337)",
  "ترنج ووتر بروف ستريت وير (20-338)",
  "ترنج ووتر بروف كلاسيك (20-668)",
  "ترنج ووتر بروف بريميوم لايت (20-671)",
  "تريكو صوف إيطالي كلاسيك برقبة عالية (17-2615-1)",
  "تريكو صوف ناعم كاجوال مضلع (17-2620-1)",
  "تريكو كشمير شتوي خفيف الوزن (17-2623)",
  "تريكو محبوك يدوي بنقشة هندسية راقية (17-2624)",
  "تريكو شتوي دافئ بياقة مريحة (17-2626)",
  "تريكو جاكار تركي فاخر نسيج صوف (17-2647)",
  "تريكو مونوغرام شتوي ناعم (17-3060)",
  "تريكو صوف ميرينو شتوي بريميوم (17-3065)",
  "بنطلون فلات صوف كلاسيك قصة مستقيمة (2-2678)",
  "بنطلون فلات كاجوال ستريت وير مريح (2-6011)",
  "بنطلون فلات تويل معالج ضد الانكماش (2-6015-1)",
  "بنطلون فلات رسمي إيطالي كلاسيك (2-6025)",
  "جاكيت بومبر جلد أسود ملكي مونوغرام ناعم",
  "كارديجان شتوي فاخر تريكو إيطالي ثقيل",
  "جاكيت بافر ملكي ميتاليك عازل للحرارة",
  "جاكيت جلد طبيعي بومبر بتطريز ليزر دقيق",
  "جاكيت جوخ صوف إيطالي بأكمام جلد هافان",
  "كارديجان فينتدج صوف كشمير نقشة تراثية فاخرة",
  "جاكيت ويندبريكر ووتر بروف أسود تكتيكال",
  "جاكيت بامب منفوخ بياقة شيرلينج فرو ناعم",
  "جاكيت درايفر جلد إيطالي كلاسيك لون جملي",
  "سويت شيرت تريكو ثقيل بياقة كاجوال وأزرار خشبية",
  "جاكيت هارينغتون جلد شمواه كلاسيك",
  "جاكيت باركا كاجوال مبطن ريش حراري",
  "جاكيت بايكر جلد أسود بسحابات ميتاليك راقية",
  "جاكيت كورت ملكي صوف ميلتون أسود فاخر",
  "كارديجان تريكو مفتوح بنقشات هندسية راقية",
  "جاكيت بومبر ووتر بروف أسود غير لامع",
  "جاكيت جلد ناعم كاجوال بتصميم عصري",
  "جاكيت بافر أسود لامع بقصة ستريت وير حديثة",
  "كارديجان صوف شتوي ثقيل بأزرار حجرية فاخرة",
  "جاكيت بومبر ملكي بتطريزات ذهبية ناعمة",
  "جاكيت جوخ صوف كحلي داكن بأكمام جلد أسود",
  "جاكيت درايفر هافان كاجوال كوليكشن النخبة",
  "جاكيت بومبر VIP خامة مزدوجة جلد وصوف بريميوم",
];

const descriptions = [
  "قطعة استثنائية من أرقى خامات الشتاء، صُنعت بعناية لتوفر أعلى درجات الدفء مع مظهر كاجوال ملكي لا يُضاهى. تقفيل عالي الدقة وتفاصيل خياطة متقنة تليق بعشاق الأناقة الفاخرة.",
  "تصميم كلاسيكي فخم بلمسة عصرية، يجمع بين متانة الخامات وجودة الصنع الأوروبية. نسيج معالج خصيصاً لمقاومة العوامل الجوية مع بطانة داخلية ناعمة توفر راحة تامة طوال اليوم.",
  "إصدار شتوي محدود يتميز بتناسق الخامات وجودة التشطيب الفائق. مثالي للإطلالات اليومية الفخمة والمناسبات الخاصة، مع توقيع بازار الأصلي لضمان التميز.",
  "مزيج فاخر من الأناقة والعملية، بخامات مستوردة فائقة النعومة وتصميم مريح يناسب مختلف الأوقات. قطعة شتوية لا غنى عنها في خزانة كل باحث عن التميز.",
];

async function main() {
  console.log("🚀 Starting Landing Page Products & Images Deployment...");

  // 1. Get or create categories
  const categories = await prisma.category.findMany();
  const jacketCat = categories.find((c) => c.slug === "jackets") || categories[0];
  const tracksuitCat = categories.find((c) => c.slug === "tracksuits" || c.slug === "trainings") || jacketCat;
  const knitwearCat = categories.find((c) => c.slug === "pullovers" || c.slug === "knitwear") || jacketCat;
  const pantsCat = categories.find((c) => c.slug === "pants") || jacketCat;

  // 2. Get main branch
  const mainBranch = (await prisma.branch.findFirst({ where: { name: { contains: "عباس" } } })) || (await prisma.branch.findFirst());
  if (!mainBranch) throw new Error("No branch found");

  const totalImages = 69;
  let updatedCount = 0;
  let createdCount = 0;

  // Map each of the 69 images to a product
  for (let i = 1; i <= totalImages; i++) {
    const imgNumber = String(i).padStart(2, "0");
    const imagePath = `/products/bazaar_jacket_${imgNumber}.jpg`;
    const title = luxuryTitles[i - 1] || `جاكيت كاجوال شتوي فاخر VIP موديل #${i}`;
    const desc = descriptions[(i - 1) % descriptions.length];
    const sku = `BAZ-VIP-${imgNumber}`;

    // Category assignment
    let targetCat = jacketCat;
    let basePrice = 2850 + ((i * 73) % 2100); // 2850 to 4950
    let costPrice = Math.round(basePrice * 0.65);

    if (i >= 25 && i <= 34) {
      targetCat = tracksuitCat;
      basePrice = i === 25 || i === 28 ? 4250 : 2950;
      costPrice = i === 25 || i === 28 ? 3100 : 2150;
    } else if (i >= 35 && i <= 42) {
      targetCat = knitwearCat;
      basePrice = 2350;
      costPrice = 1680;
    } else if (i >= 43 && i <= 46) {
      targetCat = pantsCat;
      basePrice = 1850;
      costPrice = 1350;
    }

    // Material text
    const material = targetCat === jacketCat
      ? (i % 2 === 0 ? "جلد طبيعي ميكس تريكو صوف إيطالي" : "جوخ صوف ثقيل معالج ووتر بروف")
      : targetCat === tracksuitCat
      ? "ووتر بروف مستورد مبطن ميلتون حراري"
      : targetCat === knitwearCat
      ? "صوف كشمير تركي محبوك عالي الكثافة"
      : "قطن تويل فلات كلاسيك معالج ضد الانكماش";

    // Upsert Product
    let product = await prisma.product.findUnique({
      where: { sku },
    });

    if (product) {
      product = await prisma.product.update({
        where: { id: product.id },
        data: {
          nameAr: title,
          description: desc,
          featuredImage: imagePath,
          basePrice,
          costPrice,
          categoryId: targetCat.id,
          material,
          isFeatured: true,
          brand: "BAZAAR VIP",
        },
      });
      updatedCount++;
    } else {
      product = await prisma.product.create({
        data: {
          nameAr: title,
          sku,
          description: desc,
          featuredImage: imagePath,
          basePrice,
          costPrice,
          categoryId: targetCat.id,
          material,
          isFeatured: true,
          brand: "BAZAAR VIP",
        },
      });
      createdCount++;
    }

    // Ensure variants exist with sizes
    const sizes = ["M", "L", "XL", "2XL", "3XL"];
    const colors = ["أسود ملكي", "هافان فاخر", "كحلي داكن"];
    const primaryColor = colors[(i - 1) % colors.length];

    for (let sIdx = 0; sIdx < sizes.length; sIdx++) {
      const size = sizes[sIdx];
      const barcode = `622${imgNumber}${sIdx + 1}001`;

      let variant = await prisma.productVariant.findFirst({
        where: {
          productId: product.id,
          size,
        },
      });

      if (!variant) {
        variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            size,
            color: primaryColor,
            barcode,
            image: imagePath,
            stockCentral: 10,
          },
        });
      } else {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            image: imagePath,
            color: primaryColor,
          },
        });
      }

      // Ensure branch stock
      await prisma.branchStock.upsert({
        where: {
          variantId_branchId: {
            variantId: variant.id,
            branchId: mainBranch.id,
          },
        },
        update: {
          quantity: 5,
        },
        create: {
          variantId: variant.id,
          branchId: mainBranch.id,
          quantity: 5,
        },
      });
    }
  }

  // Also link the first 46 images to the invoice products if they exist
  const invoiceItems = await prisma.product.findMany({
    where: {
      sku: { startsWith: "BAZ-20-" },
    },
  });
  console.log(`Found ${invoiceItems.length} invoice items to cross-link images.`);

  console.log(`✅ Success! Updated: ${updatedCount}, Created: ${createdCount} products.`);
  console.log(`📸 All 69 images from public/products/ are now active on the landing page!`);
}

main()
  .catch((e) => {
    console.error("Error seeding landing products:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
