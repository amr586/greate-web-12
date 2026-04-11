# 🧪 دليل اختبار الميزات الجديدة

## اختبار سريع بدون Email

### 1️⃣ اختبار Login OTP

**الخطوات:**
1. اذهب إلى صفحة `/login`
2. أدخل:
   - البريد أو الهاتف: `test@example.com` أو أي بريد موجود في قاعدة البيانات
   - كلمة المرور: كلمة المرور الصحيحة
3. اضغط "التالي - إرسال رمز التحقق"
4. انظر إلى console (F12 → Console)
5. ستجد رسالة تقول:
   ```
   [OTP NO-SMTP] To: email@example.com | Code: 123456
   ```
6. أدخل الرمز في الحقول الستة
7. اضغط "تأكيد وتسجيل الدخول"

---

### 2️⃣ اختبار Register OTP

**الخطوات:**
1. اذهب إلى صفحة `/register`
2. أدخل البيانات:
   - الاسم: `اختبار المستخدم`
   - البريد: `newuser@example.com`
   - الهاتف: `01012345678`
   - كلمة المرور: `TestPass123!`
   - تأكيد: `TestPass123!`
3. اضغط "التالي - إرسال رمز التحقق"
4. انظر إلى console للرمز
5. أدخل الرمز وأنشئ الحساب

---

### 3️⃣ اختبار Forgot Password

**الخطوات:**
1. اذهب إلى `/login`
2. اضغط على "نسيت كلمة المرور؟"
3. أدخل البريد الإلكتروني
4. اضغط "التالي - إرسال رمز التحقق"
5. احصل على الرمز من console
6. أدخل رمز التحقق
7. أدخل كلمة مرور جديدة:
   - الكلمة الجديدة: `NewPass456!`
   - التأكيد: `NewPass456!`
8. اضغط "تعيين كلمة المرور الجديدة"

---

### 4️⃣ اختبار Remember Me (تذكرني)

**الخطوات:**
1. اذهب إلى `/login`
2. أدخل بيانات الدخول
3. ✅ اختر "تذكرني لمدة شهر واحد"
4. اضغط "تأكيد وتسجيل الدخول"
5. تحقق من localStorage:
   ```javascript
   // في Browser Console:
   localStorage.getItem('remembered_email')      // البريد المحفوظ
   localStorage.getItem('remember_expiry')        // تاريخ الانتهاء
   localStorage.getItem('remembered_token')       // الـ token
   ```
6. أغلق التطبيق وأعد تحميل الصفحة
7. يجب أن يكون مسجل دخول تلقائياً

---

## اختبار مع Email حقيقي

### إعداد Gmail

1. **فعّل Gmail App Password:**
   - اذهب إلى https://myaccount.google.com/apppasswords
   - اختر "Mail" و "Windows Computer"
   - انسخ كلمة المرور المولدة

2. **أضف المتغيرات في `.env`:**
   ```
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password-16-chars
   ```

3. **أعد تشغيل الخادم:**
   ```bash
   npm run dev
   ```

4. الآن ستستقبل رسائل بريد حقيقية ✅

---

## رسائل الخطأ المتوقعة

### عند OTP:
```javascript
// صلاحية انتهت
"انتهت صلاحية رمز التحقق. اضغط إعادة الإرسال"

// محاولات انتهت
"تجاوزت الحد الأقصى للمحاولات. محجوب لمدة 10 دقائق"

// رمز خاطئ
"رمز التحقق غير صحيح. محاولتان متبقيتان"

// سرعة الإرسال
"يرجى الانتظار 45 ثانية قبل طلب رمز جديد"
```

### عند Forgot Password:
```javascript
// البريد غير موجود
"لم يتم العثور على حساب بهذا البريد الإلكتروني"

// كلمة المرور ضعيفة
"يجب أن تحتوي على حرف كبير على الأقل"
```

---

## التحقق من قاعدة البيانات

### عرض جدول OTP Codes:

```sql
SELECT * FROM otp_codes ORDER BY created_at DESC LIMIT 10;
```

**الأعمدة:**
- `identifier`: البريد الإلكتروني
- `code`: الرمز (6 أرقام)
- `type`: نوع (register, login, forgot-password)
- `expires_at`: موعد الانتهاء
- `attempts`: عدد المحاولات الخاطئة
- `locked_until`: إلى متى محجوب
- `used`: هل تم استخدامه

### عرض جدول Users:

```sql
SELECT id, email, phone, role, created_at FROM users ORDER BY created_at DESC;
```

---

## Checklist الاختبار الكامل

- [ ] ✅ OTP Register يعمل وينشئ حساب
- [ ] ✅ OTP Login يعمل ويسجل دخول
- [ ] ✅ Forgot Password يعمل ويغير كلمة المرور
- [ ] ✅ Remember Me يحفظ البيانات
- [ ] ✅ التسجيل التلقائي يعمل عند العودة
- [ ] ✅ Logout يحذف البيانات المحفوظة
- [ ] ✅ OTP ينتهي بعد 5 دقائق
- [ ] ✅ الحجب بعد 3 محاولات
- [ ] ✅ رسائل الخطأ واضحة
- [ ] ✅ الواجهة سلسة وسهلة الاستخدام

---

## نصائح للتطوير

### Simulate Expiry
```javascript
// في Browser Console لتعديل تاريخ الانتهاء:
localStorage.setItem('remember_expiry', (Date.now() - 1000).toString());
// ثم أعد تحميل الصفحة - يجب أن يطلب تسجيل دخول جديد
```

### Debug OTP State
```javascript
// عرض كل بيانات Auth:
console.log({
  token: localStorage.getItem('token'),
  remembered_email: localStorage.getItem('remembered_email'),
  remember_expiry: localStorage.getItem('remember_expiry'),
  remembered_token: localStorage.getItem('remembered_token'),
  expiry_valid: Date.now() < parseInt(localStorage.getItem('remember_expiry') || '0')
});
```

### Clear All Auth Data
```javascript
// حذف جميع بيانات المصادقة:
localStorage.removeItem('token');
localStorage.removeItem('remembered_email');
localStorage.removeItem('remember_expiry');
localStorage.removeItem('remembered_token');
window.location.reload();
```

---

## الدعم والتصحيح

إذا حدثت مشكلة:
1. تحقق من Network Tab في DevTools
2. شغل الخادم مع: `npm run dev`
3. تأكد من إعدادات .env
4. افحص قاعدة البيانات
5. امسح localStorage وأعد التجربة
