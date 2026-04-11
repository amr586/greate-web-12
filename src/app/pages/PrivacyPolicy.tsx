import { motion } from 'motion/react';
import { Shield, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-white to-[#f5f1e8] pt-32 pb-20" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield size={32} className="text-[#bca056]" />
              <h1 className="text-4xl font-black text-gray-900">سياسة الخصوصية</h1>
            </div>
            <p className="text-gray-600">آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-lg shadow-[#bca056]/10 p-8 md:p-12 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">مقدمة</h2>
              <p className="text-gray-700 leading-relaxed">
                تلتزم شركة Great Society للاستثمار العقاري بحماية خصوصيتك وأمان بيانات الخصوصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات الشخصية عند استخدامك لموقعنا الإلكتروني وخدماتنا.
              </p>
            </section>

            {/* Data Collection */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. جمع المعلومات الشخصية</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">المعلومات التي تقدمها مباشرة:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                    <li>البريد الإلكتروني ورقم الهاتف</li>
                    <li>الاسم الكامل والعنوان</li>
                    <li>معلومات الدفع والحساب البنكي</li>
                    <li>تفاصيل عن احتياجاتك العقارية</li>
                    <li>التاريخ الشخصي والتفضيلات</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">المعلومات التي نجمعها تلقائياً:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                    <li>سجل الزيارات والصفحات التي تصفحتها</li>
                    <li>عنوان IP والمتصفح والجهاز المستخدم</li>
                    <li>ملفات تعريف الارتباط (Cookies)</li>
                    <li>البيانات الموقعية (عند الموافقة)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. استخدام المعلومات</h2>
              <p className="text-gray-700 leading-relaxed mb-4">نستخدم المعلومات الشخصية التي نجمعها للأغراض التالية:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>توفير وتحسين خدماتنا العقارية</li>
                <li>الاتصال بك بخصوص العقارات والفرص المتاحة</li>
                <li>معالجة عمليات الشراء والحجز</li>
                <li>إرسال تحديثات وعروض ترويجية (مع موافقتك)</li>
                <li>تحسين تجربة المستخدم والموقع</li>
                <li>الامتثال للالتزامات القانونية والنظامية</li>
                <li>منع الاحتيال والأنشطة غير القانونية</li>
              </ul>
            </section>

            {/* Data Protection */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. حماية البيانات</h2>
              <p className="text-gray-700 leading-relaxed">
                نتخذ إجراءات أمنية صارمة لحماية بيانات الخصوصية الخاصة بك، بما في ذلك تشفير البيانات، الوصول المقيد، والفحوصات الدورية. ومع ذلك، لا يمكن لأي نظام أن يكون آمناً بنسبة 100%.
              </p>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. مشاركة البيانات</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                قد نشارك المعلومات الشخصية مع:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>موظفي وشركاء Great Society</li>
                <li>خدمات الدفع والمعالجات المالية</li>
                <li>الهيئات والجهات الحكومية عند الضرورة القانونية</li>
                <li>شركاء العمل والشركات المتعاونة</li>
              </ul>
            </section>

            {/* User Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. حقوق المستخدم</h2>
              <p className="text-gray-700 leading-relaxed mb-4">لديك الحق في:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>الوصول إلى البيانات الشخصية الخاصة بك</li>
                <li>تصحيح أو تعديل البيانات غير الصحيحة</li>
                <li>طلب حذف بيانات الخصوصية الخاصة بك</li>
                <li>سحب الموافقة على معالجة البيانات</li>
                <li>تقديم شكوى إلى سلطات الحماية</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. ملفات تعريف الارتباط</h2>
              <p className="text-gray-700 leading-relaxed">
                نستخدم ملفات تعريف الارتباط لتحسين تجربة المستخدم وتتبع الأداء. يمكنك التحكم في الملفات من إعدادات متصفحك.
              </p>
            </section>

            {/* Third Party */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. الروابط الخارجية</h2>
              <p className="text-gray-700 leading-relaxed">
                قد يحتوي موقعنا على روابط لمواقع خارجية. لا نتحمل مسؤولية سياسات الخصوصية الخاصة بتلك المواقع.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. التعديلات على السياسة</h2>
              <p className="text-gray-700 leading-relaxed">
                قد نحدث هذه السياسة من وقت لآخر. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على الموقع.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. التواصل معنا</h2>
              <div className="bg-[#f5f1e8] rounded-2xl p-6 flex items-start gap-4">
                <Mail size={24} className="text-[#bca056] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-700 mb-3">
                    إذا كان لديك أي أسئلة حول سياسة الخصوصية أو بيانات الخصوصية الخاصة بك، يرجى التواصل معنا:
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p>البريد الإلكتروني: <a href="mailto:info@greatsocietyeg.com" className="text-[#bca056] font-semibold hover:underline">info@greatsocietyeg.com</a></p>
                    <p>الهاتف: <a href="tel:+201100111618" className="text-[#bca056] font-semibold hover:underline">01100111618</a></p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
