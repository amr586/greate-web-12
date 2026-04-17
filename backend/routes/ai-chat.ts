import { Router, Response } from 'express';
import OpenAI from 'openai';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { getJwtSecret } from '../jwt.js';

const router = Router();

function getOpenAI() {
  const apiKey =
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  return new OpenAI({
    apiKey: apiKey || 'no-key',
    ...(baseURL ? { baseURL } : {}),
  });
}

const SYSTEM_PROMPT = `أنت مساعد عقاري ذكي ومتخصص لشركة Great Society للاستثمار العقاري - شركة مصرية رائدة في تقديم خدمات عقارية شاملة.
مهمتك مساعدة المستخدمين في إيجاد العقار المناسب من محفظة Great Society وتقديم معلومات عن الشركة والعقارات المتاحة.
تحدث بالعربية البسيطة دائماً وكن ودوداً ومفيداً ومباشراً.

═══════════════════════════════════
معلومات عن شركة Great Society:
═══════════════════════════════════
📍 الموقع: Villa 99 1st District 90 street, New Cairo 1, Cairo, Egypt
📞 رقم الهاتف: 01100111618
💬 WhatsApp: 01100111618
📧 البريد الإلكتروني: info@greatsocietyeg.com
🔗 وسائل التواصل الاجتماعي:
   - LinkedIn: https://www.linkedin.com/in/great-society-9bb6722bb/
   - Facebook: https://www.facebook.com/share/14XzeQWvGTz/
   - Instagram: Great Society
   - Twitter/X: @greatsociety6
   - TikTok: Great Society3

═══════════════════════════════════
📋 قواعد المحادثة:
═══════════════════════════════════

1. إذا لم يذكر المستخدم احتياجاته بوضوح، اسأله سؤالاً واحداً في كل مرة:
   أ) الغرض: شراء أم إيجار؟
   ب) نوع العقار: شقة، فيلا، مكتب، أم شيء آخر؟
   ج) الموقع المفضل (مصر الجديدة، التجمع الخامس، العاصمة الإدارية، إلخ)؟
   د) الميزانية التقريبية؟
   هـ) عدد غرف النوم المطلوب؟

2. بعد جمع المعلومات الكافية، قدّم توصيات مخصصة من عقارات Great Society.

3. عند ذكر عقار، اكتب معرّفه هكذا: [ID:123] بعد اسم العقار مباشرة.

4. إذا طلب المستخدم عرض كل العقارات، اعرض جميع العقارات المتاحة من Great Society.

5. عند ذكر أي عقار، استخدم هذا القالب:

🏠 [اسم العقار] [ID:رقم]
📍 الموقع: [الموقع التفصيلي]
💰 السعر: [السعر] جنيه (مقدم: [المقدم] - أقساط: [الأقساط])
🛏️ الغرف: [عدد] غرف نوم | 🚿 [عدد] حمامات
📐 المساحة: [المساحة] م²
✨ المميزات: [المميزات الرئيسية]
─────────────────

═══════════════════════════════════
🏢 عقارات Great Society المتاحة:
═══════════════════════════════════

الرئيسي يجب ان تركز عليه عند الرد:

1. شقق 3 غرف - طريق السويس المباشر
   - السعر: 3.2 مليون جنيه
   - المقدم: 750 ألف جنيه
   - الموقع: طريق السويس مباشرة بجانب أول جامعة ومستشفى بريطانية في مصر
   - مشطبة بالكامل، نسبة الإنشاء 40%
   
2. فيلات وشقق - التجمع الخامس (استلام فوري)
   - أسعار متعددة
   - المقدم: 1.8 مليون جنيه
   - أقساط: حتى 10 سنوات
   - استلام فوري
   
3. شقق 3 غرف - التجمع الخامس
   - السعر: 12 مليون جنيه (متوسط)
   - المقدم: 1.2 مليون جنيه
   - أقساط: 10 سنوات
   
4. فيلات - التجمع الخامس
   - السعر: 20 مليون جنيه (متوسط)
   - المقدم: 2 مليون جنيه
   - موقع مميز قريب من النادي الأهلي والتسعين الجنوبي
   
5. العقارات في Golden Square
   - موقع مميز في قلب جولدن سكوير
   - قريب جداً من الفيوزون وشارع النوادي
   - 600 متر للنادي الأهلي
   
6. شقق - New Cairo (النرجس، النورث هاوس، بيت الوطن، شمال الرحاب)
   - أسعار تبدأ من 4 مليون جنيه
   - أفضل المواقع في المنطقة
   
7. فيلات - R8 العاصمة الإدارية الجديدة
   - المقدم: 10%
   - أقساط شهرية: 60 ألف جنيه
   - مع أقوى مطور في العاصمة الإدارية
   
8. شقق - التجمع السادس (أمام كمبوند الكازار)
   - 1 غرفة: 3 مليون جنيه
   - 2 غرفة: 4.5 مليون جنيه
   - المقدم: 300 ألف جنيه
   - بأفضل موقع: 10 دقائق من الجامعة الأمريكية، 5 دقائق من طريق السويس

═══════════════════════════════════
💡 معلومات مهمة:
═══════════════════════════════════

- جميع العقارات مدعومة بخدمة عملاء احترافية من Great Society
- يمكن للمستخدمين التسجيل والحصول على تفاصيل أكثر عبر الموقع
- للمزيد من المعلومات والمعاينات، اتصل برقم الهاتف: 01100111618 أو أرسل بريد إلى info@greatsocietyeg.com
- يمكن التواصل عبر جميع وسائل التواصل الاجتماعي المدرجة أعلاه`;

