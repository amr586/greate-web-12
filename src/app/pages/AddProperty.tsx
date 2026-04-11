import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Building2, MapPin, DollarSign, Home, CheckCircle, Info, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const TYPES = ['شقة', 'فيلا', 'مكتب', 'شاليه', 'محل تجاري', 'أرض', 'دوبلكس', 'بنتهاوس'];
const DISTRICTS = ['سيدي جابر', 'سموحة', 'المنتزه', 'العجمي', 'ستانلي', 'المندرة', 'كليوباترا', 'محطة الرمل', 'الأنفوشي', 'الميناء', 'الدخيلة', 'برج العرب'];

interface UploadedImage {
  url: string;
  preview: string;
  uploading?: boolean;
  error?: string;
}

export default function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [form, setForm] = useState({
    title: '', title_ar: '', description: '', description_ar: '',
    type: 'شقة', purpose: 'sale', price: '', area: '',
    rooms: '', bathrooms: '', floor: '', district: 'سيدي جابر',
    city: 'الإسكندرية', address: '',
  });

  const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - uploadedImages.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) return;

    const newImages: UploadedImage[] = toUpload.map(f => ({
      url: '',
      preview: URL.createObjectURL(f),
      uploading: true,
    }));

    setUploadedImages(prev => [...prev, ...newImages]);
    const startIdx = uploadedImages.length;

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      try {
        const formData = new FormData();
        formData.append('image', file);
        const token = localStorage.getItem('token');
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل الرفع');
        setUploadedImages(prev => {
          const updated = [...prev];
          updated[startIdx + i] = { ...updated[startIdx + i], url: data.url, uploading: false };
          return updated;
        });
      } catch (err: any) {
        setUploadedImages(prev => {
          const updated = [...prev];
          updated[startIdx + i] = { ...updated[startIdx + i], uploading: false, error: 'فشل الرفع' };
          return updated;
        });
      }
    }
  };

  const removeImage = (idx: number) => {
    setUploadedImages(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!user) return navigate('/login');
    setError('');
    const readyImages = uploadedImages.filter(img => img.url && !img.uploading);
    if (readyImages.length === 0) {
      setError('يرجى رفع صورة واحدة على الأقل');
      return;
    }
    if (uploadedImages.some(img => img.uploading)) {
      setError('يرجى الانتظار حتى تنتهي عملية رفع الصور');
      return;
    }
    setLoading(true);
    try {
      await api.addProperty({
        ...form,
        price: Number(form.price),
        area: Number(form.area),
        rooms: Number(form.rooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        floor: Number(form.floor) || 0,
        images: readyImages.map(img => img.url),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'خطأ في إضافة العقار');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4" dir="rtl">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">تم الإرسال بنجاح!</h2>
        <p className="text-gray-500 mb-6">سيتم مراجعة عقارك من قِبَل فريقنا وإضافته خلال 24 ساعة.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/properties')} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">تصفح العقارات</button>
          <button onClick={() => {
            setSuccess(false); setStep(1); setUploadedImages([]);
            setForm({ title: '', title_ar: '', description: '', description_ar: '', type: 'شقة', purpose: 'sale', price: '', area: '', rooms: '', bathrooms: '', floor: '', district: 'سيدي جابر', city: 'الإسكندرية', address: '' });
          }}
            className="flex-1 bg-[#005a7d] text-white py-2.5 rounded-xl text-sm font-bold"
          >إضافة عقار آخر</button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20" dir="rtl">
      <div className="bg-gradient-to-r from-[#005a7d] to-[#004a68] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white font-black text-3xl mb-2">أضف عقارك</motion.h1>
          <p className="text-[#bca056]">سيتم مراجعة إعلانك وإضافته بعد الموافقة</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          {[{ n: 1, l: 'المعلومات الأساسية', icon: <Building2 size={16} /> }, { n: 2, l: 'التفاصيل والسعر', icon: <DollarSign size={16} /> }, { n: 3, l: 'الصور والموقع', icon: <MapPin size={16} /> }].map((s) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${step === s.n ? 'bg-[#005a7d] text-white shadow-md' : step > s.n ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
                {s.icon}<span className="hidden sm:inline">{s.l}</span><span className="sm:hidden">{s.n}</span>
              </div>
              {s.n < 3 && <div className={`w-8 h-0.5 ${step > s.n ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
              <Info size={16} />{error}
            </div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <h2 className="text-xl font-black text-gray-900 mb-6">المعلومات الأساسية</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">اسم العقار (بالعربية)</label>
                <input value={form.title_ar} onChange={e => update('title_ar', e.target.value)} required placeholder="مثال: شقة فاخرة في سيدي جابر"
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">اسم العقار (بالإنجليزية)</label>
                <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Luxury apartment in Sidi Gaber"
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d] transition-all" dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">نوع العقار</label>
                  <select value={form.type} onChange={e => update('type', e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d]"
                  >
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الغرض</label>
                  <select value={form.purpose} onChange={e => update('purpose', e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d]"
                  >
                    <option value="sale">للبيع</option>
                    <option value="rent">للإيجار</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الوصف (بالعربية)</label>
                <textarea value={form.description_ar} onChange={e => update('description_ar', e.target.value)} rows={4} placeholder="وصف تفصيلي للعقار..."
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#005a7d] resize-none" />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <h2 className="text-xl font-black text-gray-900 mb-6">التفاصيل والسعر</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">السعر (جنيه)</label>
                  <input type="number" value={form.price} onChange={e => update('price', e.target.value)} required placeholder="0"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d]" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">المساحة (م²)</label>
                  <input type="number" value={form.area} onChange={e => update('area', e.target.value)} required placeholder="0"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d]" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">غرف النوم</label>
                  <input type="number" value={form.rooms} onChange={e => update('rooms', e.target.value)} placeholder="0"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d]" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الحمامات</label>
                  <input type="number" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} placeholder="0"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d]" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الطابق</label>
                  <input type="number" value={form.floor} onChange={e => update('floor', e.target.value)} placeholder="0"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d]" dir="ltr" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <h2 className="text-xl font-black text-gray-900 mb-6">الصور والموقع</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الحي/المنطقة</label>
                <select value={form.district} onChange={e => update('district', e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d]"
                >
                  {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">العنوان التفصيلي</label>
                <input value={form.address} onChange={e => update('address', e.target.value)} placeholder="رقم الشارع، اسم الشارع..."
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d]" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">صور العقار</label>
                <p className="text-xs text-gray-400 mb-3">ارفع حتى 5 صور من جهازك (JPG, PNG, WebP - بحد أقصى 10 ميجا للصورة)</p>

                {/* Upload area */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => handleFileSelect(e.target.files)}
                />

                {uploadedImages.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-[#005a7d] hover:bg-[#e6f2f5]/30 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 bg-[#e6f2f5] rounded-2xl flex items-center justify-center group-hover:bg-[#ccdfed] transition-all">
                      <Upload size={24} className="text-[#005a7d]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700">اضغط لرفع الصور</p>
                      <p className="text-xs text-gray-400 mt-1">أو اسحب الصور وأفلتها هنا</p>
                    </div>
                    <span className="text-xs text-[#005a7d] font-medium bg-[#e6f2f5] px-3 py-1 rounded-full">
                      {uploadedImages.length}/5 صور
                    </span>
                  </button>
                )}

                {/* Image previews */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border-2 border-gray-100 aspect-video bg-gray-50">
                        <img
                          src={img.preview}
                          alt={`صورة ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {img.uploading && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 size={24} className="text-white animate-spin" />
                          </div>
                        )}
                        {img.error && (
                          <div className="absolute inset-0 bg-red-500/70 flex flex-col items-center justify-center gap-1">
                            <p className="text-white text-xs font-medium">فشل الرفع</p>
                          </div>
                        )}
                        {!img.uploading && !img.error && (
                          <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle size={12} className="text-white" />
                          </div>
                        )}
                        {idx === 0 && !img.uploading && !img.error && (
                          <div className="absolute bottom-0 inset-x-0 bg-[#005a7d]/80 text-white text-xs text-center py-1 font-medium">
                            الصورة الرئيسية
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {uploadedImages.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-video border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#005a7d] hover:bg-[#e6f2f5]/30 transition-all"
                      >
                        <ImageIcon size={20} className="text-gray-300" />
                        <span className="text-xs text-gray-400">إضافة</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                السابق
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} disabled={step === 1 && !form.title_ar}
                className="flex-1 bg-gradient-to-r from-[#005a7d] to-[#007a9a] text-white py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-[#005a7d]/30 disabled:opacity-50 transition-all"
              >
                التالي
              </button>
            ) : (
              <motion.button onClick={handleSubmit} disabled={loading || !form.price || !form.area || uploadedImages.some(i => i.uploading)}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="flex-1 bg-gradient-to-r from-[#005a7d] to-[#007a9a] text-white py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-[#005a7d]/30 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الإرسال...
                  </span>
                ) : 'إرسال للمراجعة'}
              </motion.button>
            )}
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-2xl flex items-start gap-3">
          <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-blue-700 text-sm">سيتم مراجعة إعلانك من قِبَل فريق إسكنك خلال 24 ساعة. ستتلقى إشعاراً عند الموافقة على النشر.</p>
        </div>
      </div>
    </div>
  );
}
