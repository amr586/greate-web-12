import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { Search, Building2, TrendingUp, Users, Star, MapPin, CheckCircle, Phone, Shield, Award, Clock, ChevronRight, ChevronLeft, Bed, Bath, Maximize2, LayoutGrid, PhoneCall } from 'lucide-react';
import { api } from '../lib/api';

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const step = end / (duration * 60);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{count.toLocaleString('ar-EG')}</span>;
}

const SLIDES = [
  { bg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&h=800&fit=crop', title: 'ابحث عن منزل أحلامك', sub: 'في قلب القاهرة' },
  { bg: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&h=800&fit=crop', title: 'فيلات وشقق فاخرة', sub: 'بأفضل المواقع والأسعار' },
  { bg: 'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=1400&h=800&fit=crop', title: 'الاستثمار العقاري الذكي', sub: 'مع Great Society' },
];

export default function Home() {
  const [heroSlide, setHeroSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [featuredProps, setFeaturedProps] = useState<any[]>([]);
  const [propSlide, setPropSlide] = useState<Record<number, number>>({});
  const [showFloor, setShowFloor] = useState<Record<number, boolean>>({});
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  useEffect(() => {
    const t = setInterval(() => setHeroSlide(p => (p + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Promise.all([api.getProperty(1), api.getProperty(2)])
      .then(([p1, p2]) => {
        const results = [p1, p2].filter(Boolean);
        setFeaturedProps(results);
      })
      .catch(() => {});
  }, []);

  const slideImg = (propId: number, dir: number, total: number) => {
    setPropSlide(prev => ({ ...prev, [propId]: ((prev[propId] ?? 0) + dir + total) % total }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (searchQuery) p.set('search', searchQuery);
    if (searchType !== 'all') p.set('purpose', searchType);
    navigate('/properties?' + p.toString());
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* HERO */}
      <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={heroSlide} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0">
            <img src={SLIDES[heroSlide].bg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#005a7d]/90 via-[#005a7d]/70 to-[#005a7d]/40" />
          </motion.div>
        </AnimatePresence>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full"
              style={{ left: `${10 + i * 12}%`, top: `${15 + (i % 3) * 25}%`, width: i % 2 === 0 ? 6 : 4, height: i % 2 === 0 ? 6 : 4, background: `rgba(255,255,255,${0.2 + i * 0.04})` }}
              animate={{ y: [-20, 20, -20], opacity: [0.3, 0.9, 0.3], scale: [1, 1.3, 1] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-0.5 bg-[#bca056]" />
              <span className="text-[#bca056] text-sm font-medium">القاهرة، مصر</span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div key={heroSlide} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}>
                <h1 className="text-white mb-2 font-black leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                  {SLIDES[heroSlide].title}
                </h1>
                <p className="text-[#bca056] mb-6 font-bold" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}>
                  {SLIDES[heroSlide].sub}
                </p>
              </motion.div>
            </AnimatePresence>

            
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-gray-200 mb-8 text-base leading-relaxed">
              أكثر من 100 عقار في مختلف الأماكن · ابحث، قارن وتواصل معنا.
            </motion.p>

            <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              onSubmit={handleSearch}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl flex flex-col sm:flex-row gap-2"
            >
              <select value={searchType} onChange={e => setSearchType(e.target.value)}
                className="border-0 outline-none bg-[#e6f2f5] rounded-xl px-3 py-2.5 text-sm text-gray-800 min-w-[110px]"
              >
                <option value="all">الكل</option>
                <option value="sale">للبيع</option>
                <option value="rent">للإيجار</option>
              </select>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث بالموقع أو نوع العقار..."
                className="flex-1 border-0 outline-none text-sm px-3 py-2.5 text-gray-800 bg-transparent placeholder:text-gray-400"
              />
              <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-[#005a7d] to-[#007a9a] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-[#005a7d]/30 transition-shadow">
                <Search size={16} />بحث
              </button>
            </motion.form>

            <div className="flex flex-wrap gap-2 mt-4">
              {['التجمع الخامس', 'جولدن سكوير', 'العاصمة الإدارية', 'التجمع السادس', 'مصر الجديدة', 'الشيخ زايد'].map(area => (
                <button key={area} onClick={() => navigate(`/properties?search=${area}`)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg backdrop-blur-sm border border-white/20 transition-all"
                >{area}</button>
              ))}
              <button onClick={() => navigate('/properties')}
                className="px-3 py-1 bg-[#bca056]/80 hover:bg-[#bca056] text-white text-xs rounded-lg backdrop-blur-sm border border-[#bca056]/50 transition-all font-medium"
              >مناطق أخرى ›</button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setHeroSlide(i)}
              className={`transition-all duration-300 rounded-full ${i === heroSlide ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="py-16 bg-gradient-to-br from-[#005a7d] to-[#003d5a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 127, label: 'عقار متاح', icon: <Building2 size={24} /> },
              { value: 43, label: 'عملية بيع ناجحة', icon: <TrendingUp size={24} /> },
              { value: 289, label: 'عميل راضٍ', icon: <Users size={24} /> },
              { value: 12, label: 'سنوات خبرة', icon: <Star size={24} /> },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={statsInView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-12 h-12 bg-white/25 border border-white/40 rounded-xl flex items-center justify-center mx-auto mb-3 text-white">{stat.icon}</div>
                <div className="text-white mb-1 text-4xl font-black">{statsInView ? <CountUp end={stat.value} /> : 0}+</div>
                <div className="text-white/80 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      {featuredProps.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-white to-[#f0f8fb]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-[#bca056] text-sm font-medium mb-1">عروض حصرية</motion.p>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-gray-900 text-3xl font-black">عقارات مميزة</motion.h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredProps.map((prop, idx) => {
                const imgs: string[] = prop.images?.length ? prop.images.map((i: any) => i.url) : ['/placeholder-property.jpg'];
                const curImg = propSlide[prop.id] ?? 0;
                const floorPlan = prop.floor_plan_image;
                const isShowingFloor = showFloor[prop.id] ?? false;
                const toggleFloor = () => setShowFloor(prev => ({ ...prev, [prop.id]: !prev[prop.id] }));
                return (
                  <motion.div key={prop.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.15 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#e6f2f5] hover:shadow-2xl transition-shadow group"
                  >
                    {/* Image Carousel */}
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      <AnimatePresence mode="wait">
                        <motion.img key={isShowingFloor ? 'floor' : curImg}
                          src={isShowingFloor && floorPlan ? floorPlan : imgs[curImg]}
                          alt={prop.title_ar}
                          initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
                        />
                      </AnimatePresence>
                      {/* Nav arrows */}
                      {!isShowingFloor && imgs.length > 1 && (
                        <>
                          <button onClick={() => slideImg(prop.id, -1, imgs.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-all"><ChevronRight size={16} /></button>
                          <button onClick={() => slideImg(prop.id, 1, imgs.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-all"><ChevronLeft size={16} /></button>
                        </>
                      )}
                      {/* Image dots */}
                      {!isShowingFloor && imgs.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {imgs.map((_: string, i: number) => (
                            <button key={i} onClick={() => setPropSlide(p => ({ ...p, [prop.id]: i }))}
                              className={`rounded-full transition-all ${i === curImg ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
                            />
                          ))}
                        </div>
                      )}
                      {/* Featured badge */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <span className="bg-[#bca056] text-[#005a7d] text-xs font-bold px-3 py-1 rounded-full shadow">⭐ مميز</span>
                      </div>
                      {/* Floor plan toggle */}
                      {floorPlan && (
                        <button onClick={toggleFloor}
                          className={`absolute top-3 left-3 flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full shadow transition-all ${isShowingFloor ? 'bg-[#005a7d] text-white' : 'bg-white/90 text-[#005a7d] hover:bg-white'}`}
                        ><LayoutGrid size={12} />{isShowingFloor ? 'الصور' : 'مسقط 2D'}</button>
                      )}
                    </div>
                    {/* Details */}
                    <div className="p-5">
                      <Link to={`/properties/${prop.id}`} className="block">
                      <h3 className="font-black text-gray-900 text-lg mb-1 line-clamp-2 hover:text-[#005a7d] transition-colors cursor-pointer">{prop.title_ar}</h3>
                      </Link>
                      <div className="flex items-center gap-1 text-[#005a7d] text-sm mb-3">
                        <MapPin size={13} className="text-[#bca056]" />
                        <span>{prop.district}{prop.city ? '، ' + prop.city : ''}</span>
                      </div>
                      {prop.description_ar && (
                        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{prop.description_ar}</p>
                      )}
                      {/* Specs row */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 flex-wrap">
                        {prop.bedrooms > 0 && <span className="flex items-center gap-1"><Bed size={14} className="text-[#005a7d]" />{prop.bedrooms} غرف</span>}
                        {prop.bathrooms > 0 && <span className="flex items-center gap-1"><Bath size={14} className="text-[#005a7d]" />{prop.bathrooms} حمام</span>}
                        {prop.area > 0 && <span className="flex items-center gap-1"><Maximize2 size={14} className="text-[#005a7d]" />{prop.area} م²</span>}
                        {prop.finishing_type && <span className="bg-[#e6f2f5] text-[#005a7d] px-2 py-0.5 rounded-lg text-xs font-medium">{prop.finishing_type}</span>}
                      </div>
                      {/* Price */}
                      <div className="flex items-end justify-between flex-wrap gap-3">
                        <div>
                          <div className="text-[#005a7d] font-black text-2xl">{Number(prop.price).toLocaleString('ar-EG')} ج</div>
                          {prop.down_payment && <div className="text-[#bca056] text-sm font-bold mt-0.5">مقدم {Number(prop.down_payment).toLocaleString('ar-EG')} ج</div>}
                          {prop.delivery_status && <div className="text-gray-400 text-xs mt-0.5">{prop.delivery_status}</div>}
                        </div>
                        <div className="flex gap-2">
                          {prop.contact_phone && (
                            <a href={`tel:${prop.contact_phone}`}
                              className="flex items-center gap-1.5 bg-[#005a7d] hover:bg-[#004a68] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow"
                            ><PhoneCall size={14} />اتصل</a>
                          )}
                          <Link to={`/properties/${prop.id}`}
                            className="flex items-center gap-1.5 bg-[#bca056] hover:bg-[#d7b777] text-[#005a7d] px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow"
                          >التفاصيل <ChevronLeft size={14} /></Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SERVICES */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-[#bca056] text-sm font-medium mb-1">خدماتنا</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-gray-900 text-3xl font-black">ماذا نقدم لك؟</motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Building2 size={28} />, title: 'بيع العقارات', desc: 'نساعدك في بيع عقارك بأفضل سعر وفي أقصر وقت ممكن.', grad: 'from-[#005a7d] to-[#007a9a]', link: '/sell' },
              { icon: <Search size={28} />, title: 'شراء العقارات', desc: 'نوفر لك أكبر قاعدة بيانات عقارية في الإسكندرية.', grad: 'from-[#bca056] to-[#d7b777]', link: '/properties?purpose=sale' },
              { icon: <Phone size={28} />, title: 'الاستشارة المجانية', desc: 'فريقنا المتخصص جاهز للإجابة على جميع استفساراتك.', grad: 'from-[#005a7d] to-[#004a68]', link: '/contact' },
              { icon: <Shield size={28} />, title: 'الحماية القانونية', desc: 'نضمن سلامة جميع المعاملات وتوثيق العقود قانونياً.', grad: 'from-[#bca056] to-[#d7b777]', link: '/contact' },
              { icon: <Award size={28} />, title: 'تقييم العقارات', desc: 'نقدم تقييماً دقيقاً وموضوعياً لقيمة عقارك.', grad: 'from-[#005a7d] to-[#007a9a]', link: '/contact' },
              { icon: <Clock size={28} />, title: 'متابعة الطلبات', desc: 'تابع حالة طلبك في أي وقت من لوحة التحكم.', grad: 'from-[#bca056] to-[#d7b777]', link: '/dashboard' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}
                className="bg-white border border-[#e6f2f5] rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-[#005a7d]/10 transition-all group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${s.grad} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>{s.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#005a7d] transition-colors">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{s.desc}</p>
                <Link to={s.link} className="flex items-center gap-1 text-[#005a7d] text-sm font-medium hover:gap-2 transition-all">اعرف أكثر<ChevronRight size={14} /></Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-16 bg-[#005a7d] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#bca056] rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#007a9a] rounded-full filter blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-[#bca056] text-sm font-medium mb-2">لماذا تختارنا؟</p>
              <h2 className="text-white text-3xl font-black mb-4">شريكك الموثوق<br />في عالم العقارات</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">منذ عام ٢٠١٢، ونحن نخدم عملاءنا في القاهرة والعاصمة الإدارية بمهنية واحترافية عالية.</p>
              {['أكثر من ١٢ سنة من الخبرة', 'تغطية شاملة لجميع أحياء القاهرة والعاصمة الإدارية', 'خدمة عملاء على مدار الساعة', 'ضمان الشفافية في جميع المعاملات'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 mb-2">
                  <CheckCircle size={16} className="text-[#bca056] flex-shrink-0" />
                  <span className="text-gray-200 text-sm">{item}</span>
                </div>
              ))}
              <div className="flex gap-3 mt-6">
                <Link to="/properties" className="flex items-center gap-2 bg-[#bca056] hover:bg-[#d7b777] text-[#005a7d] px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-colors">
                  <Building2 size={16} />تصفح العقارات
                </Link>
                <Link to="/contact" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl text-sm border border-white/20 transition-all">
                  <Phone size={16} />تواصل معنا
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="relative rounded-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop" alt="" className="w-full h-80 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#005a7d]/60 to-transparent" />
              </div>
              <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#bca056] to-[#d7b777] rounded-lg flex items-center justify-center">
                    <Star size={14} className="text-white fill-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-gray-900">تقييم ممتاز</div>
                    <div className="text-xs text-gray-500">٤.٩/٥ نجوم</div>
                  </div>
                </div>
              </motion.div>
              <motion.div animate={{ y: [8, -8, 8] }} transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#005a7d] rounded-lg flex items-center justify-center">
                    <MapPin size={14} className="text-[#bca056]" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-gray-900">القاهرة</div>
                    <div className="text-xs text-gray-500">Cairo, EG</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#e6f2f5] to-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-r from-[#005a7d] to-[#007a9a] rounded-3xl p-10 text-white"
          >
            <h3 className="text-3xl font-black mb-3">جاهز للبدء؟</h3>
            <p className="text-[#bca056] mb-6 text-lg">سجّل الآن وابدأ رحلتك العقارية مع Great Society</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="bg-[#bca056] text-[#005a7d] px-8 py-3 rounded-xl font-bold hover:bg-[#d7b777] hover:shadow-lg transition-all text-sm">إنشاء حساب مجاني</Link>
              <Link to="/properties" className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-xl font-bold border border-white/30 transition-all text-sm">تصفح العقارات</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
