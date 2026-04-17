import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Heart, Building2, MapPin, Loader2, Trash2 } from 'lucide-react';
import { api } from '../lib/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop';
const COMPANY_PHONE = '01100111618';

function formatPrice(price: number) {
  if (!price) return 'تواصل للسعر';
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)} مليون ج`;
  if (price >= 1000) return `${(price / 1000).toFixed(0)} ألف ج`;
  return `${price.toLocaleString()} ج`;
}

export function SavedProperties() {
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    try {
      const data = await api.getSaved();
      setSavedProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('[Saved] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (propertyId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.unsaveProperty(propertyId);
      setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (err) {
      console.log('[Unsave] Error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F5FF] pt-20" dir="rtl">
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#4C1D95] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-1">
              <Heart size={20} className="text-purple-300" />
              <p className="text-purple-300 text-sm">المحفوظات</p>
            </div>
            <h1 className="text-white text-3xl font-black">العقارات المحفوظة</h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#7C3AED]" />
          </div>
        ) : savedProperties.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Heart size={32} className="text-[#7C3AED]" />
            </div>
            <h2 className="text-xl font-bold text-[#0A0A0A] mb-2">لا توجد عقارات محفوظة</h2>
            <p className="text-gray-500 text-sm mb-5">احفظ العقارات التي تعجبك للرجوع إليها لاحقاً</p>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white px-8 py-3 rounded-xl font-bold"
            >
              <Building2 size={16} />
              تصفح العقارات
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">
              <span className="font-bold text-[#0A0A0A]">{savedProperties.length}</span> عقار محفوظ
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map((p, i) => {
                const title = p.title_ar || p.title || 'عقار';
                const image = p.primary_image || (Array.isArray(p.images) && p.images[0]?.url) || DEFAULT_IMAGE;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                  >
                    <Link to={`/properties/${p.id}`} className="block">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <button
                          onClick={(e) => handleUnsave(p.id, e)}
                          className="absolute top-3 left-3 w-8 h-8 bg-white/90 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1">
                          <MapPin size={11} className="text-[#005a7d]" />
                          <span className="text-xs font-semibold text-gray-700">{p.district || 'موقع العقار'}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">{title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-[#005a7d] font-black">{formatPrice(p.price)}</span>
                          <a
                            href={`tel:${p.contact_phone || COMPANY_PHONE}`}
                            onClick={e => e.stopPropagation()}
                            className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-medium"
                          >
                            اتصل الآن
                          </a>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SavedProperties;