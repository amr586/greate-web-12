import { useState, useRef } from 'react';
import { User, Lock, Camera, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import { getApiBaseUrl } from '../lib/getApiUrl';

interface ProfileTabProps {
  user: any;
  updateUser: (d: any) => void;
}

export default function ProfileTab({ user, updateUser }: ProfileTabProps) {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiBaseUrl()}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ image: base64, filename: file.name }),
      });
      const data = await res.json();
      if (data.url) setAvatarUrl(data.url);
    } catch {
      setSaveErr('فشل رفع الصورة');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !phone.trim()) { setSaveErr('الاسم ورقم الهاتف مطلوبان'); return; }
    setSaving(true); setSaveMsg(''); setSaveErr('');
    try {
      const updated = await api.updateProfile({ name: name.trim(), phone: phone.trim(), avatar_url: avatarUrl || undefined });
      updateUser(updated);
      setSaveMsg('تم حفظ البيانات بنجاح');
    } catch (err: any) {
      setSaveErr(err.message || 'خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPassMsg(''); setPassErr('');
    if (!curPass || !newPass || !confirmPass) { setPassErr('جميع الحقول مطلوبة'); return; }
    if (newPass !== confirmPass) { setPassErr('كلمة المرور الجديدة وتأكيدها غير متطابقتين'); return; }
    if (newPass.length < 8) { setPassErr('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'); return; }
    setChangingPass(true);
    try {
      await api.changePassword(curPass, newPass);
      setPassMsg('تم تغيير كلمة المرور بنجاح');
      setCurPass(''); setNewPass(''); setConfirmPass('');
    } catch (err: any) {
      setPassErr(err.message || 'خطأ في تغيير كلمة المرور');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
          <User size={20} className="text-[#005a7d]" /> البيانات الشخصية
        </h2>
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#e6f2f5] flex items-center justify-center border-2 border-[#ccdfed]">
              {avatarUrl ? (
                <img src={avatarUrl} alt="صورة شخصية" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-[#005a7d]">{name.charAt(0) || '؟'}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -left-2 w-8 h-8 bg-[#005a7d] rounded-xl flex items-center justify-center text-white hover:bg-[#004a68] transition-colors shadow-md"
            >
              {uploadingAvatar ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera size={14} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <p className="text-xs text-gray-400 mt-3">اضغط على الكاميرا لتغيير الصورة</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم الكامل <span className="text-red-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d] transition-all"
              placeholder="اسمك الكامل" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">البريد الإلكتروني</label>
            <input value={user.email} disabled
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" dir="ltr" />
            <p className="text-xs text-gray-400 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف <span className="text-red-500">*</span></label>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" dir="ltr"
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d] transition-all text-right"
              placeholder="01xxxxxxxxx" />
          </div>
          {saveMsg && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2.5 text-sm">
              <CheckCircle size={16} />{saveMsg}
            </div>
          )}
          {saveErr && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">{saveErr}</div>
          )}
          <button onClick={handleSaveProfile} disabled={saving}
            className="w-full bg-[#005a7d] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#004a68] disabled:opacity-60 transition-colors">
            {saving ? 'جاري الحفظ...' : 'حفظ البيانات'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
          <Lock size={20} className="text-[#005a7d]" /> تغيير كلمة المرور
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">كلمة المرور الحالية</label>
            <div className="relative">
              <input type={showCur ? 'text' : 'password'} value={curPass} onChange={e => setCurPass(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d] transition-all pl-10"
                placeholder="••••••••" dir="ltr" />
              <button type="button" onClick={() => setShowCur(v => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCur ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">كلمة المرور الجديدة</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d] transition-all pl-10"
                placeholder="••••••••" dir="ltr" />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">تأكيد كلمة المرور الجديدة</label>
            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d] transition-all"
              placeholder="••••••••" dir="ltr" />
          </div>
          {passMsg && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2.5 text-sm">
              <CheckCircle size={16} />{passMsg}
            </div>
          )}
          {passErr && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">{passErr}</div>
          )}
          <button onClick={handleChangePassword} disabled={changingPass}
            className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-700 disabled:opacity-60 transition-colors">
            {changingPass ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
          </button>
        </div>
      </div>
    </div>
  );
}
