import 'dotenv/config';
import { query } from './db.js';
import bcrypt from 'bcryptjs';

async function setup() {
  console.log('🗄️ Setting up database...');

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(200) UNIQUE NOT NULL,
      phone VARCHAR(20) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','admin','superadmin')),
      sub_role VARCHAR(50),
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER REFERENCES users(id),
      title VARCHAR(300) NOT NULL,
      title_ar VARCHAR(300),
      description TEXT,
      description_ar TEXT,
      type VARCHAR(50) NOT NULL,
      purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('sale','rent','resale')),
      price NUMERIC(15,2) NOT NULL,
      area NUMERIC(10,2),
      rooms INTEGER,
      bedrooms INTEGER,
      bathrooms INTEGER,
      floor INTEGER,
      total_floors INTEGER,
      district VARCHAR(100),
      city VARCHAR(100),
      address TEXT,
      contact_phone VARCHAR(30),
      down_payment VARCHAR(100),
      delivery_status VARCHAR(100),
      lat NUMERIC(10,7),
      lng NUMERIC(10,7),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','sold')),
      is_featured BOOLEAN DEFAULT false,
      approved_by INTEGER REFERENCES users(id),
      approved_at TIMESTAMPTZ,
      sold_to INTEGER REFERENCES users(id),
      sold_at TIMESTAMPTZ,
      sold_price NUMERIC(15,2),
      views INTEGER DEFAULT 0,
      has_parking BOOLEAN DEFAULT false,
      has_elevator BOOLEAN DEFAULT false,
      has_garden BOOLEAN DEFAULT false,
      has_pool BOOLEAN DEFAULT false,
      is_furnished BOOLEAN DEFAULT false,
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
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, property_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS payment_requests (
      id SERIAL PRIMARY KEY,
      property_id INTEGER REFERENCES properties(id),
      buyer_id INTEGER REFERENCES users(id),
      amount NUMERIC(15,2) NOT NULL,
      payment_method VARCHAR(20) CHECK (payment_method IN ('instapay','vodafone')),
      notes TEXT,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','completed','rejected')),
      processed_by INTEGER REFERENCES users(id),
      processed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      subject VARCHAR(300),
      status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','closed')),
      assigned_to INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS support_messages (
      id SERIAL PRIMARY KEY,
      ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
      sender_id INTEGER REFERENCES users(id),
      content TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(300) NOT NULL,
      message TEXT NOT NULL,
      property_data JSONB,
      user_data JSONB,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS admin_emails (
      id SERIAL PRIMARY KEY,
      email VARCHAR(200) NOT NULL UNIQUE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS property_chat_messages (
      id SERIAL PRIMARY KEY,
      property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
      sender_id INTEGER REFERENCES users(id),
      content TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id SERIAL PRIMARY KEY,
      identifier VARCHAR(200) NOT NULL,
      code VARCHAR(6) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('register', 'login', 'forgot-password', 'email_verify')),
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
    CREATE INDEX IF NOT EXISTS idx_otp_codes_identifier_type
    ON otp_codes (identifier, type)
  `);

  console.log('✅ Tables created');

  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ`);
  await query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS city VARCHAR(100)`);
  await query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS down_payment VARCHAR(100)`);
  await query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(100)`);
  await query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_basement BOOLEAN DEFAULT false`);
  await query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS finishing_type VARCHAR(100)`);
  await query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor_plan_image TEXT`);
  await query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS google_maps_url TEXT`);
  await query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT`);
  await query(`ALTER TABLE property_chat_messages ADD COLUMN IF NOT EXISTS recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE`);
  await query(`ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_purpose_check`);
  await query(`ALTER TABLE properties ADD CONSTRAINT properties_purpose_check CHECK (purpose IN ('sale','rent','resale'))`);
  await query(`ALTER TABLE otp_codes DROP CONSTRAINT IF EXISTS otp_codes_type_check`);
  await query(`ALTER TABLE otp_codes ADD CONSTRAINT otp_codes_type_check CHECK (type IN ('register', 'login', 'forgot-password', 'email_verify'))`);

  const requestedAccounts = [
    { name: 'Great Society Admin', email: 'admin@greatsociety.com', phone: '01090000001', password: 'Admin@GreatSociety1', role: 'superadmin', sub_role: null },
    { name: 'مدير عقارات Great Society', email: 'propmanager@greatsociety.com', phone: '01090000002', password: 'PropMgr@123', role: 'admin', sub_role: 'property_manager' },
    { name: 'إدخال بيانات Great Society', email: 'dataentry@greatsociety.com', phone: '01090000003', password: 'DataEntry@123', role: 'admin', sub_role: 'data_entry' },
    { name: 'دعم Great Society', email: 'support@greatsociety.com', phone: '01090000004', password: 'Support@123', role: 'admin', sub_role: 'support' },
    { name: 'مستخدم Great Society', email: 'user@greatsociety.com', phone: '01090000005', password: 'User@123', role: 'user', sub_role: null },
  ];

  for (const account of requestedAccounts) {
    const hash = await bcrypt.hash(account.password, 10);
    await query(
      `INSERT INTO users (name, email, phone, password_hash, role, sub_role, is_active, email_verified, email_verified_at)
       VALUES ($1,$2,$3,$4,$5,$6,true,true,NOW())
       ON CONFLICT (email) DO UPDATE SET
         name=EXCLUDED.name,
         phone=EXCLUDED.phone,
         password_hash=EXCLUDED.password_hash,
         role=EXCLUDED.role,
         sub_role=EXCLUDED.sub_role,
         is_active=true,
         email_verified=true,
         email_verified_at=NOW()`,
      [account.name, account.email, account.phone, hash, account.role, account.sub_role]
    );
  }

  const adminAccount = await query("SELECT id FROM users WHERE email='admin@greatsociety.com' LIMIT 1");
  const seedOwnerId = adminAccount.rows[0]?.id;

  if (seedOwnerId) {
    const uploadedImage = '/attached_assets/photo_2026-04-17_13-17-28_1776426346235.jpg';
    const oldDistricts = ['سيدي جابر','سموحة','المنتزه','العجمي','ستانلي','المندرة','كليوباترا','الدخيلة','برج العرب','جليم','رشدي','لوران','الإسكندرية'];
    await query(
      `DELETE FROM properties
       WHERE district = ANY($1)
          OR title ILIKE '%Alexandria%'
          OR title_ar ILIKE '%الإسكندرية%'`,
      [oldDistricts]
    );
    await query(
      `DELETE FROM properties
       WHERE title_ar IN ('شقة مميزة في التجمع الخامس', 'فيلا فاخرة في العاصمة الإدارية')`,
      []
    );

    const cairoProperties = [
      {
        title: 'شقة مميزة في التجمع الخامس',
        description: 'وحدة سكنية راقية بموقع مميز في القاهرة الجديدة، قريبة من الخدمات والمحاور الرئيسية. مناسبة للسكن أو الاستثمار مع تشطيب مميز ومساحات عملية.',
        type: 'شقة',
        purpose: 'sale',
        price: 4200000,
        area: 165,
        bedrooms: 3,
        bathrooms: 2,
        floor: 4,
        district: 'التجمع الخامس',
        address: 'قريبة من شارع التسعين',
        down_payment: 'مقدم يبدأ من 25%',
        delivery_status: 'استلام قريب',
        finishing_type: 'سوبر لوكس',
      },
      {
        title: 'فيلا فاخرة في العاصمة الإدارية',
        description: 'فيلا عائلية فاخرة بتصميم حديث وحديقة خاصة، داخل منطقة هادئة ومتكاملة الخدمات في العاصمة الإدارية الجديدة.',
        type: 'فيلا',
        purpose: 'sale',
        price: 12500000,
        area: 360,
        bedrooms: 5,
        bathrooms: 4,
        floor: 2,
        district: 'العاصمة الإدارية',
        address: 'كمبوند سكني متكامل الخدمات',
        down_payment: 'مقدم يبدأ من 20%',
        delivery_status: 'استلام فوري',
        finishing_type: 'تشطيب',
      },
    ];

    for (const prop of cairoProperties) {
      const propRes = await query(
        `INSERT INTO properties (
          owner_id, title, title_ar, description, description_ar, type, purpose, price, area,
          rooms, bedrooms, bathrooms, floor, district, city, address, contact_phone, status,
          is_featured, approved_by, approved_at, down_payment, delivery_status, finishing_type,
          has_parking, has_elevator, has_garden, updated_at
        )
        VALUES ($1,$2,$2,$3,$3,$4,$5,$6,$7,$8,$8,$9,$10,$11,'القاهرة',$12,'01100111618','approved',
          true,$1,NOW(),$13,$14,$15,true,true,true,NOW())
        RETURNING id`,
        [
          seedOwnerId, prop.title, prop.description, prop.type, prop.purpose, prop.price, prop.area,
          prop.bedrooms, prop.bathrooms, prop.floor, prop.district, prop.address,
          prop.down_payment, prop.delivery_status, prop.finishing_type,
        ]
      );
      await query(
        'INSERT INTO property_images (property_id, url, is_primary, order_index) VALUES ($1,$2,true,0)',
        [propRes.rows[0].id, uploadedImage]
      );
    }
  }

  const existingSuperAdmin = await query("SELECT id FROM users WHERE role='superadmin' LIMIT 1");
  if (existingSuperAdmin.rows.length === 0) {
    const hash = await bcrypt.hash('Admin@2024', 10);
    
    await query(
      "INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,'superadmin')",
      ['سوبر أدمن', 'superadmin@iskantek.com', '01000000001', hash]
    );

    const subAdmins = [
      { name: 'أحمد داتا إنتري', email: 'dataentry@iskantek.com', phone: '01000000002', sub_role: 'data_entry' },
      { name: 'محمد مدير العقارات', email: 'propmanager@iskantek.com', phone: '01000000003', sub_role: 'property_manager' },
      { name: 'سارة التحليلات', email: 'analytics@iskantek.com', phone: '01000000004', sub_role: 'analytics' },
      { name: 'كريم الدعم الفني', email: 'support@iskantek.com', phone: '01000000005', sub_role: 'support' },
    ];

    for (const sa of subAdmins) {
      await query(
        "INSERT INTO users (name, email, phone, password_hash, role, sub_role) VALUES ($1,$2,$3,$4,'admin',$5)",
        [sa.name, sa.email, sa.phone, hash, sa.sub_role]
      );
    }

    const testUser = await bcrypt.hash('User@2024', 10);
    await query(
      "INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,'user')",
      ['مستخدم تجريبي', 'user@example.com', '01100000001', testUser]
    );

    console.log('✅ Default users created');

    const superAdminRes = await query("SELECT id FROM users WHERE role='superadmin' LIMIT 1");
    const adminId = superAdminRes.rows[0].id;

    const sampleProps = [
      { title: 'شقة فاخرة في سيدي جابر', type: 'apartment', purpose: 'sale', price: 2500000, area: 150, bedrooms: 3, bathrooms: 2, district: 'سيدي جابر', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&fit=crop' },
      { title: 'فيلا مع حديقة في جليم', type: 'villa', purpose: 'sale', price: 8000000, area: 400, bedrooms: 5, bathrooms: 4, district: 'جليم', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&fit=crop' },
      { title: 'شقة للإيجار في ستانلي', type: 'apartment', purpose: 'rent', price: 8000, area: 120, bedrooms: 2, bathrooms: 1, district: 'ستانلي', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&fit=crop' },
      { title: 'مكتب تجاري في سموحة', type: 'office', purpose: 'rent', price: 15000, area: 200, bedrooms: 0, bathrooms: 2, district: 'سموحة', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&fit=crop' },
      { title: 'شقة بإطلالة بحرية في المندرة', type: 'apartment', purpose: 'sale', price: 4500000, area: 180, bedrooms: 3, bathrooms: 2, district: 'المندرة', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&fit=crop' },
      { title: 'فيلا فاخرة في العجمي', type: 'villa', purpose: 'sale', price: 12000000, area: 600, bedrooms: 6, bathrooms: 5, district: 'العجمي', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&fit=crop' },
    ];

    for (const prop of sampleProps) {
      const propRes = await query(
        `INSERT INTO properties (owner_id, title, title_ar, type, purpose, price, area, rooms, bedrooms, bathrooms, district, contact_phone, status, is_featured)
         VALUES ($1,$2,$2,$3,$4,$5,$6,$7,$7,$8,$9,$10,'approved',true) RETURNING id`,
        [adminId, prop.title, prop.type, prop.purpose, prop.price, prop.area, prop.bedrooms, prop.bathrooms, prop.district, '01100111618']
      );
      await query(
        'INSERT INTO property_images (property_id, url, is_primary) VALUES ($1,$2,true)',
        [propRes.rows[0].id, prop.img]
      );
    }

    console.log('✅ Sample properties created');
  } else {
    console.log('ℹ️ Data already exists, skipping seed');
  }

  console.log('🎉 Database setup complete!');
  console.log('');
  console.log('👤 Great Society accounts:');
  console.log('   🔵 Super Admin: admin@greatsociety.com / Admin@GreatSociety1');
  console.log('   🟡 Prop Mgr:    propmanager@greatsociety.com / PropMgr@123');
  console.log('   🟢 Data Entry:  dataentry@greatsociety.com / DataEntry@123');
  console.log('   🔴 Support:     support@greatsociety.com / Support@123');
  console.log('   ⚪ User:        user@greatsociety.com / User@123');
  process.exit(0);
}

setup().catch(e => { console.error('Setup failed:', e); process.exit(1); });
