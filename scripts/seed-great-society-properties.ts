import 'dotenv/config';
import { query } from '../server/db.js';

const GREAT_SOCIETY_PROPERTIES = [
  {
    title: 'شقق 3 غرف متشطبة بالكامل - طريق السويس المباشر',
    title_ar: 'شقق 3 غرف متشطبة بالكامل - طريق السويس المباشر',
    description: 'شقة 3 غرف متشطبة بالكامل على طريق السويس مباشرة بجانب أول جامعة ومستشفى بريطانية في مصر. المشروع مبني بنسبة إنشاءات 40% على أرض الواقع.',
    type: 'apartment',
    purpose: 'sale',
    price: 3200000,
    area: 150,
    bedrooms: 3,
    bathrooms: 2,
    district: 'طريق السويس',
    address: 'طريق السويس المباشر',
    is_furnished: true,
    has_elevator: true,
  },
  {
    title: 'فيلات وشقق استلام فوري - التجمع الخامس',
    title_ar: 'فيلات وشقق استلام فوري - التجمع الخامس',
    description: 'فيلات وشقق في قلب التجمع الخامس بموقع مميز قريب من النادي الأهلي والتسعين الجنوبي. استلام فوري مع خدمات متكاملة.',
    type: 'villa',
    purpose: 'sale',
    price: 20000000,
    area: 400,
    bedrooms: 4,
    bathrooms: 3,
    district: 'التجمع الخامس',
    address: 'قلب التجمع الخامس',
    is_furnished: false,
    has_parking: true,
    has_pool: true,
  },
  {
    title: 'شقق 3 غرف ماستر - التجمع الخامس',
    title_ar: 'شقق 3 غرف ماستر - التجمع الخامس',
    description: 'شقق 3 غرف فاخرة في قلب التجمع الخامس بأفضل المواقع. أقساط مريحة تصل إلى 10 سنوات.',
    type: 'apartment',
    purpose: 'sale',
    price: 12000000,
    area: 180,
    bedrooms: 3,
    bathrooms: 2,
    district: 'التجمع الخامس',
    address: 'التجمع الخامس - الموقع المميز',
    is_furnished: true,
    has_elevator: true,
  },
  {
    title: 'عقارات بموقع مميز - Golden Square',
    title_ar: 'عقارات بموقع مميز - Golden Square',
    description: 'شقق وفيلات في قلب جولدن سكوير القريب جداً من الفيوزون وشارع النوادي. موقع استثماري بامتياز مع عوائد إيجارية عالية.',
    type: 'apartment',
    purpose: 'sale',
    price: 8000000,
    area: 200,
    bedrooms: 3,
    bathrooms: 2,
    district: 'Golden Square',
    address: 'قلب جولدن سكوير',
    is_furnished: true,
    has_elevator: true,
  },
  {
    title: 'شقق فاخرة - مصر الجديدة (النرجس، النورث هاوس، بيت الوطن)',
    title_ar: 'شقق فاخرة - مصر الجديدة (النرجس، النورث هاوس، بيت الوطن)',
    description: 'أفضل المواقع في مصر الجديدة تشمل النرجس الجديدة والنورث هاوس وبيت الوطن وشمال الرحاب. بأسعار منافسة وخدمات عالية الجودة.',
    type: 'apartment',
    purpose: 'sale',
    price: 4000000,
    area: 150,
    bedrooms: 3,
    bathrooms: 2,
    district: 'مصر الجديدة',
    address: 'مصر الجديدة - مناطق متعددة',
    is_furnished: true,
    has_elevator: true,
  },
  {
    title: 'فيلا سكنية - R8 العاصمة الإدارية الجديدة',
    title_ar: 'فيلا سكنية - R8 العاصمة الإدارية الجديدة',
    description: 'فيلا فاخرة في مشروع R8 بقلب العاصمة الإدارية الجديدة مع أقوى مطور في المدينة. مقدم 10% فقط وأقساط شهرية ميسرة.',
    type: 'villa',
    purpose: 'sale',
    price: 6000000,
    area: 350,
    bedrooms: 4,
    bathrooms: 3,
    district: 'العاصمة الإدارية الجديدة',
    address: 'R8 - العاصمة الإدارية',
    is_furnished: false,
    has_parking: true,
  },
  {
    title: 'شقق متنوعة - التجمع السادس (أمام الكازار)',
    title_ar: 'شقق متنوعة - التجمع السادس (أمام الكازار)',
    description: 'شقق 1-2 غرفة في موقع ممتاز بالتجمع السادس أمام كمبوند الكازار. 10 دقائق من الجامعة الأمريكية و5 دقائق من طريق السويس.',
    type: 'apartment',
    purpose: 'sale',
    price: 3500000,
    area: 120,
    bedrooms: 2,
    bathrooms: 1,
    district: 'التجمع السادس',
    address: 'التجمع السادس - أمام الكازار',
    is_furnished: true,
    has_elevator: true,
  },
  {
    title: 'عقارات متميزة - مشاريع متعددة',
    title_ar: 'عقارات متميزة - مشاريع متعددة',
    description: 'تشكيلة متنوعة من العقارات السكنية والاستثمارية في أفضل المواقع بالقاهرة والعاصمة الإدارية. خدمة عملاء احترافية وتمويل ميسر.',
    type: 'apartment',
    purpose: 'sale',
    price: 5000000,
    area: 160,
    bedrooms: 3,
    bathrooms: 2,
    district: 'مناطق متعددة',
    address: 'مناطق متعددة بالقاهرة والعاصمة الإدارية',
    is_furnished: true,
    has_elevator: true,
  },
];

