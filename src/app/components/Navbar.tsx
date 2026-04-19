import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, Building2, Phone, LogIn, User, LayoutDashboard, LogOut, Heart, PlusCircle, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, isAdmin, isSuperAdmin, subRole } = useAuth();
  const { settings } = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); setDropdownOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/', label: 'الرئيسية', icon: <Home size={16} /> },
    { to: '/properties', label: 'العقارات', icon: <Building2 size={16} /> },
    { to: '/sell', label: 'أضف عقارك', icon: <PlusCircle size={16} /> },
    { to: '/contact', label: 'تواصل معنا', icon: <Phone size={16} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg shadow-[#bca056]/10' : 'bg-white/95 backdrop-blur-md'
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="group-hover:scale-105 transition-transform flex-shrink-0">
              <img src={settings.logo_url || '/logo_gs.png'} alt={settings.company_name} className="w-11 h-11 object-contain" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[#bca056] font-black text-sm tracking-tight">{settings.company_name}</span>
              <span className="text-gray-500 text-[8px] font-medium">{settings.company_tagline}</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.to) ? 'bg-[#bca056] text-white shadow-md shadow-[#bca056]/20' : 'text-gray-700 hover:bg-[#f5f1e8] hover:text-[#bca056]'
                }`}
              >
                {link.icon}{link.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {user && <NotificationBell />}
            {user ? (
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-[#e6f2f5] hover:bg-[#ccdfed] rounded-xl px-3 py-2 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#005a7d] to-[#004a68] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0) || '؟'}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{user.name?.split(' ')[0] || 'مستخدم'}</span>
                  {isAdmin && <span className="text-[10px] bg-[#005a7d] text-white px-1.5 py-0.5 rounded-md">{isSuperAdmin ? 'سوبر أدمن' : 'أدمن'}</span>}
                  <ChevronDown size={14} className={`text-[#005a7d] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl shadow-[#005a7d]/10 border border-[#e6f2f5] overflow-hidden z-50"
                    >
                      {isSuperAdmin && (
                        <Link to="/crm" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-[#e6f2f5] text-[#005a7d] font-semibold transition-colors">
                          <ShieldCheck size={16} />لوحة تحكم الموقع
                        </Link>
                      )}
                      {isAdmin && (
                        <Link to={subRole ? '/sub-admin' : '/admin'} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-[#e6f2f5] text-gray-800 transition-colors">
                          <LayoutDashboard size={16} className="text-[#005a7d]" />لوحة الإدارة
                        </Link>
                      )}
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-[#e6f2f5] text-gray-800 transition-colors border-t border-[#e6f2f5]">
                        <User size={16} className="text-[#005a7d]" />حسابي
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-red-50 text-red-500 transition-colors border-t border-[#e6f2f5]">
                        <LogOut size={16} />تسجيل الخروج
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 text-sm text-[#005a7d] hover:bg-[#e6f2f5] rounded-xl transition-all font-medium">
                  <LogIn size={16} />تسجيل الدخول
                </Link>
                <Link to="/register" className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#005a7d] to-[#007a9a] text-white text-sm rounded-xl shadow-md shadow-[#005a7d]/20 hover:shadow-[#005a7d]/30 transition-all font-medium">
                  <User size={16} />إنشاء حساب
                </Link>
              </>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-2">
            {user && <NotificationBell />}
            <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#e6f2f5] text-[#005a7d]">
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-white border-t border-[#e6f2f5]"
          >
            <div className="px-4 py-4 space-y-1" dir="rtl">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(link.to) ? 'bg-[#005a7d] text-white' : 'text-gray-700 hover:bg-[#e6f2f5]'}`}
                >
                  {link.icon}{link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-[#e6f2f5] space-y-1">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#005a7d] to-[#004a68] rounded-lg flex items-center justify-center text-white text-xs font-bold">{user.name?.charAt(0) || '؟'}</div>
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    {isSuperAdmin && <Link to="/crm" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-[#005a7d] hover:bg-[#e6f2f5]"><ShieldCheck size={16} />لوحة تحكم الموقع</Link>}
                    {isAdmin && <Link to={subRole ? '/sub-admin' : '/admin'} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm hover:bg-[#e6f2f5]"><LayoutDashboard size={16} className="text-[#005a7d]" />لوحة الإدارة</Link>}
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm hover:bg-[#e6f2f5]"><User size={16} className="text-[#005a7d]" />حسابي</Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50"><LogOut size={16} />تسجيل الخروج</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm hover:bg-[#e6f2f5] text-[#005a7d]"><LogIn size={16} />تسجيل الدخول</Link>
                    <Link to="/register" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-[#005a7d] text-white"><User size={16} />إنشاء حساب</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
