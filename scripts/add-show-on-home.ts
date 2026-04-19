import 'dotenv/config';
import { query } from '../backend/db.js';

async function run() {
  await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN DEFAULT false');
  await query("UPDATE properties SET show_on_home = true WHERE is_featured = true");
  console.log('Column added and data migrated');
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
