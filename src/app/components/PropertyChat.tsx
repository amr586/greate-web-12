import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Building2, Users, ArrowRight, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: number;
  property_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  sender_sub_role?: string;
  content: string;
  is_admin: boolean;
  created_at: string;
}

interface ChatUser {
  id: number;
  name: string;
  email: string;
  msg_count: number;
  last_msg_at: string;
}

interface PropertyChatProps {
  propertyId: number;
  propertyTitle: string;
  ownerName?: string;
  onClose?: () => void;
  embedded?: boolean;
}

export default function PropertyChat({ propertyId, propertyTitle, ownerName, onClose, embedded = false }: PropertyChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [showUserList, setShowUserList] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  };

  const loadMessages = async (uid?: number) => {
    try {
      const userId = uid ?? selectedUser?.id;
      const data = await api.getPropertyChatMessages(propertyId, isAdmin ? userId : undefined);
      if (data) setMessages(data);
    } catch {}
  };

  const loadChatUsers = async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const data = await api.getPropertyChatUsers(propertyId);
      if (data) setChatUsers(data);
    } catch {}
    finally { setLoadingUsers(false); }
  };

  useEffect(() => {
    if (!user) return;
    if (isAdmin) {
      setShowUserList(true);
      loadChatUsers();
    } else {
      setLoading(true);
      loadMessages().finally(() => setLoading(false));
      pollRef.current = setInterval(loadMessages, 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [propertyId, user]);

  useEffect(() => {
    if (selectedUser) {
      if (pollRef.current) clearInterval(pollRef.current);
      setLoading(true);
      loadMessages(selectedUser.id).finally(() => setLoading(false));
      pollRef.current = setInterval(() => loadMessages(selectedUser.id), 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectUser = (u: ChatUser) => {
    setSelectedUser(u);
    setShowUserList(false);
    setMessages([]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const recipientId = isAdmin && selectedUser ? selectedUser.id : undefined;
      const msg = await api.sendPropertyChatMessage(propertyId, input.trim(), recipientId);
      if (msg) setMessages(prev => [...prev, msg]);
      setInput('');
      if (!isAdmin) setSuccess('تم ارسال طلبك بنجاح');
    } catch (err: any) {
      setError(err.message || 'خطأ في الإرسال');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dt: string) => new Date(dt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (dt: string) => new Date(dt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
  const formatRelative = (dt: string) => {
    const diff = Date.now() - new Date(dt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} ساعة`;
    return formatDate(dt);
  };

  let lastDate = '';

  const containerClasses = embedded
    ? 'flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100'
    : 'flex flex-col h-full';

  return (
    <div className={containerClasses} dir="rtl">
      {/* Header */}
      <div className={`${embedded ? '' : 'bg-gradient-to-r from-[#005a7d] to-[#007a9a]'} px-4 py-3 flex items-center justify-between ${embedded ? 'border-b border-gray-100' : ''}`}>
        <div className="flex items-center gap-3">
          {isAdmin && selectedUser && !showUserList && (
            <button
              onClick={() => { setShowUserList(true); setSelectedUser(null); setMessages([]); if (pollRef.current) clearInterval(pollRef.current); }}
              className={`p-1 rounded-lg transition-colors ${embedded ? 'text-gray-500 hover:text-gray-700' : 'text-white/80 hover:text-white'}`}
            >
              <ArrowRight size={18} />
            </button>
          )}
          <div className={`w-9 h-9 ${embedded ? 'bg-[#e6f2f5]' : 'bg-white/20'} rounded-xl flex items-center justify-center`}>
            {isAdmin && showUserList
              ? <Users size={18} className={embedded ? 'text-[#005a7d]' : 'text-white'} />
              : <Building2 size={18} className={embedded ? 'text-[#005a7d]' : 'text-white'} />
            }
          </div>
          <div>
            {isAdmin && showUserList ? (
              <div className={`font-bold text-sm ${embedded ? 'text-gray-800' : 'text-white'}`}>المحادثات - {propertyTitle}</div>
            ) : isAdmin && selectedUser ? (
              <>
                <div className={`font-bold text-sm ${embedded ? 'text-gray-800' : 'text-white'}`}>{selectedUser.name}</div>
                <div className={`text-xs ${embedded ? 'text-gray-500' : 'text-white/70'}`}>{propertyTitle}</div>
              </>
            ) : (
              <>
                <div className={`font-bold text-sm line-clamp-1 ${embedded ? 'text-gray-800' : 'text-white'}`}>{propertyTitle}</div>
                {ownerName && <div className={`text-xs ${embedded ? 'text-gray-500' : 'text-white/70'}`}>صاحب العقار: {ownerName}</div>}
              </>
            )}
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className={`transition-colors ${embedded ? 'text-gray-400 hover:text-gray-600' : 'text-white/80 hover:text-white'}`}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Admin: User List */}
      {isAdmin && showUserList ? (
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {loadingUsers ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-[#005a7d]/30 border-t-[#005a7d] rounded-full animate-spin" />
            </div>
          ) : chatUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="w-14 h-14 bg-[#e6f2f5] rounded-2xl flex items-center justify-center mb-3">
                <Users size={24} className="text-[#005a7d]" />
              </div>
              <p className="text-gray-500 text-sm font-medium">لا توجد محادثات بعد</p>
              <p className="text-gray-400 text-xs mt-1">لم يتواصل أحد بخصوص هذا العقار</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 mb-3 px-1">اختر مستخدماً لعرض محادثته</p>
              {chatUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-[#005a7d]/30 hover:bg-[#e6f2f5]/30 transition-all text-right"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#005a7d] to-[#007a9a] rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {u.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 text-sm">{u.name}</div>
                    <div className="text-gray-500 text-xs truncate">{u.email}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#005a7d] font-medium">{u.msg_count} رسالة</span>
                      {u.last_msg_at && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <Clock size={9} />{formatRelative(u.last_msg_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 flex-shrink-0 rotate-180" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50" style={{ minHeight: 0 }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-[#005a7d]/30 border-t-[#005a7d] rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-14 h-14 bg-[#e6f2f5] rounded-2xl flex items-center justify-center mb-3">
                  <MessageSquare size={24} className="text-[#005a7d]" />
                </div>
                <p className="text-gray-500 text-sm font-medium">لا توجد رسائل بعد</p>
                <p className="text-gray-400 text-xs mt-1">ابدأ المحادثة الآن</p>
              </div>
            ) : (
              messages.map((msg) => {
                const dateStr = formatDate(msg.created_at);
                const showDate = dateStr !== lastDate;
                if (showDate) lastDate = dateStr;
                const isMe = msg.sender_id === user?.id;
                const isAdminMsg = msg.is_admin;
                const displayName = isMe
                  ? 'أنت'
                  : isAdminMsg
                    ? 'Great Society Team'
                    : msg.sender_name;
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex items-center justify-center my-3">
                        <span className="bg-white border border-gray-200 text-gray-400 text-xs px-3 py-1 rounded-full">{dateStr}</span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] ${isMe ? 'items-start' : 'items-end'} flex flex-col gap-1`}>
                        <div className="flex items-center gap-1.5 px-1">
                          <span className={`text-xs font-semibold ${isAdminMsg ? 'text-[#005a7d]' : 'text-gray-600'}`}>
                            {displayName}
                          </span>
                          {isAdminMsg && (
                            <span className="text-xs bg-[#005a7d]/10 text-[#005a7d] px-1.5 py-0.5 rounded-md font-medium">
                              فريق Great Society
                            </span>
                          )}
                        </div>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-white border border-gray-200 text-gray-800 rounded-tr-sm'
                            : isAdminMsg
                              ? 'bg-gradient-to-br from-[#005a7d] to-[#007a9a] text-white rounded-tl-sm'
                              : 'bg-[#bca056] text-white rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-gray-400 text-xs px-1">{formatTime(msg.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100">
              <p className="text-red-500 text-xs">{error}</p>
            </div>
          )}
          {success && (
            <div className="px-4 py-2 bg-green-50 border-t border-green-100">
              <p className="text-green-700 text-xs font-bold">{success}</p>
            </div>
          )}

          <form onSubmit={handleSend} className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isAdmin && selectedUser ? `رد على ${selectedUser.name}...` : 'اكتب رسالتك...'}
              className="flex-1 border-2 border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#005a7d] transition-all"
              disabled={sending}
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || sending}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-gradient-to-br from-[#005a7d] to-[#007a9a] text-white rounded-xl flex items-center justify-center shadow-sm disabled:opacity-50 flex-shrink-0"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </motion.button>
          </form>
        </>
      )}
    </div>
  );
}

interface PropertyChatButtonProps {
  propertyId: number;
  propertyTitle: string;
  ownerName?: string;
}

export function PropertyChatButton({ propertyId, propertyTitle, ownerName }: PropertyChatButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 bg-gradient-to-r from-[#005a7d] to-[#007a9a] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
      >
        <MessageSquare size={16} />
        محادثة العقار
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              className="w-full max-w-md h-[70vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <PropertyChat
                propertyId={propertyId}
                propertyTitle={propertyTitle}
                ownerName={ownerName}
                onClose={() => setOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
