import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const saved = localStorage.getItem('remembered_email');
    const expiry = localStorage.getItem('remember_expiry');
    if (saved && expiry && Date.now() < parseInt(expiry)) {
      setForm(p => ({ ...p, email: saved, rememberMe: true }));
    } else {
      localStorage.removeItem('remembered_email');
      localStorage.removeItem('remember_expiry');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!form.email.trim()) return setError('البريد الإلكتروني مطلوب');
    if (!form.password) return setError('كلمة المرور مطلوبة');

    setLoading(true);
    try {
      const data = await api.login(form.email, form.password);
      if (form.rememberMe) {
        localStorage.setItem('remembered_email', form.email);
        localStorage.setItem('remember_expiry', (Date.now() + 30 * 24 * 60 * 60 * 1000).toString());
        localStorage.setItem('remembered_token', data.token);
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remember_expiry');
        localStorage.removeItem('remembered_token');
      }
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'بيانات غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f2f5] via-white to-[#e6f2f5] flex items-center justify-center px-4 pt-20" dir="rtl">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-[#bca056]/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#005a7d]/20 rounded-full blur-3xl animate-blob-delay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-[#bca056]/10 overflow-hidden">
          <div className="bg-gradient-to-br from-[#bca056] to-[#a68a47] px-8 pt-10 pb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Building2 size={32} className="text-white" />
            </motion.div>
            <h1 className="text-white font-black text-2xl">GREAT SOCIETY</h1>
            <p className="text-white/80 text-sm mt-1">تسجيل الدخول إلى حسابك</p>
          </div>

          <div className="px-8 py-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm"
              >
                <AlertCircle size={16} />{error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                    placeholder="أدخل البريد الإلكتروني"
                    className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-4 py-3 text-sm outline-none focus:border-[#bca056] focus:shadow-[0_0_0_4px_rgba(188,160,86,0.1)] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                    placeholder="كلمة المرور"
                    className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-10 py-3 text-sm outline-none focus:border-[#bca056] focus:shadow-[0_0_0_4px_rgba(188,160,86,0.1)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={form.rememberMe}
                  onChange={e => setForm(p => ({ ...p, rememberMe: e.target.checked }))}
                  className="w-4 h-4 rounded border-2 border-gray-200 accent-[#bca056] cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                  تذكرني لمدة شهر واحد
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-gradient-to-r from-[#bca056] to-[#a68a47] text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-[#bca056]/20 hover:shadow-[#bca056]/30 transition-all disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري تسجيل الدخول...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    تسجيل الدخول
                    <ArrowRight size={16} />
                  </span>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-gray-500 text-sm">
                ليس لديك حساب؟{' '}
                <Link to="/register" className="text-[#bca056] font-semibold hover:text-[#a68a47] transition-colors">إنشاء حساب جديد</Link>
              </p>

              <Link to="/forgot-password" className="block text-[#005a7d] text-sm hover:text-[#004a68] transition-colors">
                نسيت كلمة المرور؟
              </Link>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-200">
                <a href="https://drive.google.com/file/d/1ZMjlODUmm0o7C6zf00iPyelXDH4gFTy0/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="hover:text-[#005a7d] transition-colors">سياسة الخصوصية</a>
                <span className="text-gray-300">|</span>
                <a href="https://drive.google.com/file/d/1sgHp8G35p6LDGmFQx_La2IZ54gjCTVyu/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="hover:text-[#005a7d] transition-colors">الشروط والأحكام</a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
