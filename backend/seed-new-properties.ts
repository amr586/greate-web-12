import 'dotenv/config';
import { query } from './db.js';

type PropertySeed = {
  title: string;
  description: string;
  type: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  district: string;
  address: string;
  downPayment: string;
  deliveryStatus: string;
  finishingType: string;
  images: string[];
};

const CONTACT_PHONE = '01100111618';

const properties: PropertySeed[] = [
  {
    title: 'فرصة في الجولدن سكوير قرب النادي الأهلي ومحور بن زايد',
    description: 'تخيّل تدخل منطقة سعرها بيعلى كل يوم لأنك في الجولدن سكوير. خطوات من شارع النوادي، دقائق من الفيو زون، 600 متر فقط من النادي الأهلي، ومحور بن زايد الجنوبي على بعد لحظات. فرصة قوية للسكن أو الاستثمار في موقع حيوي ومطلوب. للتفاصيل والمعاينة سجل بياناتك دلوقتي. Call us: 01100111618',
    type: 'apartment',
    price: 8000000,
    area: 180,
    bedrooms: 3,
    bathrooms: 2,
    district: 'جولدن سكوير',
    address: 'الجولدن سكوير، خطوات من شارع النوادي ودقائق من الفيو زون و600 متر من النادي الأهلي، قريب من محور بن زايد الجنوبي',
    downPayment: 'مقدم مرن حسب الوحدة',
    deliveryStatus: 'متاح للسكن أو الاستثمار',
    finishingType: 'تشطيب مميز',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&h=600&fit=crop'
    ]
  },
  {
    title: 'شقة 3 غرف بقسط ثابت 23 ألف في R8 العاصمة الإدارية',
    description: 'شقتك 3 غرف بقسط ثابت 23 ألف جنيه فقط في أفضل لوكيشن في R8 العاصمة الإدارية، مع أقوى مطور عقاري معروف بالتسليم قبل ميعاده. موقع مميز داخل العاصمة الإدارية وقريب من الخدمات والمحاور الرئيسية. لتفاصيل أكتر سجل بياناتك دلوقتي وهنكلمك. Call us: 01100111618',
    type: 'apartment',
    price: 4500000,
    area: 145,
    bedrooms: 3,
    bathrooms: 2,
    district: 'R8 العاصمة الإدارية',
    address: 'أفضل لوكيشن في R8 العاصمة الإدارية الجديدة مع مطور عقاري قوي',
    downPayment: 'قسط ثابت 23 ألف جنيه',
    deliveryStatus: 'مطور بيسلم قبل ميعاده',
    finishingType: 'نصف تشطيب',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&h=600&fit=crop'
    ]
  },
  {
    title: 'استلام فوري في قلب التجمع الخامس بمقدم 50% شقة 3 غرف',
    description: 'استلم فورًا في قلب التجمع الخامس بمقدم 50% شقة 3 غرف، أسعار تبدأ من 4 مليون جنيه. أفضل المواقع في النرجس الجديدة، النورث هاوس، بيت الوطن، وشمال الرحاب. فرصة مناسبة للسكن أو الاستثمار في مناطق عليها طلب عالي. لتفاصيل أكتر سجل بياناتك دلوقتي. Call us: 01100111618',
    type: 'apartment',
    price: 4000000,
    area: 150,
    bedrooms: 3,
    bathrooms: 2,
    district: 'التجمع الخامس',
    address: 'النرجس الجديدة، النورث هاوس، بيت الوطن، شمال الرحاب',
    downPayment: 'مقدم 50%',
    deliveryStatus: 'استلام فوري',
    finishingType: 'تشطيب حسب الوحدة',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&h=600&fit=crop'
    ]
  },
  {
    title: 'وحدتك أقل من سعر السوق بـ 4 مليون في La Nolina مستقبل سيتي',
    description: 'وحدتك أقل من سعر السوق بـ 4 مليون جنيه. فرصة حقيقية للسكن أو الاستثمار في آخر مرحلة من La Nolina مصر إيطاليا. شقة 3 غرف بمقدم 2.5 مليون وأقساط حتى 60 شهر، في قلب مستقبل سيتي وسط أكبر المطورين وبأقوى سابقة أعمال. لحجز معاينتك على أرض الواقع. Call us: 01100111618',
    type: 'apartment',
    price: 6500000,
    area: 160,
    bedrooms: 3,
    bathrooms: 2,
    district: 'مستقبل سيتي',
    address: 'La Nolina مصر إيطاليا، قلب مستقبل سيتي وسط أكبر المطورين',
    downPayment: 'مقدم 2.5 مليون وتقسيط حتى 60 شهر',
    deliveryStatus: 'آخر مرحلة متاحة',
    finishingType: 'تشطيب مميز',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=900&h=600&fit=crop'
    ]
  },
  {
    title: 'أسعار لن تتكرر في التجمع السادس أمام كمبوند الكازار',
    description: 'أسعار لن تتكرر في التجمع السادس أمام كمبوند الكازار. شقة غرفة بسعر 3 مليون وشقة غرفتين بسعر 4.5 مليون، بمقدم 300 ألف فقط. أفضل لوكيشن في التجمع السادس، 10 دقائق من الجامعة الأمريكية، و5 دقائق من طريق السويس والدائري الأوسطي. للتفاصيل: Call us 01100111618',
    type: 'apartment',
    price: 3000000,
    area: 95,
    bedrooms: 1,
    bathrooms: 1,
    district: 'التجمع السادس',
    address: 'أمام كمبوند الكازار، 10 دقائق من الجامعة الأمريكية، 5 دقائق من طريق السويس والدائري الأوسطي',
    downPayment: 'مقدم 300 ألف',
    deliveryStatus: 'متاح للحجز',
    finishingType: 'نصف تشطيب',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448075-bb485b067938?w=900&h=600&fit=crop'
    ]
  },
  {
    title: 'استلام فوري في سراي مراحل S1 و S2 و Cavana',
    description: 'استلام فوري في سراي مراحل S1 و S2 و Cavana. وحدات متنوعة تشمل فيلات مستقلة، فيلا S، تاون هاوس، وشقق غرفتين و3 غرف. سعر المتر تقريبًا 70,000 جنيه، مقدم 10% وتقسيط حتى 8 سنوات. خصم الكاش 35% والوحدات محدودة جدًا. للحجز والاستفسارات Call us: 01100111618',
    type: 'villa',
    price: 7000000,
    area: 120,
    bedrooms: 2,
    bathrooms: 2,
    district: 'سراي',
    address: 'سراي، مراحل S1 و S2 و Cavana، وحدات متنوعة جاهزة للاستلام',
    downPayment: 'مقدم 10% وتقسيط حتى 8 سنوات، خصم كاش 35%',
    deliveryStatus: 'استلام فوري',
    finishingType: 'تشطيب حسب نوع الوحدة',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=900&h=600&fit=crop'
    ]
  },
  {
    title: 'شقق وفيلات استلام فوري في قلب التجمع الخامس',
    description: 'شقق وفيلات استلام فوري في قلب التجمع الخامس. مقدم 1.2 مليون لشقق الـ 3 غرف بمتوسط أسعار 12 مليون جنيه وتقسيط يصل إلى 10 سنين. المشروع يضم فيلات بمقدم 2 مليون جنيه ومتوسط أسعار 20 مليون جنيه. لوكيشن مميز دقائق من التسعين الجنوبي ومطار القاهرة. سجل بياناتك دلوقتي عشان تعاين وحدتك على الطبيعة وتعرف كل التفاصيل. Call us: 01100111618',
    type: 'villa',
    price: 12000000,
    area: 180,
    bedrooms: 3,
    bathrooms: 2,
    district: 'التجمع الخامس',
    address: 'قلب التجمع الخامس، دقائق من التسعين الجنوبي ومطار القاهرة',
    downPayment: 'مقدم 1.2 مليون للشقق و2 مليون للفيلات، تقسيط حتى 10 سنين',
    deliveryStatus: 'استلام فوري',
    finishingType: 'تشطيب مميز',
    images: [
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=900&h=600&fit=crop'
    ]
  }
];

