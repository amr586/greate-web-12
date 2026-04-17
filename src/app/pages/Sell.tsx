import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Upload, Building2, MapPin, DollarSign, FileText, Phone, User, Mail, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router';

export function Sell() {
  const { currentUser, addRequest } = useApp();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    propertyType: 'apartment',
    location: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    floor: '',
    askingPrice: '',
    description: '',
    furnished: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRequest({
      type: 'sell',
      userId: currentUser?.id || 'guest',
      userName: form.name,
      userEmail: form.email,
      userPhone: form.phone,
      message: `نوع العقار: ${form.propertyType}، الموقع: ${form.location}، المساحة: ${form.area} م²، السعر: ${form.askingPrice} جنيه. ${form.description}`,
      status: 'pending',
    });
    setSubmitted(true);
  };

  const STEPS = [
    { num: 1, label: 'بياناتك' },
    { num: 2, label: 'بيانات العقار' },
    { num: 3, label: 'التفاصيل' },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F9F5FF] pt-20 flex items-center justify-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-10 shadow-xl max-w-md mx-auto text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-3xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-3">تم إرسال طلبك بنجاح!</h2>
          <p className="text-gray-500 mb-6">
            استلمنا طلب بيع عقارك وسيتواصل معك فريقنا خلال ٢٤ ساعة لمناقشة التفاصيل وتقديم أفضل خدمة ممكنة.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/dashboard"
              className="bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-shadow"
            >
              تابع طلبك في اللوحة
            </Link>
            <Link
              to="/"
              className="text-[#7C3AED] text-sm font-medium"
            >
              العودة للرئيسية
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F5FF] pt-20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#4C1D95] py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 size={26} className="text-white" />
            </div>
            <h1 className="text-white text-3xl font-black mb-2">أضف عقارك للبيع</h1>
            <p className="text-purple-200 text-sm">أكمل النموذج أدناه وسيتواصل معك فريقنا قريباً</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${i < STEPS.length - 1 ? '' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s.num ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-200' : 'bg-white text-gray-400 border border-gray-200'
                }`}>
                  {step > s.num ? <CheckCircle size={16} /> : s.num}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? 'text-[#7C3AED]' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 transition-all ${step > s.num ? 'bg-[#7C3AED]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100"
          >
            {/* Step 1 - Personal Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-bold text-[#0A0A0A] mb-4 flex items-center gap-2">
                  <User size={18} className="text-[#7C3AED]" />
                  بياناتك الشخصية
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">الاسم الكامل *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="أدخل اسمك"
                      className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">رقم الهاتف *</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="+20 1xxxxxxxxx"
                      dir="ltr"
                      className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">البريد الإلكتروني</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 - Property Info */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-bold text-[#0A0A0A] mb-4 flex items-center gap-2">
                  <Building2 size={18} className="text-[#7C3AED]" />
                  بيانات العقار
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">نوع العقار *</label>
                    <select
                      name="propertyType"
                      value={form.propertyType}
                      onChange={handleChange}
                      className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                    >
                      <option value="apartment">شقة</option>
                      <option value="villa">فيلا</option>
                      <option value="duplex">دوبلكس</option>
                      <option value="office">مكتب تجاري</option>
                      <option value="chalet">شاليه</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">المنطقة *</label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      required
                      placeholder="مثال: التجمع الخامس، القاهرة"
                      className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">المساحة (م²) *</label>
                    <input
                      name="area"
                      type="number"
                      value={form.area}
                      onChange={handleChange}
                      required
                      placeholder="150"
                      className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">السعر المطلوب (جنيه) *</label>
                    <input
                      name="askingPrice"
                      type="number"
                      value={form.askingPrice}
                      onChange={handleChange}
                      required
                      placeholder="3500000"
                      className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">عدد الغرف</label>
                    <input
                      name="bedrooms"
                      type="number"
                      value={form.bedrooms}
                      onChange={handleChange}
                      placeholder="3"
                      className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">عدد الحمامات</label>
                    <input
                      name="bathrooms"
                      type="number"
                      value={form.bathrooms}
                      onChange={handleChange}
                      placeholder="2"
                      className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 - Details */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-bold text-[#0A0A0A] mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-[#7C3AED]" />
                  التفاصيل الإضافية
                </h2>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">وصف العقار</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="اذكر مميزات عقارك، التشطيب، الإطلالة، وأي معلومات مهمة..."
                    className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED] resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">الطابق</label>
                  <input
                    name="floor"
                    type="number"
                    value={form.floor}
                    onChange={handleChange}
                    placeholder="مثال: 3"
                    className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="furnished"
                    checked={form.furnished}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#7C3AED]"
                  />
                  <span className="text-sm text-gray-600">العقار مفروش</span>
                </label>

                {/* Upload hint */}
                <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center">
                  <Upload size={28} className="text-[#7C3AED] mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-gray-500">سيتم طلب صور العقار عند التواصل معك</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex gap-3 mt-5">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-purple-200 text-sm font-medium text-[#7C3AED] hover:bg-purple-50 transition-colors"
              >
                السابق
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev + 1)}
                className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-purple-300 transition-shadow"
              >
                التالي
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-purple-300 transition-shadow flex items-center justify-center gap-2"
              >
                <Send size={16} />
                إرسال طلب البيع
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
