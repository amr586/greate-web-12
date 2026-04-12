import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Bed, Bath, Maximize, MapPin, Heart, Eye, Tag } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface Property {
  id: number;
  title: string;
  title_ar?: string;
  type: string;
  purpose: string;
  price: number;
  area: number;
  rooms?: number;
  bathrooms?: number;
  district: string;
  city?: string;
  status: string;
  primary_image?: string;
  is_featured?: boolean;
  down_payment?: string;
  delivery_status?: string;
}

interface Props {
  property: Property;
  index?: number;
  onSaved?: () => void;
}

const purposeLabel = (p: string) => p === 'sale' ? 'للبيع' : 'للإيجار';
const purposeColor = (p: string) => p === 'sale' ? 'bg-[#005a7d] text-white' : 'bg-[#bca056] text-white';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop';

export default function PropertyCard({ property, index = 0, onSaved }: Props) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (saved) { await api.unsaveProperty(property.id); setSaved(false); }
      else { await api.saveProperty(property.id); setSaved(true); }
      onSaved?.();
    } catch {}
  };

  const image = property.primary_image || DEFAULT_IMAGE;
  const price = property.purpose === 'rent'
    ? `${property.price.toLocaleString()} ج/شهر`
    : `${property.price.toLocaleString()} جنيه`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-[#005a7d]/10 transition-all duration-300 group border border-gray-100"
      dir="rtl"
    >
      {property.is_featured && (
        <div className="bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900 text-xs font-black px-3 py-1.5 flex items-center justify-center gap-1.5 tracking-wide">
          ⭐ عقار مميز
        </div>
      )}
      {!property.is_featured && property.down_payment && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 flex items-center justify-center gap-1.5">
          💰 {property.down_payment}
        </div>
      )}

      <Link to={`/properties/${property.id}`}>
        <div className="relative overflow-hidden h-52">
          <img
            src={image}
            alt={property.title_ar || property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-bold ${purposeColor(property.purpose)}`}>
            {purposeLabel(property.purpose)}
          </div>

          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 text-[#005a7d]">
            {property.type}
          </div>

          {user && (
            <button onClick={handleSave}
              className={`absolute bottom-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${saved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:text-red-500'}`}
            >
              <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
            </button>
          )}

          <div className="absolute bottom-3 right-3">
            <span className="bg-white/95 text-[#005a7d] text-sm font-black px-3 py-1 rounded-lg shadow">
              {price}
            </span>
          </div>

        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#005a7d] transition-colors">
            {property.title_ar || property.title}
          </h3>
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
            <MapPin size={12} className="text-[#bca056]" />
            <span>{property.district}، {property.city || 'الإسكندرية'}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500 text-xs border-t border-gray-100 pt-3">
            {(property.rooms || 0) > 0 && (
              <div className="flex items-center gap-1">
                <Bed size={13} className="text-[#005a7d]" />
                <span>{property.rooms} غرف</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath size={13} className="text-[#005a7d]" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Maximize size={13} className="text-[#005a7d]" />
              <span>{property.area}م²</span>
            </div>
            <div className="flex-1 flex justify-end">
              <span className="flex items-center gap-1 text-[#005a7d] font-medium">
                <Eye size={13} />عرض
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