async function seedProperties() {
  console.log('Adding requested featured properties...');

  const adminRes = await query("SELECT id FROM users WHERE role='superadmin' ORDER BY id LIMIT 1");
  const adminId = adminRes.rows[0]?.id;
  if (!adminId) throw new Error('No superadmin user found');

  for (const prop of properties) {
    const existing = await query('SELECT id FROM properties WHERE title_ar=$1 OR title=$1 LIMIT 1', [prop.title]);
    let propertyId = existing.rows[0]?.id;

    if (propertyId) {
      await query(
        `UPDATE properties SET
          owner_id=$1, title=$2, title_ar=$2, description=$3, description_ar=$3,
          type=$4, purpose='sale', price=$5, area=$6, rooms=$7, bedrooms=$7,
          bathrooms=$8, district=$9, city='القاهرة', address=$10, contact_phone=$11,
          down_payment=$12, delivery_status=$13, finishing_type=$14, status='approved',
          is_featured=true, approved_by=$1, approved_at=COALESCE(approved_at, NOW()),
          floor_plan_image=NULL, google_maps_url=NULL, updated_at=NOW()
         WHERE id=$15`,
        [
          adminId, prop.title, prop.description, prop.type, prop.price, prop.area, prop.bedrooms,
          prop.bathrooms, prop.district, prop.address, CONTACT_PHONE, prop.downPayment,
          prop.deliveryStatus, prop.finishingType, propertyId
        ]
      );
      await query('DELETE FROM property_images WHERE property_id=$1', [propertyId]);
    } else {
      const propRes = await query(
        `INSERT INTO properties (
          owner_id, title, title_ar, description, description_ar, type, purpose, price, area,
          rooms, bedrooms, bathrooms, district, city, address, contact_phone, down_payment,
          delivery_status, finishing_type, status, is_featured, approved_by, approved_at,
          floor_plan_image, google_maps_url, updated_at
        )
        VALUES ($1,$2,$2,$3,$3,$4,'sale',$5,$6,$7,$7,$8,$9,'القاهرة',$10,$11,$12,$13,$14,'approved',true,$1,NOW(),NULL,NULL,NOW())
        RETURNING id`,
        [
          adminId, prop.title, prop.description, prop.type, prop.price, prop.area, prop.bedrooms,
          prop.bathrooms, prop.district, prop.address, CONTACT_PHONE, prop.downPayment,
          prop.deliveryStatus, prop.finishingType
        ]
      );
      propertyId = propRes.rows[0].id;
    }

    for (let i = 0; i < prop.images.length; i++) {
      await query(
        'INSERT INTO property_images (property_id, url, is_primary, order_index) VALUES ($1,$2,$3,$4)',
        [propertyId, prop.images[i], i === 0, i]
      );
    }

    console.log(`Added/updated: ${prop.title}`);
  }

  console.log('Requested featured properties are ready.');
  process.exit(0);
}

seedProperties().catch(e => { console.error(e); process.exit(1); });
