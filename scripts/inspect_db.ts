import { prisma } from '../lib/prisma';

async function main() {
  const prods = await prisma.product.findMany({
    include: { category: true, variants: true }
  });
  console.log(`Found ${prods.length} products:`);
  for (const p of prods) {
    console.log(`- ${p.nameAr} | SKU: ${p.sku} | Price: ${p.basePrice} | Cost: ${p.costPrice} | Cat: ${p.category?.nameAr} | Variants: ${p.variants.length}`);
  }
}

main().catch(console.error).finally(() => process.exit(0));
