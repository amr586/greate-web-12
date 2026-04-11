import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Bed, Bath, Maximize, MapPin, Phone, MessageCircle, Heart,
  ArrowRight, Share2, Calendar, Building2, CheckCircle, Send,
  Star, CreditCard, ChevronRight, Loader2, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { FEATURED } from './Properties';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop';
const WHATSAPP_NUMBER = '201281378331';
const COMPANY_PHONE = '01100111618';

function normalizePhone(phone: string) {
  return String(phone || COMPANY_PHONE).replace(/[^\d]/g, '');
}

function formatDetailPrice(price: any) {
  if (typeof price === 'string' && Number.isNaN(Number(price))) return price;
  const numeric = Number(price);
  if (!numeric) return 'تواصل للسعر';
  return `${numeric.toLocaleString()} جنيه`;
}

function staticFeaturedProperty(id: string) {
  const item = FEATURED.find(p => p.id === id);
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    title_ar: item.title,
    description: item.desc,
    description_ar: item.desc,
    type: item.type,
    purpose: 'sale',
    price: item.price,
    district: item.district,
    rooms: item.rooms,
    bedrooms: item.rooms,
    images: [item.image],
    contact_phone: COMPANY_PHONE,
    down_payment: item.down,
    delivery_status: item.badge.includes('استلام') ? item.badge : undefined,
    is_featured: true,
    is_static_featured: true,
  };
}

