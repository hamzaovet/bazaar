import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Adding/updating Bazaar official categories...");

  const officialCategories = [
    { slug: "pants", nameAr: "بنطلون", nameEn: "Pants & Jeans", icon: "Layers", sortOrder: 1 },
    { slug: "jackets", nameAr: "جاكيت", nameEn: "Jackets & Blazers", icon: "Briefcase", sortOrder: 2 },
    { slug: "hoodies", nameAr: "هودي", nameEn: "Hoodies & Sweatshirts", icon: "Flame", sortOrder: 3 },
    { slug: "pullovers", nameAr: "بوكليت", nameEn: "Pullovers & Sweaters", icon: "Shirt", sortOrder: 4 },
    { slug: "vests", nameAr: "فيست", nameEn: "Vests", icon: "Shirt", sortOrder: 5 },
    { slug: "tracksuits", nameAr: "ترينينج سوت", nameEn: "Tracksuits", icon: "Activity", sortOrder: 6 },
    { slug: "undershirts", nameAr: "بوكليت (اندر شيرت)", nameEn: "Undershirts", icon: "Shirt", sortOrder: 7 },
    { slug: "shoes", nameAr: "شوز", nameEn: "Shoes & Sneakers", icon: "Footprints", sortOrder: 8 },
    { slug: "t-shirts", nameAr: "تيشرتات", nameEn: "T-Shirts", icon: "Shirt", sortOrder: 9 },
    { slug: "shirts", nameAr: "قمصان", nameEn: "Shirts", icon: "Shirt", sortOrder: 10 },
  ];

  for (const c of officialCategories) {
    const res = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        icon: c.icon,
        sortOrder: c.sortOrder,
        isActive: true,
      },
      create: {
        slug: c.slug,
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        icon: c.icon,
        sortOrder: c.sortOrder,
        isActive: true,
      },
    });
    console.log(`✅ Category [${res.nameAr}] (${res.slug}) saved.`);
  }

  console.log("🎉 All Bazaar Categories ready!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  });
