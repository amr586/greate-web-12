import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Phone, CheckCircle, AlertCircle, Copy, Building2, ArrowRight, Shield, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const WALLET_NUMBER = '+201281378331';
const WALLET_DISPLAY = '01281378331';

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [method, setMethod] = useState<'instapay' | 'vodafone'>('instapay');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProp, setLoadingProp] = useState(true);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!id) return;
    api.getProperty(Number(id))
      .then(setProperty)
      .catch(() => navigate('/properties'))
      .finally(() => setLoadingProp(false));
  }, [id, user]);

  const copyNumber = () => {
    navigator.clipboard.writeText(WALLET_DISPLAY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setLoading(true);
    setError('');
    try {
      await api.requestPayment({
        property_id: property.id,
        amount: property.price,
        payment_method: method,
        notes,
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProp) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="w-10 h-10 border-3 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
    </div>
  );

  if (!property) return null;

  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&fit=crop';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50 pt-20 pb-12" dir="rtl">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {done ? (
            <div className="bg-white rounded-3xl shadow-xl shadow-purple-100/50 p-10 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle size={48} className="text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">تم إرسال طلب الدفع!</h2>
              <p className="text-gray-500 mb-2">سيتم مراجعة طلبك من قِبل الإدارة وتأكيده خلال 24 ساعة.</p>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 my-4 text-right">
                <p className="text-green-800 text-sm font-bold mb-1">خطوات إكمال الدفع:</p>
                <ol className="text-green-700 text-sm space-y-1 list-decimal list-inside">
                  <li>قم بتحويل {Number(property.price).toLocaleString()} جنيه إلى الرقم: <strong>{WALLET_DISPLAY}</strong></li>
                  <li>عبر {method === 'instapay' ? 'InstaPay (إنستا باي)' : 'فودافون كاش'}</li>
                  <li>خذ صورة (screenshot) من إيصال التحويل</li>
                  <li>أرسل الصورة على واتساب للتأكيد</li>
                </ol>
              </div>
              <a
                href={`https://wa.me/${WALLET_NUMBER.replace(/[^0-9]/g, '')}?text=مرحباً، أرسلت تحويل لعقار: ${property.title_ar || property.title} - المبلغ: ${Number(property.price).toLocaleString()} جنيه عبر ${method === 'instapay' ? 'InstaPay' : 'Vodafone Cash'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all w-full mb-3"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                أرسل صورة الإيصال على واتساب الآن
              </a>
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-purple-300 transition-all"
                >
                  متابعة في حسابي
                </button>
                <button onClick={() => navigate('/properties')}
                  className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                >
                  تصفح العقارات
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Property Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex gap-4 items-center">
                <img
                  src={property.primary_image || property.images?.[0]?.url || DEFAULT_IMAGE}
                  alt=""
                  className="w-20 h-16 rounded-xl object-cover flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 line-clamp-1">{property.title_ar || property.title}</p>
                  <p className="text-gray-500 text-sm">{property.district}</p>
                  <p className="text-[#7C3AED] font-black text-lg">{Number(property.price).toLocaleString()} جنيه</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl shadow-purple-100/30 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] p-6 text-center">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CreditCard size={28} className="text-white" />
                  </div>
                  <h1 className="text-white font-black text-xl">إتمام عملية الدفع</h1>
                  <p className="text-purple-200 text-sm mt-1">اختر طريقة الدفع المناسبة لك</p>
                </div>

                <div className="p-6">
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">
                      <AlertCircle size={16} />{error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">طريقة الدفع</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            value: 'instapay',
                            label: 'InstaPay',
                            subLabel: 'إنستا باي',
                            icon: '💳',
                            color: 'from-blue-500 to-blue-600',
                          },
                          {
                            value: 'vodafone',
                            label: 'Vodafone Cash',
                            subLabel: 'فودافون كاش',
                            icon: '📱',
                            color: 'from-red-500 to-red-600',
                          },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMethod(opt.value as 'instapay' | 'vodafone')}
                            className={`relative rounded-2xl p-4 text-center border-2 transition-all ${
                              method === opt.value
                                ? 'border-[#7C3AED] bg-purple-50 shadow-md shadow-purple-100'
                                : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                            }`}
                          >
                            {method === opt.value && (
                              <div className="absolute top-2 left-2 w-5 h-5 bg-[#7C3AED] rounded-full flex items-center justify-center">
                                <CheckCircle size={12} className="text-white" />
                              </div>
                            )}
                            <div className="text-3xl mb-2">{opt.icon}</div>
                            <p className="font-black text-gray-900 text-sm">{opt.label}</p>
                            <p className="text-gray-500 text-xs">{opt.subLabel}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wallet Info */}
                    <div className="bg-gradient-to-br from-[#7C3AED]/5 to-purple-50 rounded-2xl p-5 border border-purple-100">
                      <p className="text-sm font-bold text-gray-700 mb-3">
                        قم بتحويل المبلغ إلى:
                      </p>
                      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-purple-100 mb-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">رقم المحفظة</p>
                          <p className="font-black text-gray-900 text-lg tracking-wide" dir="ltr">{WALLET_DISPLAY}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <AnimatePresence>
                            {copied && (
                              <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                className="text-xs text-green-600 font-medium"
                              >تم النسخ!</motion.span>
                            )}
                          </AnimatePresence>
                          <button type="button" onClick={copyNumber}
                            className="w-9 h-9 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] rounded-lg flex items-center justify-center transition-all"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">المبلغ المطلوب:</span>
                        <span className="text-[#7C3AED] font-black text-xl">{Number(property.price).toLocaleString()} جنيه</span>
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Shield size={16} className="text-[#7C3AED]" />خطوات الدفع
                      </p>
                      <div className="space-y-2">
                        {[
                          `افتح تطبيق ${method === 'instapay' ? 'InstaPay' : 'فودافون كاش'}`,
                          `حوّل مبلغ ${Number(property.price).toLocaleString()} جنيه إلى: ${WALLET_DISPLAY}`,
                          'اكتب اسم العقار في خانة البيان',
                          'أرسل لنا إيصال التحويل عبر واتساب',
                        ].map((step, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-[#7C3AED] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                            <p className="text-gray-600 text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">ملاحظات إضافية (اختياري)</label>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                        placeholder="أضف أي ملاحظات..."
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C3AED] transition-all resize-none"
                      />
                    </div>

                    {/* Notice */}
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <Clock size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-amber-700 text-xs">سيتم مراجعة طلبك وتأكيد الدفع خلال 24 ساعة. تواصل معنا عبر واتساب لأي استفسار.</p>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-4 rounded-2xl text-base font-black shadow-xl shadow-purple-200 hover:shadow-purple-300 transition-all disabled:opacity-70"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          جاري الإرسال...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle size={18} />
                          تأكيد طلب الدفع
                        </span>
                      )}
                    </motion.button>
                  </form>

                  {/* WhatsApp CTA */}
                  <div className="mt-4 text-center">
                    <a href={`https://wa.me/201281378331?text=مرحباً، أريد دفع قيمة العقار: ${property.title_ar || property.title}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      تواصل عبر واتساب للمساعدة
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
