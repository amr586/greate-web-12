import { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';

type Step = 'register' | 'verify' | 'success';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('register');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | undefined>();

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
    else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9]/.test(form.password)) errors.password = 'يجب أن تحتوي على رمز خاص أو رقم (!@#$ أو 0-9)';
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
      
      if (data.success && data.devOtp) {
        setDevOtp(data.devOtp);
        setStep('verify');
      } else if (data.token) {
        localStorage.setItem('token', data.token);
        setStep('success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'خطأ في إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) return setError('رمز التحقق مطلوب');

    setLoading(true);
    try {
      const data = await api.verifyRegister(form.email, otp);
      if (data.token) {
        localStorage.setItem('token', data.token);
        setStep('success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'رمز التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      const data = await api.resendRegisterOTP(form.email);
      setDevOtp(data.devOtp);
    } catch (err: any) {
      setError(err.message);
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
            <p className="text-white/80 text-sm mt-1">
              {step === 'register' && 'إنشاء حساب جديد'}
              {step === 'verify' && 'التحقق من البريد الإلكتروني'}
              {step === 'success' && 'تم إنشاء الحساب'}
            </p>
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

            <AnimatePresence mode="wait">
              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} className="text-green-600" />
                  </motion.div>
                  <p className="text-gray-700 font-semibold text-lg">تم إنشاء الحساب بنجاح!</p>
                  <p className="text-gray-500 text-sm mt-2">جارٍ التوجيه للصفحة الرئيسية...</p>
                </motion.div>
              )}

              {step === 'verify' && (
                <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-center">
                    <p className="text-blue-700 font-semibold mb-2">التحقق من البريد الإلكتروني</p>
                    <p className="text-blue-600 text-sm">
                      تم إرسال رمز التحقق إلى <strong>{form.email}</strong>
                    </p>
                    {devOtp && (
                      <p className="text-xs text-blue-500 mt-2">Dev OTP: {devOtp}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">رمز التحقق</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="######"
                      maxLength={6}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono outline-none focus:border-[#bca056] focus:shadow-[0_0_0_4px_rgba(188,160,86,0.1)] transition-all"
                    />
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={loading || otp.length < 6}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-gradient-to-r from-[#bca056] to-[#a68a47] text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-[#bca056]/20 hover:shadow-[#bca056]/30 transition-all disabled:opacity-70 mt-2"
                  >
                    {loading ? 'جاري التحقق...' : 'تحقق من البريد الإلكتروني'}
                  </motion.button>

                  <button type="button" onClick={handleResend} className="w-full text-gray-500 text-sm hover:text-[#005a7d] transition-colors">
                    إعادة إرسال الرمز
                  </button>
                </motion.div>
              )}

              {step === 'register' && (
                <motion.form key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleRegister} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم بالكامل</label>
                    <div className="relative">
                      <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="أدخل الاسم" className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-4 py-3 text-sm outline-none focus:border-[#bca056]" />
                    </div>
                    {fieldErrors.name && <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="example@email.com" className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-4 py-3 text-sm outline-none focus:border-[#bca056]" />
                    </div>
                    {fieldErrors.email && <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف</label>
                    <div className="relative">
                      <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="01xxxxxxxxx" className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-4 py-3 text-sm outline-none focus:border-[#bca056]" />
                    </div>
                    {fieldErrors.phone && <p className="text-red-600 text-xs mt-1">{fieldErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">كلمة المرور</label>
                    <div className="relative">
                      <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="كلمة المرور" className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-10 py-3 text-sm outline-none focus:border-[#bca056]" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
                    <div className="relative">
                      <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="أعد كلمة المرور" className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-10 py-3 text-sm outline-none focus:border-[#bca056]" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && <p className="text-red-600 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
                  </div>

                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full bg-gradient-to-r from-[#bca056] to-[#a68a47] text-white py-3.5 rounded-xl text-sm font-bold shadow-lg mt-4">
                    {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {step === 'register' && (
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                 هل لديك حساب بالفعل？ <Link to="/login" className="text-[#bca056] font-semibold"> تسجيل الدخول</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