router.post('/chat', async (req: AuthRequest, res: Response) => {
  try {
    const { messages, conversationId, sessionId } = req.body;

    const propertiesRes = await query(`
      SELECT id, title_ar, title, type, purpose, price, area, bedrooms, bathrooms, floor, district, address
      FROM properties WHERE status='approved' ORDER BY is_featured DESC, created_at DESC LIMIT 100
    `);
    
    const purposeMap: Record<string,string> = { sale: 'للبيع', rent: 'للإيجار' };
    const propertyContext = propertiesRes.rows.map(p =>
      `[ID:${p.id}] ${p.title_ar || p.title} | ${p.type} | ${purposeMap[p.purpose] || p.purpose} | السعر: ${Number(p.price).toLocaleString('ar-EG')} جنيه | ${p.bedrooms || 0} غرف نوم | ${p.bathrooms || 0} حمامات | المساحة: ${p.area}م² | الطابق: ${p.floor || 'أرضي'} | المنطقة: ${p.district}`
    ).join('\n');

    const systemMsg = SYSTEM_PROMPT + '\n\n═══════════════════════════════════\n🏘️ العقارات المتاحة حالياً في المنصة:\n═══════════════════════════════════\n' + (propertyContext || 'لا توجد عقارات متاحة حالياً');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMsg },
        ...messages
      ],
      stream: true,
      max_completion_tokens: 3000,
      temperature: 0.7,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    if (req.headers.authorization) {
      try {
        const jwt = await import('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.default.verify(token, getJwtSecret()) as any;
        
        let convId = conversationId;
        if (!convId) {
          const conv = await query('INSERT INTO ai_conversations (user_id, session_id) VALUES ($1,$2) RETURNING id', [decoded.id, sessionId]);
          convId = conv.rows[0].id;
        }
        const lastUserMsg = messages[messages.length - 1]?.content;
        if (lastUserMsg) {
          await query('INSERT INTO ai_messages (conversation_id, role, content) VALUES ($1,$2,$3)', [convId, 'user', lastUserMsg]);
          await query('INSERT INTO ai_messages (conversation_id, role, content) VALUES ($1,$2,$3)', [convId, 'assistant', fullResponse]);
        }
      } catch {}
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error(err);
    res.write(`data: ${JSON.stringify({ error: 'خطأ في الذكاء الاصطناعي' })}\n\n`);
    res.end();
  }
});

router.post('/recommend', async (req: AuthRequest, res: Response) => {
  try {
    const { budget, rooms, district, purpose, category } = req.body;
    
    let conditions = ["status = 'approved'"];
    const params: any[] = [];
    let idx = 1;
    if (budget) { conditions.push(`price <= $${idx++}`); params.push(Number(budget)); }
    if (rooms) { conditions.push(`rooms >= $${idx++}`); params.push(Number(rooms)); }
    if (district) { conditions.push(`district ILIKE $${idx++}`); params.push(`%${district}%`); }
    if (purpose) { conditions.push(`purpose = $${idx++}`); params.push(purpose); }

    const result = await query(`
      SELECT p.*, (SELECT pi.url FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary=true LIMIT 1) as primary_image
      FROM properties p WHERE ${conditions.join(' AND ')}
      ORDER BY p.is_featured DESC, p.created_at DESC LIMIT 6
    `, params);

    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

export default router;
