import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

function isStaffUser(user: AuthRequest['user']): boolean {
  return Boolean(user && (
    user.role === 'superadmin' ||
    user.role === 'admin' ||
    ['property_manager', 'data_entry'].includes(user.sub_role || '')
  ));
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, purpose, district, minPrice, maxPrice, rooms, search, page = 1, limit = 12, user_id } = req.query;
    let conditions = user_id ? [`p.owner_id = $1`] : ["p.status = 'approved'"];
    const params: any[] = user_id ? [Number(user_id)] : [];
    let idx = user_id ? 2 : 1;

    if (type) { conditions.push(`p.type = $${idx++}`); params.push(type); }
    if (purpose) { conditions.push(`p.purpose = $${idx++}`); params.push(purpose); }
    if (district) { conditions.push(`p.district ILIKE $${idx++}`); params.push(`%${district}%`); }
    if (minPrice) { conditions.push(`p.price >= $${idx++}`); params.push(Number(minPrice)); }
    if (maxPrice) { conditions.push(`p.price <= $${idx++}`); params.push(Number(maxPrice)); }
    if (rooms) { conditions.push(`p.rooms >= $${idx++}`); params.push(Number(rooms)); }
    if (search) {
      conditions.push(`(p.title ILIKE $${idx} OR p.description ILIKE $${idx} OR p.district ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (Number(page) - 1) * Number(limit);

    const countRes = await query(`SELECT COUNT(*) FROM properties p ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    const result = await query(`
      SELECT p.*, 
        u.name as owner_name,
        (SELECT pi.url FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = true LIMIT 1) as primary_image,
        (SELECT json_agg(pi2.url) FROM property_images pi2 WHERE pi2.property_id = p.id LIMIT 5) as images
      FROM properties p
      LEFT JOIN users u ON u.id = p.owner_id
      ${where}
      ORDER BY p.is_featured DESC, p.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `, [...params, Number(limit), offset]);

    res.json({ properties: result.rows, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب العقارات' });
  }
});

router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT p.*, 
        (SELECT pi.url FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = true LIMIT 1) as primary_image,
        (SELECT json_agg(json_build_object('id', pi2.id, 'url', pi2.url, 'is_primary', pi2.is_primary) ORDER BY pi2.order_index) FROM property_images pi2 WHERE pi2.property_id = p.id) as images
      FROM properties p
      WHERE p.status = 'approved' AND p.is_featured = true
      ORDER BY p.updated_at DESC, p.created_at DESC
      LIMIT 12
    `);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT p.*, u.name as owner_name, u.phone as owner_phone,
        (SELECT json_agg(json_build_object('id', pi.id, 'url', pi.url, 'is_primary', pi.is_primary) ORDER BY pi.order_index) FROM property_images pi WHERE pi.property_id = p.id) as images
      FROM properties p LEFT JOIN users u ON u.id = p.owner_id WHERE p.id = $1
    `, [id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'العقار غير موجود' });
    await query('UPDATE properties SET views = views + 1 WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title, title_ar, description, type, purpose, price, area, rooms, bedrooms, bathrooms, floor,
      address, district, contact_phone, down_payment, delivery_status, is_featured, show_on_home, images,
      is_furnished, has_parking, has_elevator, has_pool, has_garden, has_basement,
      finishing_type, floor_plan_image, google_maps_url
    } = req.body;
    const displayTitle = title_ar || title || '';
    const user = req.user!;
    const isStaff = isStaffUser(user);
    const initialStatus = isStaff ? 'approved' : 'pending';
    const COMPANY_PHONE = '01100111618';
    const finalPhone = isStaff ? (contact_phone || COMPANY_PHONE) : (contact_phone || user.phone || COMPANY_PHONE);
    const validPurpose = ['sale','rent','resale'].includes(purpose) ? purpose : 'sale';
    const finalIsFeatured = isStaff ? Boolean(is_featured) : false;
    const finalShowOnHome = isStaff ? Boolean(show_on_home) : false;
    const result = await query(
      `INSERT INTO properties (
        title, title_ar, description, description_ar, type, purpose, price, area, rooms, bedrooms,
        bathrooms, floor, address, district, contact_phone, down_payment, delivery_status,
        is_featured, show_on_home, is_furnished, has_parking, has_elevator, has_pool, has_garden, has_basement,
        finishing_type, floor_plan_image, google_maps_url, owner_id, status
      )
       VALUES ($1,$2,$3,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29) RETURNING *`,
      [
        displayTitle, displayTitle, description, type, validPurpose, price, area, rooms || bedrooms, bedrooms || rooms,
        bathrooms, floor, address, district, finalPhone, down_payment || null, delivery_status || null,
        finalIsFeatured, finalShowOnHome, Boolean(is_furnished), Boolean(has_parking), Boolean(has_elevator),
        Boolean(has_pool), Boolean(has_garden), Boolean(has_basement),
        finishing_type || null, floor_plan_image || null, google_maps_url || null,
        user.id, initialStatus
      ]
    );
    const property = result.rows[0];
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await query('INSERT INTO property_images (property_id, url, is_primary, order_index) VALUES ($1,$2,$3,$4)',
          [property.id, images[i], i === 0, i]);
      }
    }
    // Notify all admins and superadmins + the user who added
    try {
      const userRes = await query('SELECT id, name, email, phone FROM users WHERE id=$1', [req.user!.id]);
      const userData = userRes.rows[0];
      const adminsRes = await query("SELECT id FROM users WHERE role IN ('admin','superadmin')");
      for (const admin of adminsRes.rows) {
        await query(
          `INSERT INTO notifications (user_id, type, title, message, property_data, user_data, link)
           VALUES ($1,'property_added','عقار جديد يحتاج مراجعة',$2,$3,$4,$5)`,
          [
            admin.id,
            `تم إضافة عقار جديد من المستخدم: ${userData.name} - ${userData.phone}`,
            JSON.stringify({ id: property.id, title: property.title, type: property.type, purpose: property.purpose, price: property.price, area: property.area, bedrooms: property.bedrooms || property.rooms, bathrooms: property.bathrooms, district: property.district }),
            JSON.stringify({ name: userData.name, email: userData.email, phone: userData.phone }),
            `/properties/${property.id}`,
          ]
        );
      }
      // Notify user who added the property
      if (!isStaff) {
        await query(
          `INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1,'property_added','تم إرسال عقارك للمراجعة',$2,$3)`,
          [user.id, `تم إرسال عقارك "${property.title_ar || property.title}" بنجاح وهو الآن قيد المراجعة. ستتلقى إشعاراً عند الموافقة.`, `/dashboard`]
        );
      }
    } catch (notifyErr) {
      console.error('Notify error:', notifyErr);
    }
    res.status(201).json(property);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في إضافة العقار' });
  }
});

