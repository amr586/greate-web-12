import { Link } from 'react-router';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin, MessageCircle, Music } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#005a7d] text-white" dir="rtl">
      <div className="w-full overflow-hidden leading-none -mb-1">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full"><path d="M0 60V30C180 0 360 60 540 30C720 0 900 60 1080 30C1260 0 1380 40 1440 30V60H0Z" fill="#005a7d"/></svg>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="group-hover:scale-105 transition-transform flex-shrink-0 w-13 h-13 rounded-full overflow-hidden shadow-md">
                <img src="/logo_gs.png" alt="Great Society" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-white font-black text-lg">GREAT SOCIETY</div>
                <div className="text-white/80 text-xs font-medium">REALESTATE & CONSTRUCTION</div>
              </div>
            </Link>
            <p className="text-white/80 text-sm leading-relaxed">
              شركة Great Society للاستثمار العقاري - شركة مصرية متخصصة في تقديم خدمات عقارية شاملة في مجالات متعددة
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { color: 'bg-[#1877F2]', icon: <Facebook size={16} />, href: 'https://www.facebook.com/share/14XzeQWvGTz/' },
                { color: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743]', icon: <Instagram size={16} />, href: 'https://www.instagram.com/great.societyy?igsh=MWd2bnNyNGh1emdhag==' },
                { color: 'bg-[#0A66C2]', icon: <Linkedin size={16} />, href: 'https://www.linkedin.com/in/great-society-9bb6722bb/' },
                { color: 'bg-black', icon: <MessageCircle size={16} />, href: 'https://x.com/greatsociety6' },
                { color: 'bg-black', icon: <Music size={16} />, href: 'https://www.tiktok.com/@greatsociety3?lang=en-GB&is_from_webapp=1&sender_device=mobile&sender_web_id=7582984467246646796' },
              ].map((s, i) => (
                <motion.a key={i} whileHover={{ scale: 1.1, y: -2 }} href={s.href} target="_blank" rel="noopener noreferrer"
                  className={`w-9 h-9 ${s.color} rounded-lg flex items-center justify-center`}>{s.icon}</motion.a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'الرئيسية' },
                { to: '/properties', label: 'جميع العقارات' },
                { to: '/properties?purpose=sale', label: 'عقارات للبيع' },
                { to: '/properties?purpose=rent', label: 'عقارات للإيجار' },
                { to: '/sell', label: 'أضف عقارك' },
                { to: '/contact', label: 'تواصل معنا' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-1">
                    <span className="text-white text-xs">›</span>{l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">أنواع العقارات</h3>
            <ul className="space-y-2">
              {['شقة', 'فيلا', 'مكتب', 'شاليه', 'محل تجاري', 'أرض'].map(t => (
                <li key={t}>
                  <Link to={`/properties?type=${t}`} className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-1">
                    <span className="text-white text-xs">›</span>{t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">معلومات التواصل</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={14} className="text-white" />
                </div>
                <div>
                  <a href="https://www.google.com/maps/search/Villa+99+1st+District+90+street,+New+Cairo+1,+Cairo,+Egypt" target="_blank" rel="noopener noreferrer" className="hover:underline transition-colors">
                    <div className="text-white text-sm">Villa 99 1st District 90 street</div>
                    <div className="text-white/70 text-xs">New Cairo 1, Cairo, Egypt</div>
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-white" />
                </div>
                <a href="tel:+201100111618" className="text-white/80 hover:text-white transition-colors text-sm" dir="ltr">01100111618</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-white" />
                </div>
                <a href="mailto:greatsociety6@gmail.com" className="text-white/80 hover:text-white transition-colors text-sm break-all">greatsociety6@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/70 text-sm">© {new Date().getFullYear()} Great Society — جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-4">
            <a href="https://drive.google.com/file/d/1ZMjlODUmm0o7C6zf00iPyelXDH4gFTy0/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-xs">سياسة الخصوصية</a>
            <a href="https://drive.google.com/file/d/1sgHp8G35p6LDGmFQx_La2IZ54gjCTVyu/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-xs">الشروط والأحكام</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
