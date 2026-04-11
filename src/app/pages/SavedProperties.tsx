import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Heart, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';

export function SavedProperties() {
  const { savedProperties, properties } = useApp();
  const saved = properties.filter(p => savedProperties.includes(p.id));

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
        {saved.length === 0 ? (
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
              <span className="font-bold text-[#0A0A0A]">{saved.length}</span> عقار محفوظ
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {saved.map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SavedProperties;
