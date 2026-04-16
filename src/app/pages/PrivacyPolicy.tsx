import { motion } from 'motion/react';
import { Shield, Mail, Scale, FileText } from 'lucide-react';
import { useLocation } from 'react-router';

export default function PrivacyPolicy() {
  const location = useLocation();
  const isTerms = location.pathname.includes('terms');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-white to-[#f5f1e8] pt-32 pb-20" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              {isTerms ? <Scale size={32} className="text-[#bca056]" /> : <Shield size={32} className="text-[#bca056]" />}
              <h1 className="text-4xl font-black text-gray-900">
                {isTerms ? 'الشروط والأحكام' : 'سياسة الخصوصية'}
              </h1>
            </div>
            <p className="text-gray-600">شركة Great Society - آخر تحديث: 12/04/2026</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-lg shadow-[#bca056]/10 p-8 md:p-12 space-y-8">
            
            {/* Privacy Policy Section */}
            {!isTerms && (
              <>
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">أولاً: سياسة الخصوصية</h2>
                  <p className="text-gray-700 leading-relaxed">
                    تلتزم شركة Great Society بحماية خصوصية مستخدمي موقعها الإلكتروني، وتهدف هذه السياسة إلى توضيح كيفية جمع واستخدام وحماية المعلومات الشخصية عند استخدام منصة العقارات الخاصة بنا.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. المعلومات التي نقوم بجمعها</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">نقوم بجمع أنواع مختلفة من المعلومات، بما في ذلك:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li><span className="font-semibold">المعلومات الشخصية:</span> مثل الاسم، البريد الإلكتروني، ورقم الهاتف</li>
                    <li><span className="font-semibold">معلومات الحساب:</span> عند التسجيل أو نشر إعلان عقاري</li>
                    <li><span className="font-semibold">معلومات العقارات:</span> مثل تفاصيل العقار، الموقع، السعر، والصور</li>
                    <li><span className="font-semibold">المعلومات التقنية:</span> مثل عنوان بروتوكول الإنترنت (IP)، نوع المتصفح، ونظام التشغيل</li>
                    <li><span className="font-semibold">ملفات تعريف الارتباط (Cookies):</span> لتحسين تجربة المستخدم</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. كيفية استخدام المعلومات</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">نستخدم البيانات التي يتم جمعها للأغراض التالية:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>تقديم خدمات عرض وبيع وتأجير العقارات</li>
                    <li>إدارة حسابات المستخدمين</li>
                    <li>تحسين أداء الموقع وتجربة المستخدم</li>
                    <li>التواصل مع المستخدمين بشأن الاستفسارات والخدمات</li>
                    <li>إرسال الإشعارات والعروض الترويجية بموافقة المستخدم</li>
                    <li>تعزيز الأمان ومنع الاحتيال</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. مشاركة المعلومات</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">لا تقوم الشركة ببيع أو تأجير البيانات الشخصية. ومع ذلك، قد يتم الإفصاح عن المعلومات في الحالات التالية:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>الامتثال للمتطلبات القانونية</li>
                    <li>حماية حقوق وممتلكات الشركة أو المستخدمين</li>
                    <li>التعاون مع مزودي الخدمات المسؤولين عن تشغيل الموقع</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. حماية البيانات</h2>
                  <p className="text-gray-700 leading-relaxed">
                    تلتزم شركة Great Society بتطبيق التدابير الأمنية المناسبة لحماية البيانات من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. ملفات تعريف الارتباط (Cookies)</h2>
                  <p className="text-gray-700 leading-relaxed">
                    يستخدم الموقع ملفات تعريف الارتباط لتحسين تجربة التصفح. يمكن للمستخدم تعطيلها من خلال إعدادات المتصفح.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. حقوق المستخدم</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">يحق للمستخدم:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>الوصول إلى بياناته الشخصية</li>
                    <li>طلب تصحيح أو تحديث البيانات</li>
                    <li>طلب حذف البيانات</li>
                    <li>سحب الموافقة على معالجة البيانات</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. روابط الطرف الثالث</h2>
                  <p className="text-gray-700 leading-relaxed">
                    قد يحتوي الموقع على روابط لمواقع خارجية، ولا تتحمل الشركة مسؤولية سياسات الخصوصية الخاصة بها.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">8. تحديثات سياسة الخصوصية</h2>
                  <p className="text-gray-700 leading-relaxed">
                    تحتفظ الشركة بالحق في تعديل هذه السياسة في أي وقت، ويتم نشر التحديثات على هذه الصفحة.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">9. التواصل معنا</h2>
                  <div className="bg-[#f5f1e8] rounded-2xl p-6">
                    <p className="text-gray-700 mb-4">لأي استفسارات تتعلق بسياسة الخصوصية، يرجى التواصل عبر:</p>
                    <div className="space-y-2 text-gray-700">
                      <p>البريد الإلكتروني: <a href="mailto:info@greatsocietyeg.com" className="text-[#bca056] font-semibold hover:underline">info@greatsocietyeg.com</a></p>
                      <p>الهاتف: <a href="tel:+201100957594" className="text-[#bca056] font-semibold hover:underline">+20 11 00957594</a></p>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Terms and Conditions Section */}
            {isTerms && (
              <>
                <section>
                  <p className="text-gray-700 leading-relaxed text-lg mb-6">
                    باستخدامك لموقع Great Society، فإنك توافق على الالتزام بالشروط والأحكام التالية:
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. التعريفات</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li><span className="font-semibold">"الموقع":</span> منصة إلكترونية متخصصة في عرض وبيع وتأجير العقارات</li>
                    <li><span className="font-semibold">"الشركة":</span> شركة Great Society</li>
                    <li><span className="font-semibold">"المستخدم":</span> أي شخص يقوم بزيارة الموقع أو استخدام خدماته</li>
                    <li><span className="font-semibold">"المعلن":</span> أي مستخدم يقوم بنشر إعلان عقاري على الموقع</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. استخدام الموقع</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">يوافق المستخدم على:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>تقديم معلومات دقيقة وصحيحة</li>
                    <li>استخدام الموقع لأغراض قانونية فقط</li>
                    <li>عدم نشر أي محتوى مخالف للقوانين أو الآداب العامة</li>
                    <li>عدم استخدام الموقع بطريقة تضر بخدماته أو مستخدميه</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. إنشاء الحساب</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>يتحمل المستخدم مسؤولية الحفاظ على سرية بيانات تسجيل الدخول</li>
                    <li>يحق للشركة تعليق أو حذف أي حساب يخالف الشروط</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. نشر الإعلانات العقارية</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>يتحمل المعلن مسؤولية صحة المعلومات المنشورة</li>
                    <li>يجب أن تكون جميع العقارات قانونية وحقيقية</li>
                    <li>يحق للشركة تعديل أو حذف أي إعلان مخالف دون إشعار مسبق</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. الرسوم والمدفوعات</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>قد تفرض الشركة رسومًا على بعض الخدمات المميزة</li>
                    <li>جميع الرسوم غير قابلة للاسترداد ما لم يُنص على خلاف ذلك</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. الملكية الفكرية</h2>
                  <p className="text-gray-700 leading-relaxed">
                    جميع محتويات الموقع، بما في ذلك النصوص والتصاميم والشعارات والصور، مملوكة لشركة Great Society، ولا يجوز استخدامها دون إذن كتابي مسبق.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. حدود المسؤولية</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>يعمل الموقع كوسيط بين البائعين والمشترين</li>
                    <li>لا تتحمل الشركة مسؤولية أي نزاعات تنشأ بين الأطراف</li>
                    <li>يتحمل المستخدم مسؤولية التحقق من صحة المعلومات قبل اتخاذ أي قرار</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">8. إخلاء المسؤولية</h2>
                  <p className="text-gray-700 leading-relaxed">
                    لا تضمن الشركة دقة أو اكتمال جميع الإعلانات المنشورة على الموقع، وتقع مسؤولية التحقق على المستخدم.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">9. إنهاء الاستخدام</h2>
                  <p className="text-gray-700 leading-relaxed">
                    يحق للشركة تعليق أو إنهاء وصول أي مستخدم يخالف هذه الشروط دون إشعار مسبق.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. القانون المعمول به</h2>
                  <p className="text-gray-700 leading-relaxed">
                    تخضع هذه الشروط والأحكام لقوانين جمهورية مصر العربية، وتختص المحاكم المصرية بالفصل في أي نزاع ينشأ عنها.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">11. التعديلات</h2>
                  <p className="text-gray-700 leading-relaxed">
                    تحتفظ شركة Great Society بالحق في تعديل هذه الشروط والأحكام في أي وقت، ويعد استمرار استخدام الموقع موافقة على التعديلات.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">12. معلومات التواصل</h2>
                  <div className="bg-[#f5f1e8] rounded-2xl p-6">
                    <p className="font-semibold text-gray-900 mb-2">شركة Great Society</p>
                    <div className="space-y-2 text-gray-700">
                      <p>البريد الإلكتروني: <a href="mailto:info@greatsocietyeg.com" className="text-[#bca056] font-semibold hover:underline">info@greatsocietyeg.com</a></p>
                      <p>الهاتف: <a href="tel:+201100957594" className="text-[#bca056] font-semibold hover:underline">+20 11 00957594</a></p>
                      <p>العنوان: الإسكندرية، مصر</p>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Copyright */}
            <section className="border-t pt-8">
              <div className="text-center text-gray-600">
                <p className="font-semibold text-lg">© 2026 Great Society. جميع الحقوق محفوظة.</p>
                <p className="mt-2">Alexandira, Egypt - الإسكندرية، مصر</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
