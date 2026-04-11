import { motion } from 'motion/react';
import { FileText, AlertCircle } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-white to-[#f5f1e8] pt-32 pb-20" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText size={32} className="text-[#bca056]" />
              <h1 className="text-4xl font-black text-gray-900">الشروط والأحكام</h1>
            </div>
            <p className="text-gray-600">آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-lg shadow-[#bca056]/10 p-8 md:p-12 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">مقدمة</h2>
              <p className="text-gray-700 leading-relaxed">
                تحكم هذه الشروط والأحكام استخدام موقع وخدمات شركة Great Society للاستثمار العقاري. باستخدامك للموقع أو الخدمات، فإنك توافق على الالتزام بجميع الشروط المذكورة أدناه. إذا لم توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع.
              </p>
            </section>

            {/* Terms of Service */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. شروط الخدمة</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">أهلية المستخدم:</h3>
                  <p className="text-gray-700">
                    يجب أن تكون بعمر 18 سنة على الأقل لاستخدام الخدمة. الشركات والمؤسسات يجب أن تكون ممثلة من قبل شخص مصرح.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">الحساب والمسؤولية:</h3>
                  <p className="text-gray-700 mb-2">
                    أنت مسؤول عن الحفاظ على سرية كلمة مرورك وجميع الأنشطة التي تتم على حسابك. توافق على إخطارنا فوراً بأي استخدام غير مصرح للحساب.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">استخدام المحتوى:</h3>
                  <p className="text-gray-700">
                    يحظر استخدام محتوى الموقع للأغراض التجارية دون إذن كتابي من الشركة. جميع الحقوق محفوظة لـ Great Society.
                  </p>
                </div>
              </div>
            </section>

            {/* Property Listing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. إدراج العقارات والإعلانات</h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  عند إدراج عقار على الموقع، توافق على:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                  <li>أن جميع المعلومات المقدمة صحيحة وكاملة</li>
                  <li>أن لديك الحق في إدراج العقار أو تمثيل مالكه</li>
                  <li>أن الصور والوثائق المرفقة ملكك أو لديك الإذن باستخدامها</li>
                  <li>الالتزام بجميع القوانين المحلية والدولية</li>
                  <li>عدم الإعلان عن خدمات أو منتجات محظورة</li>
                </ul>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. الأنشطة المحظورة</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                يحظر على المستخدمين:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>نشر معلومات كاذبة أو مضللة</li>
                <li>الالتزام بالأنشطة غير القانونية</li>
                <li>التحرش أو الإساءة للمستخدمين الآخرين</li>
                <li>محاولة اختراق أو تعطيل الموقع</li>
                <li>نشر محتوى فاضح أو مسيء</li>
                <li>التعامل بنية احتيالية</li>
                <li>انتهاك حقوق الملكية الفكرية</li>
              </ul>
            </section>

            {/* Payments */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. المدفوعات والتسعير</h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  جميع الأسعار معروضة بالجنيه المصري وتشمل الضرائب المقررة. نحتفظ بالحق في تعديل الأسعار في أي وقت. الرسوم غير قابلة للاسترجاع إلا في الحالات المنصوص عليها قانونياً.
                </p>
                <p className="text-gray-700">
                  نقبل طرق دفع آمنة ومشفرة. بتقديمك معلومات الدفع، توافق على معالجتها وفقاً لسياسة الخصوصية.
                </p>
              </div>
            </section>

            {/* Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. التنصل من المسؤولية</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
                <AlertCircle size={24} className="text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-amber-900">
                    الموقع يُقدم &quot;كما هو&quot; دون أي ضمانات. لا نتحمل المسؤولية عن:
                  </p>
                  <ul className="list-disc list-inside text-amber-900 space-y-1 mt-3 mr-4">
                    <li>الأخطاء أو التأخيرات في الخدمة</li>
                    <li>دقة المعلومات المدرجة من قبل المستخدمين الآخرين</li>
                    <li>الخسائر الناجمة عن استخدام الموقع</li>
                    <li>أي نزاعات بين المستخدمين</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. حل النزاعات</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                أي نزاعات ناشئة عن استخدام الموقع تخضع لقوانين جمهورية مصر العربية. يتفق الطرفان على الخضوع للاختصاص الكامل للمحاكم المصرية. قبل اللجوء للقضاء، يلتزم الطرفان بمحاولة حل النزاع بالتفاوض والوساطة.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. الملكية الفكرية</h2>
              <p className="text-gray-700 leading-relaxed">
                جميع محتوى الموقع بما في ذلك التصاميم والنصوص والصور والشعارات محمية بحقوق الملكية الفكرية. يُحظر نسخ أو إعادة استخدام أي محتوى دون إذن صريح من Great Society.
              </p>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. تعديل الشروط والخدمة</h2>
              <p className="text-gray-700 leading-relaxed">
                نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إخطارك بأي تغييرات جوهرية. استمرار استخدامك للموقع يعني قبولك للشروط المعدلة.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. إنهاء الخدمة</h2>
              <p className="text-gray-700 leading-relaxed">
                يمكننا إنهاء خدمتنا للمستخدم الذي ينتهك هذه الشروط أو يتعامل بنية احتيالية. لديك الحق في إلغاء حسابك في أي وقت.
              </p>
            </section>

            {/* Entire Agreement */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. الاتفاق الكامل</h2>
              <p className="text-gray-700 leading-relaxed">
                تشكل هذه الشروط والأحكام الاتفاق الكامل بين الطرفين بخصوص استخدام الموقع وتحل محل جميع الاتفاقات السابقة.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. التواصل والدعم</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                لأي استفسارات حول هذه الشروط والأحكام، يرجى التواصل معنا على:
              </p>
              <div className="bg-[#f5f1e8] rounded-2xl p-6 space-y-2 text-gray-700">
                <p>البريد الإلكتروني: <a href="mailto:info@greatsocietyeg.com" className="text-[#bca056] font-semibold hover:underline">info@greatsocietyeg.com</a></p>
                <p>الهاتف: <a href="tel:+201100111618" className="text-[#bca056] font-semibold hover:underline">01100111618</a></p>
                <p>الموقع: Villa 99 1st District 90 street, New Cairo 1, Cairo, Egypt</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
