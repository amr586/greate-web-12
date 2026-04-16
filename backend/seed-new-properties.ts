import 'dotenv/config';
import { query } from './db.js';

async function seedProperties() {
  console.log('Adding new properties...');

  const adminRes = await query("SELECT id FROM users WHERE role='superadmin' LIMIT 1");
  const adminId = adminRes.rows[0].id;

  const properties = [
    {
      title: 'شقق 3 غرف متشطبة بالكامل على طريق السويس',
      description: 'شقتك 3 غرف متشطبة بالكامل بمقدم 750 ألف في أقوى لوكيشن على طريق السويس مباشرة جنب أول جامعة ومستشفى بريطانية في مصر\nأسعار تبدأ من 3,200,000 جنيه\nمبنية بنسبة إنشاءات 40% على أرض الواقع\nللمعاينة والتفاصيل سجل بياناتك دلوقتي\nCall us: 01100111618',
      type: 'apartment',
      purpose: 'sale',
      price: 3200000,
      area: 130,
      bedrooms: 3,
      bathrooms: 2,
      district: 'طريق السويس',
      is_featured: true,
      img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&fit=crop',
    },
    {
      title: 'فيلات وشقق استلام فوري - التجمع الخامس بمقدم 1.8 مليون',
      description: 'فيلات وشقق استلام فوري في قلب التجمع الخامس بمقدم 1.8 مليون وأقساط تصل إلى 10 سنوات\nدقائق من التسعين الجنوبي ومطار القاهرة\nخطوات من النادي الأهلي\nقريب من أهم الخدمات والمحاور\nفخامة وخصوصية - تصميم عصري - واجهات مميزة - فيو مفتوح',
      type: 'apartment',
      purpose: 'sale',
      price: 1800000,
      area: 180,
      bedrooms: 3,
      bathrooms: 2,
      district: 'التجمع الخامس',
      is_featured: true,
      img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&fit=crop',
    },
    {
      title: 'شقق 3 غرف في التجمع الخامس - مقدم 1.2 مليون - تقسيط 10 سنين',
      description: 'شقق وفيلات استلام فوري في قلب التجمع الخامس\nمقدم 1.2 مليون لشقق الـ 3 غرف بمتوسط أسعار 12 مليون جنيه وتقسيط يصل لـ 10 سنين\nالمشروع يضم فيلات بمقدم 2 مليون جنيه ومتوسط أسعار 20 مليون جنيه\nفي لوكيشن مميز - دقائق من التسعين الجنوبي ومطار القاهرة',
      type: 'apartment',
      purpose: 'sale',
      price: 12000000,
      area: 200,
      bedrooms: 3,
      bathrooms: 3,
      district: 'التجمع الخامس',
      is_featured: true,
      img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&fit=crop',
    },
    {
      title: 'فيلات التجمع الخامس - مقدم 2 مليون - متوسط 20 مليون',
      description: 'فيلات فاخرة بمقدم 2 مليون جنيه ومتوسط أسعار 20 مليون جنيه\nاستلام فوري وخلال 6 شهور\nفي لوكيشن مميز دقائق من التسعين الجنوبي\nخطوات من النادي الأهلي\nقريب من أهم الخدمات والمحاور\nفخامة وخصوصية وتصميم عصري',
      type: 'villa',
      purpose: 'sale',
      price: 20000000,
      area: 400,
      bedrooms: 5,
      bathrooms: 4,
      district: 'التجمع الخامس',
      is_featured: true,
      img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&fit=crop',
    },
    {
      title: 'شقة 3 غرف ماستر في قلب التجمع الخامس - مقدم 1.8 مليون',
      description: 'شقة 3 غرف ماستر في قلب التجمع الخامس\nفرصة سكن واستثمار في موقع لا يتكرر\nدقائق من التسعين الجنوبي\nخطوات من النادي الأهلي\nقريب من أهم الخدمات والمحاور\nفخامة وخصوصية - تصميم عصري - واجهات مميزة - فيو مفتوح\nاستلام فوري وخلال 6 شهور\nمقدم يبدأ من 1.8 مليون - تقسيط مريح على 5 سنوات\nكلمنا دلوقتي على رسائل الصفحة واعرف باقي التفاصيل قبل اكتمال الوحدات المتاحة',
      type: 'apartment',
      purpose: 'sale',
      price: 1800000,
      area: 160,
      bedrooms: 3,
      bathrooms: 2,
      district: 'التجمع الخامس',
      is_featured: true,
      img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&fit=crop',
    },
    {
      title: 'فرصة لا تتعوض في الجولدن سكوير - استلام فوري بمقدم 50%',
      description: 'فرصة مش هتتعوض في لوكيشن في قلب الجولدن سكوير\nقريب جداً من كل حاجة - الفيوزون وشارع النوادي\n600 متر للنادي الأهلي ومحور بن زايد الجنوبي\nاستلم فوراً في قلب التجمع الخامس بمقدم 50%\nشقة 3 غرف - أفضل المواقع في الجولدن سكوير',
      type: 'apartment',
      purpose: 'sale',
      price: 4000000,
      area: 150,
      bedrooms: 3,
      bathrooms: 2,
      district: 'جولدن سكوير',
      is_featured: true,
      img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&fit=crop',
    },
    {
      title: 'شقق في النرجس الجديدة والنورث هاوس وبيت الوطن وشمال الرحاب - من 4 مليون',
      description: 'أسعار تبدأ من 4 مليون في أفضل المواقع:\n- النرجس الجديدة\n- النورث هاوس\n- بيت الوطن\n- شمال الرحاب\nلتفاصيل أكتر سجل بياناتك دلوقتي',
      type: 'apartment',
      purpose: 'sale',
      price: 4000000,
      area: 140,
      bedrooms: 3,
      bathrooms: 2,
      district: 'التجمع الخامس',
      is_featured: false,
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&fit=crop',
    },
    {
      title: 'فيلتك بسعر شقة في R8 العاصمة الإدارية - مقدم 10%',
      description: 'فيلتك بسعر شقة في قلب الـ R8 بمقدم 10% وقسط شهري 60 ألف جنيه\nبخصم وسعر الطرح الأول مع أقوى مطور في العاصمة الإدارية\nللحجز والاستفادة بالخصم - أسعار لن تتكرر\nموقع استراتيجي في قلب العاصمة الإدارية',
      type: 'villa',
      purpose: 'sale',
      price: 8000000,
      area: 300,
      bedrooms: 4,
      bathrooms: 3,
      district: 'العاصمة الإدارية',
      is_featured: true,
      img: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&fit=crop',
    },
    {
      title: 'شقق التجمع السادس أمام كمبوند الكازار - من 3 مليون',
      description: 'في التجمع السادس أمام كمبوند الكازار\nبسعر 3 مليون للشقة الغرفة\n4.5 مليون للشقة الغرفتين\nبمقدم 300 ألف فقط\nفي أفضل لوكيشن في التجمع السادس\n10 دقائق من الجامعة الأمريكية',
      type: 'apartment',
      purpose: 'sale',
      price: 3000000,
      area: 80,
      bedrooms: 1,
      bathrooms: 1,
      district: 'التجمع السادس',
      is_featured: false,
      img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&fit=crop',
    },
    {
      title: 'شقة غرفتين في التجمع السادس - أمام الكازار - 4.5 مليون',
      description: 'شقة الغرفتين في التجمع السادس أمام كمبوند الكازار\nبسعر 4.5 مليون جنيه - بمقدم 300 ألف فقط\nفي أفضل لوكيشن في التجمع السادس\n10 دقائق من الجامعة الأمريكية',
      type: 'apartment',
      purpose: 'sale',
      price: 4500000,
      area: 110,
      bedrooms: 2,
      bathrooms: 2,
      district: 'التجمع السادس',
      is_featured: false,
      img: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&fit=crop',
    },
  ];

  for (const prop of properties) {
    const propRes = await query(
      `INSERT INTO properties (owner_id, title, title_ar, description, description_ar, type, purpose, price, area, bedrooms, rooms, bathrooms, district, status, is_featured)
       VALUES ($1,$2,$2,$3,$3,$4,$5,$6,$7,$8,$8,$9,$10,'approved',$11) RETURNING id`,
      [adminId, prop.title, prop.description, prop.type, prop.purpose, prop.price, prop.area, prop.bedrooms, prop.bathrooms, prop.district, prop.is_featured]
    );
    await query(
      'INSERT INTO property_images (property_id, url, is_primary, order_index) VALUES ($1,$2,true,0)',
      [propRes.rows[0].id, prop.img]
    );
    console.log(`✅ Added: ${prop.title}`);
  }

  console.log('\n🎉 All properties added!');
  process.exit(0);
}

seedProperties().catch(e => { console.error(e); process.exit(1); });
