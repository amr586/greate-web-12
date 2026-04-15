import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';

type Step = 'email' | 'otp' | 'newPassword' | 'success';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState<string | undefined>();

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('البريد الإلكتروني مطلوب');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'خطأ في التحقق من البريد الإلكتروني');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDevOtp(data.devOtp);
    } catch (err: any) {
      setError(err.message || 'خطأ في إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) return setError('رمز التحقق مطلوب');

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStep('newPassword');
    } catch (err: any) {
      setError(err.message || 'رمز التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword) return setError('كلمة المرور الجديدة مطلوبة');
    if (newPassword.length < 8) return setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
    if (!/[A-Z]/.test(newPassword)) return setError('يجب أن تحتوي على حرف كبير (A-Z)');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) return setError('يجب أن تحتوي على رمز خاص (!@#$ ...)');
    if (newPassword !== confirmPassword) return setError('كلمتا المرور غير متطابقتين');

    setLoading(true);
    try {
      const response = await api.resetPassword(email, otp, newPassword);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'خطأ في تعيين كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = { email: 0, otp: 1, newPassword: 2, success: 3 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f2f5] via-white to-[#e6f2f5] flex items-center justify-center px-4 py-20" dir="rtl">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 -right-16 w-72 h-72 bg-[#bca056]/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/3 -left-16 w-96 h-96 bg-[#005a7d]/20 rounded-full blur-3xl animate-blob-delay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-[#bca056]/10 overflow-hidden">
          <div className="bg-gradient-to-br from-[#005a7d] to-[#004a68] px-8 pt-8 pb-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Building2 size={28} className="text-white" />
            </div>
            <h1 className="text-white font-black text-2xl">
              {step === 'success' ? 'تم بنجاح!' : 'استعادة كلمة المرور'}
            </h1>
            <p className="text-[#bca056] text-sm mt-1">
              {step === 'email' && 'أدخل بريدك الإلكتروني للتحقق من حسابك'}
              {step === 'otp' && 'أدخل رمز التحقق المرسل إلى بريدك'}
              {(step === 'newPassword' || step === 'otp' && stepIndex[step] >= stepIndex.newPassword) && 'أدخل كلمة مرورك الجديدة'}
              {step === 'success' && 'تم تغيير كلمة المرور بنجاح'}
            </p>
          </div>

          <div className="px-8 py-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm"
              >
                <AlertCircle size={16} />{error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {step === 'email' && (
                <motion.form key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleCheckEmail} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-4 py-3 text-sm outline-none focus:border-[#005a7d] focus:shadow-[0_0_0_4px_rgba(0,90,125,0.1)] transition-all"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-gradient-to-r from-[#005a7d] to-[#007a9a] text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#005a7d]/20 hover:shadow-[#005a7d]/30 transition-all disabled:opacity-70 mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري التحقق...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        التالي
                        <ArrowRight size={16} />
                      </span>
                    )}
                  </motion.button>
                </motion.form>
              )}

              {step === 'otp' && (
                <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyOTP} className="space-y-4" noValidate>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <p className="text-blue-600 text-sm">
                      تم إرسال رمز التحقق إلى <strong>{email}</strong>
                    </p>
                    {devOtp && (
                      <p className="text-xs text-blue-500 mt-2">رمز التطوير: {devOtp}</p>
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
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono outline-none focus:border-[#005a7d] focus:shadow-[0_0_0_4px_rgba(0,90,125,0.1)] transition-all"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-gradient-to-r from-[#005a7d] to-[#007a9a] text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#005a7d]/20 hover:shadow-[#005a7d]/30 transition-all disabled:opacity-70 mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري التحقق...
                      </span>
                    ) : 'تحقق من الرمز'}
                  </motion.button>

                  <button 
                    type="button" 
                    onClick={handleSendOTP}
                    className="w-full text-gray-500 text-sm hover:text-[#005a7d] transition-colors"
                  >
                    إعادة إرسال الرمز
                  </button>

                  <button type="button" onClick={() => { setStep('email'); setError(''); }} className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors">
                    ← تغيير البريد الإلكتروني
                  </button>
                </motion.form>
              )}

              {step === 'newPassword' && (
                <motion.form key="newPassword" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleResetPassword} className="space-y-3" noValidate>
                  <p className="text-gray-500 text-sm mb-2">تعيين كلمة مرور جديدة للحساب: <strong className="text-gray-700">{email}</strong></p>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="8 أحرف + حرف كبير + رمز خاص"
                        className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-10 py-2.5 text-sm outline-none focus:border-[#005a7d] focus:shadow-[0_0_0_4px_rgba(0,90,125,0.1)] transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
                    <div className="relative">
                      <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="أعد إدخال كلمة المرور"
                        className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-10 py-2.5 text-sm outline-none focus:border-[#005a7d] focus:shadow-[0_0_0_4px_rgba(0,90,125,0.1)] transition-all"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-gradient-to-r from-[#005a7d] to-[#007a9a] text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#005a7d]/20 hover:shadow-[#005a7d]/30 transition-all disabled:opacity-70 mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري التحديث...
                      </span>
                    ) : 'تعيين كلمة المرور الجديدة'}
                  </motion.button>
                </motion.form>
              )}

              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-green-600" />
                  </motion.div>
                  <p className="text-gray-700 font-semibold">تم تغيير كلمة المرور بنجاح</p>
                  <p className="text-gray-500 text-sm">يمكنك الآن تسجيل الدخول بكلمة مرورك الجديدة</p>
                  <Link to="/login" className="inline-block mt-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-[#005a7d] to-[#007a9a] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#005a7d]/20">
                      العودة لتسجيل الدخول
                    </motion.div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {step !== 'success' && (
              <div className="mt-5 text-center">
                <p className="text-gray-500 text-sm">
                  تذكرت كلمتك؟{' '}
                  <Link to="/login" className="text-[#005a7d] font-semibold hover:text-[#004a68] transition-colors">
                    العودة لتسجيل الدخول
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}