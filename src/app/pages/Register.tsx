import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'الاسم الكامل مطلوب';
    if (!form.email.trim()) errors.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'بريد إلكتروني غير صحيح';
    if (!form.phone.trim()) errors.phone = 'رقم الهاتف مطلوب';
    else if (!/^01[0-9]{9}$/.test(form.phone.replace(/\s/g, ''))) errors.phone = 'رقم هاتف غير صحيح (01xxxxxxxxx)';
    if (!form.password) errors.password = 'كلمة المرور مطلوبة';
    else if (form.password.length < 8) errors.password = 'كلمة المرور 8 أحرف على الأقل';
    else if (!/[A-Z]/.test(form.password)) errors.password = 'يجب أن تحتوي على حرف كبير (A-Z)';
    else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) errors.password = 'يجب أن تحتوي على رمز خاص (!@#$ ...)';
    if (!form.confirmPassword) errors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    else if (form.password !== form.confirmPassword) errors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    
    setLoading(true);
    try {
      const data = await api.register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'خطأ في إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f2f5] via-white to-[#e6f2f5] flex items-center justify-center px-4 py-12" dir="rtl">
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
            <p className="text-white/80 text-sm mt-1">إنشاء حساب جديد</p>
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

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم الكامل</label>
                <div className="relative">
                  <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="أدخل الاسم الكامل"
                    className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-4 py-3 text-sm outline-none focus:border-[#bca056] focus:shadow-[0_0_0_4px_rgba(188,160,86,0.1)] transition-all"
                  />
                </div>
                {fieldErrors.name && <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="أدخل البريد الإلكتروني"
                    className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-4 py-3 text-sm outline-none focus:border-[#bca056] focus:shadow-[0_0_0_4px_rgba(188,160,86,0.1)] transition-all"
                  />
                </div>
                {fieldErrors.email && <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف</label>
                <div className="relative">
                  <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="01xxxxxxxxx"
                    className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-4 py-3 text-sm outline-none focus:border-[#bca056] focus:shadow-[0_0_0_4px_rgba(188,160,86,0.1)] transition-all"
                  />
                </div>
                {fieldErrors.phone && <p className="text-red-600 text-xs mt-1">{fieldErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
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
                {fieldErrors.password && <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="أعد كتابة كلمة المرور"
                    className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-10 py-3 text-sm outline-none focus:border-[#bca056] focus:shadow-[0_0_0_4px_rgba(188,160,86,0.1)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="text-red-600 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-gradient-to-r from-[#bca056] to-[#a68a47] text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-[#bca056]/20 hover:shadow-[#bca056]/30 transition-all disabled:opacity-70 mt-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري إنشاء الحساب...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    إنشاء الحساب
                    <ArrowRight size={16} />
                  </span>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                هل لديك حساب بالفعل؟{' '}
                <Link to="/login" className="text-[#bca056] font-semibold hover:text-[#a68a47] transition-colors">تسجيل الدخول</Link>
              </p>

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
