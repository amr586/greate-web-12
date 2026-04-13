import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, MapPin, BedDouble, Bath, Maximize2, Layers, Building2, Home, Mail, Phone, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../lib/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=120&fit=crop';

interface Props {
  propertyId: number;
  onClose: () => void;
  onApprove?: (data?: any) => void;
  onReject?: () => void;
}

const typeLabel: Record<string, string> = { apartment: 'شقة', villa: 'فيلا', office: 'مكتب', shop: 'محل', land: 'أرض', chalet: 'شاليه' };
const purposeLabel: Record<string, string> = { sale: 'للبيع', rent: 'للإيجار' };

export default function PropertyDetailModal({ propertyId, onClose, onApprove, onReject }: Props) {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState<any>({
    contact_phone: '',
    is_featured: false,
    down_payment: '',
    delivery_status: '',
  });

  useEffect(() => {
    api.getAdminProperty(propertyId).then(data => {
      setProperty(data);
      setReviewForm({
        contact_phone: data.contact_phone || data.owner_phone || '',
        is_featured: Boolean(data.is_featured),
        down_payment: data.down_payment || '',
        delivery_status: data.delivery_status || '',
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, [propertyId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="font-black text-gray-900 text-lg">تفاصيل العقار</h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-[#7C3AED] rounded-full animate-spin" />
          </div>
        ) : !property ? (
          <div className="p-8 text-center text-gray-400">لم يتم العثور على العقار</div>
        ) : (
          <div className="p-6 space-y-6">
            {property.images && property.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(property.images as string[]).slice(0, 4).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-40 h-28 rounded-xl object-cover flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }} />
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                property.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                property.status === 'approved' ? 'bg-green-100 text-green-700' :
                property.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {({ pending: 'قيد المراجعة', approved: 'موافق عليه', rejected: 'مرفوض', sold: 'مباع' } as Record<string, string>)[property.status] || property.status}
              </span>
              <span className="text-gray-400 text-sm">#{property.id}</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-gray-900 mb-1">{property.title_ar || property.title}</h3>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin size={14} />
                <span>{property.district}{property.address ? ` - ${property.address}` : ''}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Home size={16} />, label: 'النوع', value: typeLabel[property.type] || property.type },
                { icon: <Building2 size={16} />, label: 'الغرض', value: purposeLabel[property.purpose] || property.purpose },
                { icon: <BedDouble size={16} />, label: 'غرف النوم', value: `${property.bedrooms || 0} غرف` },
                { icon: <Bath size={16} />, label: 'الحمامات', value: `${property.bathrooms || 0} حمامات` },
                { icon: <Maximize2 size={16} />, label: 'المساحة', value: `${property.area} م²` },
                { icon: <Layers size={16} />, label: 'الطابق', value: property.floor !== null ? `طابق ${property.floor}` : 'أرضي' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                  <div className="text-[#7C3AED]">{item.icon}</div>
                  <div>
                    <p className="text-gray-400 text-xs">{item.label}</p>
                    <p className="font-bold text-gray-900 text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-[#7C3AED]/10 to-[#9333EA]/10 rounded-xl p-4">
              <p className="text-gray-500 text-xs mb-1">السعر</p>
              <p className="text-2xl font-black text-[#7C3AED]">{Number(property.price).toLocaleString('ar-EG')} جنيه</p>
              {property.purpose === 'rent' && <p className="text-gray-400 text-xs">شهرياً</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm">
                {property.down_payment && (
                  <div className="bg-white/70 rounded-lg px-3 py-2">
                    <span className="text-gray-400 text-xs block">المقدم</span>
                    <span className="font-bold text-gray-800">{property.down_payment}</span>
                  </div>
                )}
                {property.delivery_status && (
                  <div className="bg-white/70 rounded-lg px-3 py-2">
                    <span className="text-gray-400 text-xs block">التسليم</span>
                    <span className="font-bold text-gray-800">{property.delivery_status}</span>
                  </div>
                )}
                {(property.contact_phone || property.owner_phone) && (
                  <div className="bg-white/70 rounded-lg px-3 py-2">
                    <span className="text-gray-400 text-xs block">رقم الإعلان</span>
                    <span className="font-bold text-gray-800" dir="ltr">{property.contact_phone || property.owner_phone}</span>
                  </div>
                )}
                <div className="bg-white/70 rounded-lg px-3 py-2">
                  <span className="text-gray-400 text-xs block">نوع العرض</span>
                  <span className="font-bold text-gray-800">{property.is_featured ? 'مميز' : 'عادي'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {property.has_parking && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium">🚗 موقف سيارات</span>}
              {property.has_elevator && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium">🛗 مصعد</span>}
              {property.has_garden && <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-medium">🌿 حديقة</span>}
              {property.has_pool && <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-lg text-xs font-medium">🏊 حمام سباحة</span>}
              {property.is_furnished && <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-xs font-medium">🛋️ مفروش</span>}
            </div>

            {property.description && (
              <div>
                <p className="text-xs text-gray-400 mb-1">الوصف</p>
                <p className="text-gray-700 text-sm leading-relaxed">{property.description}</p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-5">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Users size={16} className="text-[#7C3AED]" />
                معلومات صاحب العقار
              </h4>
              <div className="bg-purple-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-xl flex items-center justify-center text-white font-black text-lg">
                    {property.owner_name?.charAt(0) || '؟'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{property.owner_name || 'غير معروف'}</p>
                    <p className="text-gray-400 text-xs">صاحب العقار</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-3">
                  {property.owner_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail size={14} className="text-[#7C3AED] flex-shrink-0" />
                      <span dir="ltr">{property.owner_email}</span>
                    </div>
                  )}
                  {property.owner_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone size={14} className="text-[#7C3AED] flex-shrink-0" />
                      <span dir="ltr">{property.owner_phone}</span>
                    </div>
                  )}
                  {property.owner_joined && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} className="text-[#7C3AED] flex-shrink-0" />
                      <span>انضم في {new Date(property.owner_joined).toLocaleDateString('ar-EG')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Calendar size={12} />
              <span>تاريخ الإضافة: {new Date(property.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {property.status === 'pending' && onApprove && onReject && (
              <div className="border-t border-gray-100 pt-5 space-y-4">
                <h4 className="font-bold text-gray-900">إعدادات النشر قبل الموافقة</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">رقم الإعلان</label>
                    <input value={reviewForm.contact_phone} onChange={e => setReviewForm((p: any) => ({ ...p, contact_phone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#7C3AED]" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">نوع العقار</label>
                    <select value={reviewForm.is_featured ? 'featured' : 'normal'} onChange={e => setReviewForm((p: any) => ({ ...p, is_featured: e.target.value === 'featured' }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#7C3AED]">
                      <option value="normal">عادي</option>
                      <option value="featured">مميز</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">المقدم</label>
                    <input value={reviewForm.down_payment} onChange={e => setReviewForm((p: any) => ({ ...p, down_payment: e.target.value }))}
                      placeholder="مثال: مقدم 750,000 جنيه"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#7C3AED]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">حالة التسليم</label>
                    <input value={reviewForm.delivery_status} onChange={e => setReviewForm((p: any) => ({ ...p, delivery_status: e.target.value }))}
                      placeholder="مثال: استلام فوري"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#7C3AED]" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { onApprove(reviewForm); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-colors"
                  >
                    <CheckCircle size={16} />قبول العقار
                  </button>
                  <button onClick={() => { onReject(); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors"
                  >
                    <XCircle size={16} />رفض العقار
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
