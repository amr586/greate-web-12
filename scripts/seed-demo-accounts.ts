import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { query } from '../server/db.js';

const DEMO_ACCOUNTS = [
  {
    name: 'سوبر أدمن',
    email: 'superadmin@iskantek.com',
    phone: '01000000001',
    password: 'Admin@2024',
    role: 'superadmin',
    sub_role: null,
  },
  {
    name: 'مسؤول إدخال البيانات',
    email: 'dataentry@iskantek.com',
    phone: '01000000002',
    password: 'Admin@2024',
    role: 'admin',
    sub_role: 'data_entry',
  },
  {
    name: 'مدير العقارات',
    email: 'propmanager@iskantek.com',
    phone: '01000000003',
    password: 'Admin@2024',
    role: 'admin',
    sub_role: 'property_manager',
  },
  {
    name: 'مسؤول التحليلات',
    email: 'analytics@iskantek.com',
    phone: '01000000004',
    password: 'Admin@2024',
    role: 'admin',
    sub_role: 'analytics',
  },
  {
    name: 'مسؤول الدعم الفني',
    email: 'support@iskantek.com',
    phone: '01000000005',
    password: 'Admin@2024',
    role: 'admin',
    sub_role: 'support',
  },
];

async function seedDemoAccounts() {
  console.log('🌱 بدء إنشاء الحسابات التجريبية...');
  for (const account of DEMO_ACCOUNTS) {
    try {
      const existing = await query(
        'SELECT id FROM users WHERE email=$1',
        [account.email]
      );
      if (existing.rows.length > 0) {
        const passwordHash = await bcrypt.hash(account.password, 12);
        await query(
          `UPDATE users SET name=$1, phone=$2, password_hash=$3, role=$4, sub_role=$5, is_active=true WHERE email=$6`,
          [account.name, account.phone, passwordHash, account.role, account.sub_role, account.email]
        );
        console.log(`✅ تم تحديث: ${account.email} (${account.role}${account.sub_role ? '/' + account.sub_role : ''})`);
      } else {
        const passwordHash = await bcrypt.hash(account.password, 12);
        await query(
          `INSERT INTO users (name, email, phone, password_hash, role, sub_role, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, true)`,
          [account.name, account.email, account.phone, passwordHash, account.role, account.sub_role]
        );
        console.log(`✅ تم إنشاء: ${account.email} (${account.role}${account.sub_role ? '/' + account.sub_role : ''})`);
      }
    } catch (err) {
      console.error(`❌ خطأ في ${account.email}:`, err);
    }
  }
  console.log('\n✅ الحسابات التجريبية جاهزة!');
  console.log('كلمة المرور لجميع الحسابات: Admin@2024');
  process.exit(0);
}

seedDemoAccounts().catch(err => {
  console.error('خطأ:', err);
  process.exit(1);
});
