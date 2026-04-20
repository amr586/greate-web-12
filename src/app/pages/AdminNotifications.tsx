import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCircle, AlertCircle, Building2, User, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { getApiBaseUrl } from '../lib/getApiUrl';
const API_BASE = getApiBaseUrl();

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  property_data?: any;
  user_data?: any;
  is_read: boolean;
  created_at: string;
}

export default function AdminNotifications() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    if (!isAdmin) { navigate('/dashboard'); return; }
    loadNotifications();
    setIsLoading(false);

    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications/admin`, {
        headers: {
          'Cache-Control': 'no-cache',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`${API_BASE}/notifications/mark-read/${notificationId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
      }
    } catch (error) {
      
    }
  };

  const deleteNotification = (notificationId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  if (!user || !isAdmin) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#bca056] to-[#a68a47] rounded-2xl flex items-center justify-center">
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">إخطارات الإدارة</h1>
              <p className="text-gray-600">إدارة التنبيهات الخاصة بك</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الإخطارات</p>
                <p className="text-2xl font-black text-gray-900">{notifications.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">غير مقروءة</p>
                <p className="text-2xl font-black text-[#bca056]">{unreadCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertCircle size={20} className="text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">مقروءة</p>
                <p className="text-2xl font-black text-green-600">{notifications.length - unreadCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">جاري التحميل...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <Bell size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">لا توجد إخطارات حالياً</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-2xl p-6 border-l-4 ${
                    !notification.is_read ? 'border-l-[#bca056] bg-blue-50' : 'border-l-gray-200'
                  } flex items-start justify-between gap-4 cursor-pointer hover:shadow-lg transition-shadow`}
                  onClick={() => {
                    setSelectedNotification(notification);
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{notification.title}</h3>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-[#bca056] rounded-full" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{notification.message}</p>

                    {notification.property_data && notification.user_data && (
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm mb-2">بيانات المستخدم:</h4>
                          <ul className="space-y-1 text-xs text-gray-600">
                            <li className="flex items-center gap-2">
                              <User size={14} className="text-[#bca056]" />
                              {notification.user_data.name}
                            </li>
                            <li className="flex items-center gap-2">
                              <Mail size={14} className="text-[#bca056]" />
                              {notification.user_data.email}
                            </li>
                            <li className="flex items-center gap-2">
                              <Phone size={14} className="text-[#bca056]" />
                              {notification.user_data.phone}
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-bold text-gray-900 text-sm mb-2">بيانات العقار:</h4>
                          <ul className="space-y-1 text-xs text-gray-600">
                            <li className="flex items-center gap-2">
                              <Building2 size={14} className="text-[#bca056]" />
                              {notification.property_data.title}
                            </li>
                            <li className="flex items-center gap-2">
                              <MapPin size={14} className="text-[#bca056]" />
                              {notification.property_data.district}
                            </li>
                            <li>السعر: {notification.property_data.price} جنيه</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    <p className="text-gray-500 text-xs mt-3">
                      {new Date(notification.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X size={18} className="text-gray-600" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNotification(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">{selectedNotification.title}</h2>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-gray-600">{selectedNotification.message}</p>
                </div>

                {selectedNotification.user_data && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 mb-3">معلومات المستخدم</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-600 text-sm">الاسم</p>
                        <p className="font-bold text-gray-900">{selectedNotification.user_data.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">البريد الإلكتروني</p>
                        <p className="font-bold text-gray-900">{selectedNotification.user_data.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">رقم الهاتف</p>
                        <p className="font-bold text-gray-900">{selectedNotification.user_data.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedNotification.property_data && (
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 mb-3">معلومات العقار</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-600 text-sm">العنوان</p>
                        <p className="font-bold text-gray-900">{selectedNotification.property_data.title}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">النوع</p>
                        <p className="font-bold text-gray-900">{selectedNotification.property_data.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">السعر</p>
                        <p className="font-bold text-gray-900">{selectedNotification.property_data.price} جنيه</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">الموقع</p>
                        <p className="font-bold text-gray-900">{selectedNotification.property_data.district}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">المساحة</p>
                        <p className="font-bold text-gray-900">{selectedNotification.property_data.area} م²</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">الغرف</p>
                        <p className="font-bold text-gray-900">{selectedNotification.property_data.bedrooms} غرفة</p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-gray-500 text-sm">
                  التاريخ: {new Date(selectedNotification.created_at).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
