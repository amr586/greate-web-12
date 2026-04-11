import 'dotenv/config';
import { query } from './db.js';

async function migrate() {
  console.log('Running migration...');
  await query("ALTER TABLE properties ADD COLUMN IF NOT EXISTS rooms INTEGER");
  await query("ALTER TABLE properties ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0");
  await query("ALTER TABLE properties ADD COLUMN IF NOT EXISTS description_ar TEXT");
  await query("UPDATE properties SET rooms = bedrooms WHERE rooms IS NULL");
  await query("ALTER TABLE property_images ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0");
  await query("ALTER TABLE properties ADD COLUMN IF NOT EXISTS city VARCHAR(100)");
  // Set Alexandria city for old properties (those with Alex districts)
  await query(`UPDATE properties SET city = 'الإسكندرية' WHERE city IS NULL AND district IN ('سيدي جابر','جليم','ستانلي','سموحة','المندرة','العجمي','المنتزه','كليوباترا','الأنفوشي','الميناء','الدخيلة','برج العرب','محطة الرمل')`);
  // Set Cairo city for Cairo districts
  await query(`UPDATE properties SET city = 'القاهرة' WHERE city IS NULL AND district IN ('التجمع الخامس','جولدن سكوير','العاصمة الإدارية','التجمع السادس','مصر الجديدة','الشيخ زايد','النرجس الجديدة','الرحاب','طريق السويس','النورث هاوس','بيت الوطن','شمال الرحاب')`);
  // Fallback for any remaining
  await query(`UPDATE properties SET city = 'القاهرة' WHERE city IS NULL`);
  console.log('Migration done!');
  process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