async function seedProperties() {
  try {
    console.log('🌱 Starting property seed for Great Society...');

    // Get admin user (super admin)
    const adminRes = await query("SELECT id FROM users WHERE role='superadmin' LIMIT 1");
    if (adminRes.rows.length === 0) {
      console.error('❌ No super admin found. Please run setup-db first.');
      process.exit(1);
    }

    const adminId = adminRes.rows[0].id;

    // Check if properties already exist
    const existingProps = await query('SELECT COUNT(*) as count FROM properties WHERE district ILIKE $1', ['%التجمع الخامس%']);
    if (existingProps.rows[0].count > 0) {
      console.log('ℹ️ Properties already exist. Skipping seed.');
      process.exit(0);
    }

    let createdCount = 0;
    for (const prop of GREAT_SOCIETY_PROPERTIES) {
      const result = await query(
        `INSERT INTO properties (
          owner_id, title, title_ar, description, type, purpose, price, area, 
          bedrooms, bathrooms, district, address, status, is_featured,
          is_furnished, has_parking, has_pool, has_elevator
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'approved', true, $13, $14, $15, $16)
        RETURNING id`,
        [
          adminId, prop.title, prop.title_ar, prop.description, prop.type, prop.purpose,
          prop.price, prop.area, prop.bedrooms, prop.bathrooms, prop.district, prop.address,
          prop.is_furnished || false, prop.has_parking || false, prop.has_pool || false, prop.has_elevator || false
        ]
      );

      const propertyId = result.rows[0].id;

      // Add a sample image for each property
      const sampleImages = [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&fit=crop',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&fit=crop',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&fit=crop',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&fit=crop',
        'https://images.unsplash.com/photo-1580587771525-78991c1b6eab?w=800&fit=crop',
        'https://images.unsplash.com/photo-1560107516-da15bca2b169?w=800&fit=crop',
      ];

      await query(
        'INSERT INTO property_images (property_id, url, is_primary) VALUES ($1, $2, true)',
        [propertyId, sampleImages[createdCount % sampleImages.length]]
      );

      createdCount++;
      console.log(`✅ Created property: ${prop.title}`);
    }

    console.log(`\n🎉 Successfully created ${createdCount} Great Society properties!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedProperties();