router.get('/user/saved', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT p.*, (SELECT pi.url FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = true LIMIT 1) as primary_image
      FROM saved_properties sp JOIN properties p ON p.id = sp.property_id WHERE sp.user_id = $1
    `, [req.user!.id]);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.patch('/:id/user-edit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const propRes = await query('SELECT owner_id, status FROM properties WHERE id=$1', [req.params.id]);
    if (!propRes.rows[0]) return res.status(404).json({ error: 'العقار غير موجود' });
    const prop = propRes.rows[0];
    const isStaff = isStaffUser(req.user);
    if (!isStaff && prop.owner_id !== req.user!.id) return res.status(403).json({ error: 'ليس لديك صلاحية' });
    if (!isStaff && prop.status !== 'pending') return res.status(400).json({ error: 'لا يمكن تعديل العقار بعد الموافقة عليه' });
    const {
      title_ar, title, description, type, purpose, price, area, bedrooms, bathrooms, floor,
      district, address, contact_phone, down_payment, delivery_status, google_maps_url,
      is_furnished, has_parking, has_elevator, has_pool, has_garden, has_basement,
      finishing_type, floor_plan_image, images
    } = req.body;
    await query(
      `UPDATE properties SET
        title=COALESCE($1,title), title_ar=COALESCE($2,title_ar),
        description=COALESCE($3,description), type=COALESCE($4,type), purpose=COALESCE($5,purpose),
        price=COALESCE($6,price), area=COALESCE($7,area), bedrooms=COALESCE($8,bedrooms),
        rooms=COALESCE($8,rooms), bathrooms=COALESCE($9,bathrooms), floor=$10,
        district=COALESCE($11,district), address=$12, contact_phone=COALESCE($13,contact_phone),
        down_payment=$14, delivery_status=$15, google_maps_url=$16,
        is_furnished=$17, has_parking=$18, has_elevator=$19, has_pool=$20, has_garden=$21,
        has_basement=$22, finishing_type=$23, floor_plan_image=COALESCE($24,floor_plan_image),
        updated_at=NOW()
      WHERE id=$25`,
      [
        title_ar || title || null, title_ar || title || null, description || null, type || null, purpose || null,
        price ? Number(price) : null, area ? Number(area) : null,
        bedrooms ? Number(bedrooms) : null, bathrooms ? Number(bathrooms) : null,
        floor ? Number(floor) : null, district || null, address || null, contact_phone || null,
        down_payment || null, delivery_status || null, google_maps_url || null,
        Boolean(is_furnished), Boolean(has_parking), Boolean(has_elevator), Boolean(has_pool),
        Boolean(has_garden), Boolean(has_basement), finishing_type || null,
        floor_plan_image || null, req.params.id
      ]
    );
    if (images && images.length > 0) {
      await query('DELETE FROM property_images WHERE property_id=$1', [req.params.id]);
      for (let i = 0; i < images.length; i++) {
        await query('INSERT INTO property_images (property_id, url, is_primary, order_index) VALUES ($1,$2,$3,$4)',
          [req.params.id, images[i], i === 0, i]);
      }
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في تعديل العقار' });
  }
});

router.post('/:id/save', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await query('INSERT INTO saved_properties (user_id, property_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.user!.id, req.params.id]);
    res.json({ saved: true });
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.delete('/:id/save', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await query('DELETE FROM saved_properties WHERE user_id=$1 AND property_id=$2', [req.user!.id, req.params.id]);
    res.json({ saved: false });
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

export default router;
