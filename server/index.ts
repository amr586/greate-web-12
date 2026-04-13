import 'dotenv/config';
import bcrypt from 'bcryptjs';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import propertiesRouter from './routes/properties.js';
import adminRouter from './routes/admin.js';
import aiChatRouter from './routes/ai-chat.js';
import supportRouter from './routes/support.js';
import paymentsRouter from './routes/payments.js';
import uploadRouter from './routes/upload.js';
import notificationsRouter from './routes/notifications.js';
import propertyChatRouter from './routes/property-chat.js';
import contactRouter from './routes/contact.js';
import { query } from './db.js';

async function runMigrations() {
  try {
    // Create core tables
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200) UNIQUE NOT NULL,
        phone VARCHAR(30),
        password_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','admin','superadmin')),
        sub_role VARCHAR(30),
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300),
        title_ar VARCHAR(300),
        description TEXT,
        description_ar TEXT,
        type VARCHAR(50),
        purpose VARCHAR(20) DEFAULT 'sale',
        price NUMERIC,
        area NUMERIC,
        rooms INTEGER,
        bedrooms INTEGER,
        bathrooms INTEGER,
        floor INTEGER,
        address TEXT,
        district VARCHAR(100),
        city VARCHAR(100),
        contact_phone VARCHAR(20) DEFAULT '01100111618',
        owner_id INTEGER REFERENCES users(id),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','sold')),
        is_featured BOOLEAN DEFAULT false,
        views INTEGER DEFAULT 0,
        has_parking BOOLEAN DEFAULT false,
        has_elevator BOOLEAN DEFAULT false,
        has_garden BOOLEAN DEFAULT false,
        has_pool BOOLEAN DEFAULT false,
        is_furnished BOOLEAN DEFAULT false,
        approved_by INTEGER,
        approved_at TIMESTAMPTZ,
        sold_to INTEGER,
        sold_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS property_images (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS saved_properties (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, property_id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50),
        title VARCHAR(300),
        message TEXT,
        property_data JSONB,
        user_data JSONB,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS payment_requests (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id),
        buyer_id INTEGER REFERENCES users(id),
        amount NUMERIC,
        payment_method VARCHAR(50),
        notes TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        processed_by INTEGER,
        processed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        subject TEXT,
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS support_messages (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id),
        content TEXT,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS property_chat_messages (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id),
        content TEXT,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200),
        email VARCHAR(200),
        phone VARCHAR(30),
        subject VARCHAR(300),
        message TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(200) NOT NULL,
        code VARCHAR(6) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('register', 'login', 'forgot-password')),
        user_data JSONB,
        attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMPTZ,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT false,
        last_sent_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS admin_emails (
        id SERIAL PRIMARY KEY,
        email VARCHAR(200) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Add any missing columns to existing tables
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20) DEFAULT \'01100111618\'');
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS description_ar TEXT');
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS city VARCHAR(100)');
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS rooms INTEGER');
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0');
    await query('ALTER TABLE property_images ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0');
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_parking BOOLEAN DEFAULT false');
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_elevator BOOLEAN DEFAULT false');
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_garden BOOLEAN DEFAULT false');
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_pool BOOLEAN DEFAULT false');
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_furnished BOOLEAN DEFAULT false');
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false');
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS down_payment VARCHAR(100)');
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(100)');
    await query("ALTER TABLE properties ADD COLUMN IF NOT EXISTS finishing_type VARCHAR(50)");
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor_plan_image TEXT');
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS google_maps_url TEXT');
    await query("ALTER TABLE properties ALTER COLUMN purpose DROP DEFAULT");
    try { await query("ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_purpose_check"); } catch {}
    try { await query("ALTER TABLE properties ADD CONSTRAINT properties_purpose_check CHECK (purpose IN ('sale','rent','resale'))"); } catch {}
    await query("ALTER TABLE properties ALTER COLUMN purpose SET DEFAULT 'sale'");
    await query('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT');
    await query("ALTER TABLE payment_requests ADD COLUMN IF NOT EXISTS screenshot_url TEXT");
    await query("ALTER TABLE payment_requests ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20)");
    await query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_basement BOOLEAN DEFAULT false');

    // Seed default accounts (use ON CONFLICT DO NOTHING to be idempotent)
    const seedAccounts = [
      { name: 'Super Admin', email: 'admin@greatsociety.com', phone: '01100111618', password: 'Admin@GreatSociety1', role: 'superadmin', sub_role: null },
      { name: 'مدخل بيانات', email: 'dataentry@greatsociety.com', phone: '01100111619', password: 'DataEntry@123', role: 'admin', sub_role: 'data_entry' },
      { name: 'مدير عقارات', email: 'propmanager@greatsociety.com', phone: '01100111620', password: 'PropMgr@123', role: 'admin', sub_role: 'property_manager' },
      { name: 'دعم فني', email: 'support@greatsociety.com', phone: '01100111621', password: 'Support@123', role: 'admin', sub_role: 'support' },
      { name: 'مستخدم تجريبي', email: 'user@greatsociety.com', phone: '01100111622', password: 'User@123', role: 'user', sub_role: null },
    ];
    for (const acc of seedAccounts) {
      const exists = await query('SELECT id FROM users WHERE email=$1', [acc.email]);
      if (exists.rows.length === 0) {
        const hash = await bcrypt.hash(acc.password, 10);
        await query(
          `INSERT INTO users (name, email, phone, password_hash, role, sub_role) VALUES ($1,$2,$3,$4,$5,$6)`,
          [acc.name, acc.email, acc.phone, hash, acc.role, acc.sub_role]
        );
        console.log(`[migration] created account: ${acc.email}`);
      }
    }

    // Seed featured properties
    const featuredSeed = [
      {
        title: 'Suez Road Finished Apartment',
        title_ar: 'شقة 3 غرف متشطبة بالكامل - طريق السويس',
        description_ar: 'شقة 3 غرف متشطبة بالكامل بمقدم 750 ألف في أقوى لوكيشن على طريق السويس مباشرة جمب أول جامعة ومستشفى بريطانية في مصر. مبنية بنسبة إنشاءات 40% على أرض الواقع. للمعاينة والتفاصيل سجل بياناتك.',
        type: 'apartment',
        price: 3200000,
        area: 140,
        bedrooms: 3,
        bathrooms: 2,
        district: 'طريق السويس',
        city: 'القاهرة',
        address: 'طريق السويس مباشرة، جمب أول جامعة ومستشفى بريطانية في مصر',
        contact_phone: '01100111618',
        down_payment: '750,000 ج',
        delivery_status: 'مبنية بنسبة إنشاءات 40%',
        finishing_type: 'متشطبة بالكامل',
        google_maps_url: 'https://maps.google.com/?q=طريق+السويس+القاهرة',
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop',
        ],
      },
      {
        title: 'Fifth Settlement Villas & Apartments',
        title_ar: 'فيلات وشقق استلام فوري - قلب التجمع الخامس',
        description_ar: 'فيلات وشقق استلام فوري في قلب التجمع الخامس بمقدم 1.8 مليون وأقساط تصل إلى 10 سنوات. موقع فريد دقائق من التسعين الجنوبي ومطار القاهرة الدولي. فخامة وخصوصية وتصميم عصري مع واجهات مميزة.',
        type: 'villa',
        price: 18000000,
        area: 300,
        bedrooms: 4,
        bathrooms: 3,
        district: 'التجمع الخامس',
        city: 'القاهرة',
        address: 'قلب التجمع الخامس - دقائق من التسعين الجنوبي ومطار القاهرة',
        contact_phone: '01100111618',
        down_payment: '1,800,000 ج',
        delivery_status: 'استلام فوري',
        finishing_type: 'سوبر لوكس',
        google_maps_url: 'https://maps.google.com/?q=التجمع+الخامس+القاهرة',
        images: [
          'https://images.unsplash.com/photo-1512917774080-9ac466fb0635?w=800&h=500&fit=crop',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop',
        ],
      },
    ];

    for (const prop of featuredSeed) {
      const exists = await query('SELECT id FROM properties WHERE title_ar=$1', [prop.title_ar]);
      if (exists.rows.length === 0) {
        const res = await query(
          `INSERT INTO properties (title, title_ar, description_ar, type, price, area, bedrooms, bathrooms, district, city, address, contact_phone, down_payment, delivery_status, finishing_type, google_maps_url, status, is_featured, purpose)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'approved',true,'sale') RETURNING id`,
          [prop.title, prop.title_ar, prop.description_ar, prop.type, prop.price, prop.area, prop.bedrooms, prop.bathrooms, prop.district, prop.city, prop.address, prop.contact_phone, prop.down_payment, prop.delivery_status, prop.finishing_type, prop.google_maps_url]
        );
        const propId = res.rows[0].id;
        for (let i = 0; i < prop.images.length; i++) {
          await query(
            `INSERT INTO property_images (property_id, url, is_primary, order_index) VALUES ($1,$2,$3,$4)`,
            [propId, prop.images[i], i === 0, i]
          );
        }
        console.log(`[migration] seeded featured property: ${prop.title_ar}`);
      }
    }

    // Update property 2 (التجمع الخامس) images to be visually distinct from property 1
    const oldVillaImg = 'https://images.unsplash.com/photo-1512917774080-9ac466fb0635?w=800&h=500&fit=crop';
    const propTwoOld = await query(`SELECT id FROM property_images WHERE url = $1`, [oldVillaImg]);
    if (propTwoOld.rows.length > 0) {
      await query(`DELETE FROM property_images WHERE property_id = 2`);
      const newVillaImages = [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=500&fit=crop',
      ];
      for (let i = 0; i < newVillaImages.length; i++) {
        await query(
          `INSERT INTO property_images (property_id, url, is_primary, order_index) VALUES (2, $1, $2, $3)`,
          [newVillaImages[i], i === 0, i]
        );
      }
      console.log('[migration] updated property 2 images to villa theme');
    }

    console.log('[migration] all tables and columns ready');
  } catch (err) {
    console.error('[migration] error:', err);
  }
}

runMigrations();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai', aiChatRouter);
app.use('/api/support', supportRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/property-chat', propertyChatRouter);
app.use('/api/contact', contactRouter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'إسكنك API' }));

if (isProd) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏠 إسكنك API running on port ${PORT}`);
});
