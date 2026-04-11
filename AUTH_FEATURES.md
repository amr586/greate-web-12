# 🔐 ميزات المصادقة والتحقق

## الميزات المضافة

### 1. ✅ OTP لـ Login (تسجيل الدخول)
**الملفات المتعلقة:**
- Frontend: `src/app/pages/Login.tsx`
- Backend: `server/routes/auth.ts` - endpoints `/send-login-otp` و `/verify-login-otp`
- API Client: `src/app/lib/api.ts`

**آلية العمل:**
1. المستخدم يدخل البريد الإلكتروني أو رقم الهاتف + كلمة المرور
2. النقر على "التالي - إرسال رمز التحقق"
3. يتم إرسال OTP (6 أرقام) إلى بريد المستخدم
4. المستخدم يدخل الرمز في الحقول الستة
5. تم التحقق وتسجيل الدخول

**الخصائص الأمان:**
- صلاحية الرمز: 5 دقائق فقط
- عدد محاولات: 3 فقط قبل الحجب لمدة 10 دقائق
- معدل الإرسال: رمز واحد كل 60 ثانية

---

### 2. ✅ OTP لـ Register (إنشاء الحساب)
**الملفات المتعلقة:**
- Frontend: `src/app/pages/Register.tsx`
- Backend: `server/routes/auth.ts` - endpoints `/send-otp` و `/verify-otp`
- API Client: `src/app/lib/api.ts`

**آلية العمل:**
1. المستخدم يملأ بيانات: الاسم، البريد، الهاتف، كلمة المرور
2. النقر على "التالي - إرسال رمز التحقق"
3. تتحقق البيانات من جانب الخادم
4. يتم إرسال OTP إلى البريد الإلكتروني
5. المستخدم يدخل الرمز
6. تم إنشاء الحساب وتسجيل الدخول تلقائياً

**التحقق من صحة البيانات:**
- الاسم: إجباري وغير فارغ
- البريد: صيغة صحيحة (example@email.com)
- الهاتف: صيغة مصرية (01xxxxxxxxx)
- كلمة المرور: 8+ حروف + حرف كبير + رمز خاص

---

### 3. ✅ استرجاع كلمة المرور (Forgot Password)
**الملفات المتعلقة:**
- Frontend: `src/app/pages/ForgotPassword.tsx`
- Backend: `server/routes/auth.ts` - endpoints `/forgot-password`, `/verify-forgot-password`, `/reset-password`
- Routes: `src/app/routes.ts`

**آلية العمل:**
1. **الخطوة 1 - إدخال البريد:**
   - المستخدم يدخل بريده الإلكتروني المسجل
   - النقر على "التالي - إرسال رمز التحقق"

2. **الخطوة 2 - التحقق من OTP:**
   - يتم إرسال رمز OTP إلى البريد
   - المستخدم يدخل الرمز في الحقول الستة

3. **الخطوة 3 - تعيين كلمة مرور جديدة:**
   - إدخال كلمة المرور الجديدة مع نفس متطلبات التحقق
   - تأكيد كلمة المرور

4. **النجاح:**
   - رسالة تأكيد بتغيير كلمة المرور بنجاح
   - زر للعودة إلى صفحة تسجيل الدخول

---

### 4. ✅ Remember Me (تذكرني لمدة شهر)
**الملفات المتعلقة:**
- Frontend: `src/app/pages/Login.tsx`, `src/app/context/AuthContext.tsx`
- Storage: localStorage (remembered_email, remember_expiry, remembered_token)

**آلية العمل:**
1. في صفحة تسجيل الدخول، يوجد checkbox "تذكرني لمدة شهر واحد"
2. عند اختياره والدخول بنجاح:
   - يتم حفظ البريد الإلكتروني/الهاتف
   - يتم حفظ الـ token
   - يتم حفظ تاريخ انتهاء الصلاحية (30 يوم من الآن)

3. عند العودة للموقع:
   - يتم التحقق من انتهاء الصلاحية
   - إذا كانت صحيحة، يتم استرجاع البريد والـ token تلقائياً
   - المستخدم يكون مسجل دخول مباشرة

**الأمان:**
- الـ token محفوظ في localStorage (لا يُستخدم cookie HTTP-Only للتبسيط)
- يتم التحقق من تاريخ الانتهاء عند كل فتح
- عند logout، يتم حذف جميع البيانات المحفوظة

---

## ملخص النقاط الأمان

| الميزة | الوصف |
|--------|-------|
| **OTP صلاحية** | 5 دقائق |
| **محاولات OTP** | 3 فقط ثم حجب لمدة 10 دقائق |
| **معدل الإرسال** | رمز واحد كل 60 ثانية |
| **كلمة المرور** | 8+ حروف + حرف كبير + رمز خاص |
| **Remember Me** | 30 يوم أو حتى الخروج اليدوي |
| **Forgotten Password** | OTP محمي بنفس معايير الأمان |

---

## Endpoints المضافة

### تسجيل الدخول OTP
```
POST /api/auth/send-login-otp
Body: { emailOrPhone, password }
Response: { success, email, message, devOtp? }

POST /api/auth/verify-login-otp
Body: { email, otp }
Response: { user, token }
```

### إنشاء الحساب OTP
```
POST /api/auth/send-otp
Body: { name, email, phone, password, otpMethod }
Response: { success, message }

POST /api/auth/verify-otp
Body: { email, otp }
Response: { user, token }
```

### استرجاع كلمة المرور
```
POST /api/auth/forgot-password
Body: { email }
Response: { success, message, devOtp? }

POST /api/auth/verify-forgot-password
Body: { email, otp }
Response: { success }

POST /api/auth/reset-password
Body: { email, otp, newPassword }
Response: { success, message }
```

---

## متغيرات البيئة المطلوبة

```
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
JWT_SECRET=your-jwt-secret-key
DATABASE_URL=postgresql://user:password@host/dbname
```

---

## اختبار الميزات

### في بيئة التطوير
1. إذا لم يكن الـ email موجود، سيظهر رمز OTP في console كـ devOtp
2. استخدمه مباشرة في الحقول الستة

### في الإنتاج
1. تأكد من إعدادات Gmail (App Password)
2. الرموز ترسل عبر البريد فقط

---

## ملاحظات مهمة

✅ **تم تنفيذه:**
- OTP لـ Login و Register
- استرجاع كلمة المرور بـ OTP
- Remember Me لمدة 30 يوم
- الدخول التلقائي عند التوافق مع البيانات المحفوظة
- رسائل بريد احترافية وآمنة

⚠️ **تأكد من:**
- تفعيل SMTP_USER و SMTP_PASS قبل الإطلاق
- حفظ JWT_SECRET الآمن والعشوائي
- استخدام HTTPS في الإنتاج