function ChatBox({ propertyId, propertyTitle }: { propertyId: number; propertyTitle: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 8000);
    return () => clearInterval(interval);
  }, [propertyId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await api.getPropertyChatMessages(propertyId);
      setMessages(data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    try {
      const newMsg = await api.sendPropertyChatMessage(propertyId, msg.trim());
      setMessages(prev => [...prev, newMsg]);
      setMsg('');
      setSent(true);
    } catch {
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <MessageSquare size={18} className="text-[#7C3AED]" />
          استفسر عن هذا العقار
        </h3>
        <p className="text-gray-500 text-sm mb-3">سجّل الدخول لإرسال استفسارك مباشرة للإدارة</p>
        <Link to="/login" className="block w-full text-center bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-2.5 rounded-xl text-sm font-bold">
          تسجيل الدخول
        </Link>
        <div className="mt-3 text-center">
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=مرحباً، أريد الاستفسار عن عقار: ${propertyTitle}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            أو تواصل مباشرة عبر واتساب
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#9333EA] px-4 py-3 flex items-center gap-2">
        <MessageSquare size={16} className="text-white" />
        <span className="text-white font-bold text-sm">استفسر عن هذا العقار</span>
        <span className="text-purple-200 text-xs mr-auto">الرد خلال 24 ساعة</span>
      </div>

      <div className="h-48 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            {sent ? 'تم إرسال رسالتك. سيرد عليك الفريق قريباً.' : 'ابدأ المحادثة بإرسال استفسارك...'}
          </div>
        ) : (
          messages.map(m => {
            const isMe = m.sender_id === user.id;
            const isAdmin = m.is_admin;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                  isAdmin
                    ? 'bg-[#7C3AED] text-white'
                    : isMe
                    ? 'bg-[#005a7d] text-white'
                    : 'bg-white border border-gray-100 text-gray-800'
                }`}>
                  {isAdmin && !isMe && (
                    <div className="text-xs text-purple-200 mb-0.5 font-medium">{m.sender_name || 'الإدارة'}</div>
                  )}
                  <p>{m.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="اكتب استفسارك هنا..."
          className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#7C3AED] transition-all"
        />
        <button
          type="submit"
          disabled={sending || !msg.trim()}
          className="w-9 h-9 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </form>
    </div>
  );
}

export function PropertyDetailEnhanced() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const staticProperty = staticFeaturedProperty(id);
    if (staticProperty) {
      setProperty(staticProperty);
      setLoading(false);
      return;
    }
    api.getProperty(Number(id))
      .then(data => {
        setProperty(data);
        if (user) {
          api.getSaved().then((saved: any[]) => {
            setIsSaved(saved.some((s: any) => s.id === data.id));
          }).catch(() => {});
        }
      })
      .catch(() => navigate('/properties'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSave = async () => {
    if (!user) { navigate('/login'); return; }
    if (property.is_static_featured) return;
    try {
      if (isSaved) {
        await api.unsaveProperty(property.id);
        setIsSaved(false);
      } else {
        await api.saveProperty(property.id);
        setIsSaved(true);
      }
    } catch {}
  };

  const shareProperty = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-4 border-[#99c8db] border-t-[#005a7d] rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#F9F5FF] flex items-center justify-center pt-20" dir="rtl">
        <div className="text-center">
          <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">العقار غير موجود</h2>
          <Link to="/properties" className="text-[#7C3AED] text-sm">العودة للعقارات</Link>
        </div>
      </div>
    );
  }

  const images: string[] = [];
  if (property.images && Array.isArray(property.images)) {
    property.images.forEach((img: any) => {
      if (img?.url) images.push(img.url);
      else if (typeof img === 'string') images.push(img);
    });
  }
  if (images.length === 0) images.push(DEFAULT_IMAGE);

  const purposeLabel = property.purpose === 'sale' ? 'للبيع' : 'للإيجار';
  const purposeColor = property.purpose === 'sale' ? 'bg-[#7C3AED] text-white' : 'bg-[#005a7d] text-white';
  const contactPhone = property.contact_phone || COMPANY_PHONE;
  const whatsappPhone = normalizePhone(contactPhone).startsWith('20') ? normalizePhone(contactPhone) : `2${normalizePhone(contactPhone)}`;

  const features = [
    property.has_parking && 'مواقف سيارات',
    property.has_elevator && 'مصعد كهربائي',
    property.has_pool && 'حمام سباحة',
    property.has_garden && 'حديقة',
    property.is_furnished && 'مفروش',
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F9F5FF] pt-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#7C3AED] transition-colors">الرئيسية</Link>
          <ChevronRight size={14} />
          <Link to="/properties" className="hover:text-[#7C3AED] transition-colors">العقارات</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium line-clamp-1">{property.title_ar || property.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-purple-100">
              <div className="relative h-72 sm:h-96">
                <img
                  src={images[activeImage]}
                  alt={property.title_ar || property.title}
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                <div className="absolute top-4 right-4 flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${purposeColor}`}>{purposeLabel}</span>
                  {property.type && <span className="px-3 py-1 rounded-lg text-xs font-medium bg-white/90 text-[#7C3AED]">{property.type}</span>}
                  {property.is_featured && (
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-[#bca056] to-[#a68a47] text-white flex items-center gap-1">
                      <Star size={12} fill="currentColor" />مميز
                    </span>
                  )}
                </div>

                <div className="absolute top-4 left-4 flex gap-2">
                  <button onClick={toggleSave} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isSaved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:text-red-500'}`}>
                    <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={shareProperty} className="w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center text-gray-600 hover:text-[#7C3AED] transition-colors relative">
                    <Share2 size={16} />
                    {copied && <span className="absolute -bottom-7 right-0 text-xs bg-black/70 text-white px-2 py-0.5 rounded whitespace-nowrap">تم النسخ!</span>}
                  </button>
                </div>

                <div className="absolute bottom-4 right-4">
                  <span className="bg-white/95 text-[#7C3AED] font-black px-4 py-2 rounded-xl shadow text-lg">
                    {formatDetailPrice(property.price)}
                  </span>
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === i ? 'border-[#7C3AED]' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }} />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
              <h1 className="text-2xl font-black text-gray-900 mb-2">{property.title_ar || property.title}</h1>
              {property.district && (
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                  <MapPin size={14} className="text-[#7C3AED]" />
                  <span>{property.district}{property.address ? ` - ${property.address}` : ''}</span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {property.area && (
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <Maximize size={18} className="text-[#7C3AED] mx-auto mb-1" />
                    <div className="font-bold text-gray-900 text-sm">{Number(property.area)} م²</div>
                    <div className="text-gray-500 text-xs">المساحة</div>
                  </div>
                )}
                {(property.bedrooms || property.rooms) > 0 && (
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <Bed size={18} className="text-[#7C3AED] mx-auto mb-1" />
                    <div className="font-bold text-gray-900 text-sm">{property.bedrooms || property.rooms} غرف</div>
                    <div className="text-gray-500 text-xs">غرف النوم</div>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <Bath size={18} className="text-[#7C3AED] mx-auto mb-1" />
                    <div className="font-bold text-gray-900 text-sm">{property.bathrooms} حمام</div>
                    <div className="text-gray-500 text-xs">الحمامات</div>
                  </div>
                )}
                {property.floor && (
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <Building2 size={18} className="text-[#7C3AED] mx-auto mb-1" />
                    <div className="font-bold text-gray-900 text-sm">الطابق {property.floor}</div>
                    <div className="text-gray-500 text-xs">الموقع</div>
                  </div>
                )}
                {property.down_payment && (
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <CreditCard size={18} className="text-[#bca056] mx-auto mb-1" />
                    <div className="font-bold text-gray-900 text-sm">{property.down_payment}</div>
                    <div className="text-gray-500 text-xs">المقدم</div>
                  </div>
                )}
                {property.delivery_status && (
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <CheckCircle size={18} className="text-green-600 mx-auto mb-1" />
                    <div className="font-bold text-gray-900 text-sm">{property.delivery_status}</div>
                    <div className="text-gray-500 text-xs">التسليم</div>
                  </div>
                )}
              </div>

              {(property.description || property.description_ar) && (
                <>
                  <h3 className="font-bold text-gray-900 mb-2">عن هذا العقار</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{property.description_ar || property.description}</p>
                </>
              )}

              {property.created_at && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar size={12} />
                  <span>أُضيف في {new Date(property.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
              )}
            </motion.div>

            {features.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
                <h3 className="font-bold text-gray-900 mb-4">المميزات والخدمات</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-[#7C3AED] flex-shrink-0" />
                      <span className="text-gray-600 text-xs">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-[#005a7d] to-[#004a68] rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 size={24} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm">GREAT SOCIETY</div>
                  <div className="text-white/70 text-xs">وكيل العقار</div>
                </div>
              </div>
              <div className="space-y-2">
                {contactPhone && (
                  <a href={`tel:${contactPhone}`}
                    className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 hover:bg-white/30 transition-colors"
                  >
                    <Phone size={15} />
                    <span className="text-sm" dir="ltr">{contactPhone}</span>
                  </a>
                )}
                <a href={`https://wa.me/${whatsappPhone}?text=مرحباً، أريد الاستفسار عن: ${property.title_ar || property.title}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500/80 hover:bg-green-500 rounded-lg px-3 py-2 transition-colors"
                >
                  <MessageCircle size={15} />
                  <span className="text-sm">تواصل عبر واتساب</span>
                </a>
              </div>
            </motion.div>

            {property.purpose === 'sale' && !property.is_static_featured && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
                <Link to={`/payment/${property.id}`}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-3 rounded-2xl text-sm font-bold shadow-lg w-full hover:opacity-90 transition-all"
                >
                  <CreditCard size={16} />
                  طلب الشراء / الدفع
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            )}

            {!property.is_static_featured && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <ChatBox propertyId={property.id} propertyTitle={property.title_ar || property.title} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailEnhanced;
