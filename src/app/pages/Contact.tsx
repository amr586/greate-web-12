import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, MessageCircle, Facebook, Instagram, Linkedin, Send, CheckCircle, Clock, Music } from 'lucide-react';
import { api } from '../lib/api';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { settings } = useSiteSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.submitContact(form);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    { icon: <Phone size={20} />, title: 'الهاتف', value: settings.phone, href: `tel:+2${settings.phone}`, color: 'from-[#bca056] to-[#a68a47]' },
    { icon: <Mail size={20} />, title: 'البريد الإلكتروني', value: settings.email, href: `mailto:${settings.email}`, color: 'from-gray-800 to-gray-900' },
    { icon: <MessageCircle size={20} />, title: 'واتساب', value: settings.phone, href: `https://wa.me/${settings.whatsapp}`, color: 'from-green-500 to-green-600' },
    { icon: <MapPin size={20} />, title: 'الموقع', value: settings.location, href: settings.location_url, color: 'from-[#bca056] to-[#a68a47]' },
    { icon: <Clock size={20} />, title: 'ساعات العمل', value: settings.working_hours, href: '#', color: 'from-gray-800 to-gray-900' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20" dir="rtl">
      <div className="bg-gradient-to-r from-[#bca056] to-[#a68a47] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white font-black text-4xl mb-3">تواصل مع {settings.company_name}</motion.h1>
          <p className="text-white/80 text-lg">فريقنا المتخصص هنا لمساعدتك في كل خطوة</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {contactItems.map((item, i) => (
              <motion.a key={i} href={item.href} target={item.href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ x: -4 }}
                className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#e6f2f5] transition-all group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-400 font-medium">{item.title}</div>
                  <div className="text-gray-900 font-bold text-sm truncate" dir={['البريد الإلكتروني', 'الهاتف', 'واتساب'].includes(item.title) ? 'ltr' : 'rtl'}>{item.value}</div>
                </div>
              </motion.a>
            ))}

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">تابعنا على</h3>
              <div className="flex gap-3 flex-wrap">
                {[
                  { color: 'bg-[#1877F2]', icon: <Facebook size={18} />, href: 'https://www.facebook.com/share/14XzeQWvGTz/', label: 'Facebook' },
                  { color: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743]', icon: <Instagram size={18} />, href: 'https://www.instagram.com/great.societyy?igsh=MWd2bnNyNGh1emdhag==', label: 'Instagram' },
                  { color: 'bg-black', icon: <Music size={18} />, href: 'https://www.tiktok.com/@greatsociety3?lang=en-GB&is_from_webapp=1&sender_device=mobile&sender_web_id=7582984467246646796', label: 'TikTok' },
                  { color: 'bg-[#0A66C2]', icon: <Linkedin size={18} />, href: 'https://www.linkedin.com/in/great-society-9bb6722bb/', label: 'LinkedIn' },
                  { color: 'bg-[#25D366]', icon: <MessageCircle size={18} />, href: `https://wa.me/${settings.whatsapp}`, label: 'WhatsApp' },
                ].map((s, i) => (
                  <motion.a key={i} whileHover={{ scale: 1.1, y: -2 }} href={s.href} target="_blank" rel="noopener noreferrer"
                    title={s.label}
                    className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-white shadow-sm`}
                  >{s.icon}</motion.a>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              {sent ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">تم الإرسال بنجاح!</h3>
                  <p className="text-gray-500 mb-6">تم استلام رسالتك وسيتواصل معك فريقنا في أقرب وقت ممكن.</p>
                  <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                    className="text-[#bca056] font-medium hover:underline text-sm">إرسال رسالة أخرى</button>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-xl font-black text-gray-900 mb-6">أرسل رسالة</h2>
                  {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { name: 'name', label: 'الاسم الكامل', type: 'text', placeholder: 'اسمك' },
                        { name: 'phone', label: 'رقم الهاتف', type: 'tel', placeholder: '01xxxxxxxxx' },
                      ].map(f => (
                        <div key={f.name}>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                          <input type={f.type} value={form[f.name as keyof typeof form]}
                            onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                            required placeholder={f.placeholder}
                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#bca056] transition-all"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">البريد الإلكتروني</label>
                      <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="email@example.com" required
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#bca056] transition-all"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">الموضوع</label>
                      <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                        placeholder="موضوع رسالتك" required
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#bca056] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">الرسالة</label>
                      <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="اكتب رسالتك هنا..." required rows={5}
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#bca056] transition-all resize-none"
                      />
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full bg-gradient-to-r from-[#bca056] to-[#a68a47] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                      {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
