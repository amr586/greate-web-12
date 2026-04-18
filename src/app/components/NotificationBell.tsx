import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, MessageSquare, Home, CreditCard, Headphones, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

function notifIcon(type: string) {
  if (type === 'property_added' || type === 'property_approved' || type === 'property_rejected') return <Home size={14} />;
  if (type === 'payment' || type === 'payment_request' || type === 'purchase_request') return <CreditCard size={14} />;
  if (type === 'support' || type === 'support_reply') return <Headphones size={14} />;
  if (type === 'chat' || type === 'message' || type === 'property_inquiry' || type === 'property_reply') return <MessageSquare size={14} />;
  return <Info size={14} />;
}

function notifColor(type: string) {
  if (type === 'property_approved') return 'bg-green-100 text-green-600';
  if (type === 'property_rejected') return 'bg-red-100 text-red-600';
  if (type === 'property_added') return 'bg-blue-100 text-blue-600';
  if (type === 'payment' || type === 'payment_request' || type === 'purchase_request') return 'bg-amber-100 text-amber-600';
  if (type === 'support' || type === 'support_reply') return 'bg-purple-100 text-purple-600';
  if (type === 'property_inquiry' || type === 'property_reply') return 'bg-violet-100 text-violet-600';
  return 'bg-gray-100 text-gray-600';
}

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const API_BASE = import.meta.env.VITE_API_URL || 'https://greate-web-12.vercel.app/api';

  const fetchCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setUnread(data.count);
      }
    } catch {}
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/notifications/mine`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {}
    setLoading(false);
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open) fetchNotifications();
  };

  const handleNotifClick = async (n: Notification) => {
    if (!n.is_read) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE}/notifications/mark-read/${n.id}`, {
          method: 'PATCH',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
        setUnread(prev => Math.max(0, prev - 1));
      } catch {}
    }
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl bg-[#e6f2f5] hover:bg-[#ccdfed] flex items-center justify-center text-[#005a7d] transition-all"
        title="الإشعارات"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
            dir="rtl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="font-bold text-gray-800 text-sm">الإشعارات</span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[#005a7d] hover:underline">
                    <CheckCheck size={12} />قراءة الكل
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center text-gray-400 text-sm">جاري التحميل...</div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    className={`flex gap-3 px-4 py-3 border-b border-gray-50 transition-colors ${n.link ? 'cursor-pointer hover:bg-[#e6f2f5]' : 'hover:bg-gray-50'} ${!n.is_read ? 'bg-blue-50/40' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${notifColor(n.type)}`}>
                      {notifIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold text-gray-800 leading-snug ${!n.is_read ? 'font-bold' : ''}`}>{n.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
