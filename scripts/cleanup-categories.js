const { Pool } = require('pg');
require('dotenv').config();

const rawUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_qM3DvELFcx2s@ep-spring-sun-bad8irla-pooler.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new Pool({ connectionString: rawUrl, ssl: { rejectUnauthorized: false } });

async function cleanup() {
  const client = await pool.connect();
  try {
    console.log('--- Fetching all categories ---');
    const allCatsRes = await client.query('SELECT id, "nameAr", slug, "sortOrder", "isActive" FROM "Category" ORDER BY "sortOrder" ASC');
    console.log('Total categories in DB:', allCatsRes.rows.length);
    allCatsRes.rows.forEach(r => console.log(`${r.id} | ${r.nameAr} | slug: ${r.slug} | sort: ${r.sortOrder}`));

    // Old categories to remove
    const oldSlugs = [
      'oversized-tees',
      'casual-shirts',
      'jeans-cargo',
      'hoodies-sweats',
      'blazers-jackets',
      'shorts-sweatpants',
      'sneakers',
      'accessories'
    ];

    // Mapping old categories to new ones for any attached products
    const mapping = {
      'oversized-tees': 't-shirts',
      'casual-shirts': 'shirts',
      'jeans-cargo': 'pants',
      'hoodies-sweats': 'hoodies',
      'blazers-jackets': 'jackets',
      'shorts-sweatpants': 'pants',
      'sneakers': 'shoes',
      'accessories': 't-shirts'
    };

    console.log('\n--- Remapping products from old categories to new ones ---');
    for (const [oldSlug, newSlug] of Object.entries(mapping)) {
      const oldCat = allCatsRes.rows.find(c => c.slug === oldSlug);
      const newCat = allCatsRes.rows.find(c => c.slug === newSlug);
      if (oldCat && newCat) {
        const updateRes = await client.query(
          'UPDATE "Product" SET "categoryId" = $1 WHERE "categoryId" = $2',
          [newCat.id, oldCat.id]
        );
        if (updateRes.rowCount > 0) {
          console.log(`Remapped ${updateRes.rowCount} product(s) from [${oldCat.nameAr}] to [${newCat.nameAr}]`);
        }
      }
    }

    console.log('\n--- Deleting old categories ---');
    for (const slug of oldSlugs) {
      const cat = allCatsRes.rows.find(c => c.slug === slug);
      if (cat) {
        await client.query('DELETE FROM "Category" WHERE id = $1', [cat.id]);
        console.log(`Deleted old category: ${cat.nameAr} (${cat.slug})`);
      }
    }

    // Reorder new official categories nicely
    const officialOrder = [
      'pants',        // بنطلون
      'jackets',      // جاكيت
      'hoodies',      // هودي
      'pullovers',    // بوكليت
      'vests',        // فيست
      'tracksuits',   // ترينينج سوت
      'undershirts',  // بوكليت (اندر شيرت)
      'shoes',        // شوز
      't-shirts',     // تيشرتات
      'shirts'        // قمصان
    ];

    console.log('\n--- Re-ordering official categories ---');
    for (let i = 0; i < officialOrder.length; i++) {
      const slug = officialOrder[i];
      await client.query('UPDATE "Category" SET "sortOrder" = $1, "isActive" = true WHERE slug = $2', [i + 1, slug]);
    }

    const finalRes = await client.query('SELECT id, "nameAr", slug, "sortOrder", "isActive" FROM "Category" WHERE "isActive" = true ORDER BY "sortOrder" ASC');
    console.log('\n--- Final active official categories ---');
    finalRes.rows.forEach(r => console.log(`${r.sortOrder}. ${r.nameAr} (${r.slug})`));

  } finally {
    client.release();
    await pool.end();
  }
}

cleanup().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
