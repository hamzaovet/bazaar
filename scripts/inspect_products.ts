import { prisma } from "../lib/prisma";

async function main() {
  const count = await prisma.product.count();
  const sample = await prisma.product.findMany({
    take: 10,
    select: { id: true, nameAr: true, sku: true, basePrice: true, costPrice: true, featuredImage: true, categoryId: true },
  });
  console.log(`Total Products in DB: ${count}`);
  console.log("Sample Products:", JSON.stringify(sample, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
