import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { LayoutDashboard, Globe, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CRMEntry() {
  const { user, logout, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    if (!loading && user && !isSuperAdmin) navigate('/dashboard');
  }, [user, loading]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003d55] via-[#005a7d] to-[#004a68] flex flex-col items-center justify-center p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/logo_gs.png" alt="Great Society" className="w-16 h-16 object-contain" />
          <div className="text-right">
            <div className="text-white font-black text-2xl tracking-tight">GREAT SOCIETY</div>
            <div className="text-white/60 text-xs font-medium">REALESTATE & CONSTRUCTION</div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mx-auto w-fit">
          <ShieldCheck size={16} className="text-[#bca056]" />
          <span className="text-white/90 text-sm font-semibold">مرحباً، {user.name}</span>
        </div>
        <p className="text-white/60 text-sm mt-3">اختر من أين تريد البدء</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        <motion.button
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/superadmin')}
          className="bg-white rounded-3xl p-8 shadow-2xl text-right group cursor-pointer border-2 border-transparent hover:border-[#bca056] transition-all"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#bca056] to-[#a68a47] rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
            <LayoutDashboard size={28} className="text-white" />
          </div>
          <h2 className="text-gray-900 font-black text-xl mb-2">لوحة التحكم</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            إدارة العقارات، المستخدمين، الإعدادات، والتحليلات
          </p>
          <div className="mt-5 flex items-center gap-2 text-[#bca056] font-semibold text-sm">
            <span>دخول الداش بورد</span>
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-8 shadow-2xl text-right group cursor-pointer hover:bg-white/20 hover:border-white/40 transition-all"
        >
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
            <Globe size={28} className="text-white" />
          </div>
          <h2 className="text-white font-black text-xl mb-2">متابعة الموقع</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            تصفح الموقع وتتبع العقارات والأنشطة كزائر مميز
          </p>
          <div className="mt-5 flex items-center gap-2 text-white/80 font-semibold text-sm">
            <span>فتح الموقع</span>
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
          </div>
        </motion.button>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={handleLogout}
        className="mt-10 flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm"
      >
        <LogOut size={15} />
        <span>تسجيل الخروج</span>
      </motion.button>
    </div>
  );
}
