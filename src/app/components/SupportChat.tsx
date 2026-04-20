import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Headphones, X, Send, MessageSquare } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Msg { id: number; sender_id: number; content: string; created_at: string; sender_name?: string; }

export default function SupportChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [creating, setCreating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!open || !ticketId) { if (pollRef.current) clearInterval(pollRef.current); return; }
    loadMessages();
    pollRef.current = setInterval(loadMessages, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open, ticketId]);

  useEffect(() => {
    if (open && user && !ticketId) {
      api.getTickets().then((tickets: any[]) => {
        const active = tickets.find((t: any) => t.status === 'open');
        if (active) setTicketId(active.id);
      }).catch(() => {});
    }
  }, [open, user]);

  const loadMessages = async () => {
    if (!ticketId) return;
    try {
      const data = await api.getTicketMessages(ticketId);
      console.log('[SupportChat] messages:', data);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('[SupportChat] load error:', e);
    }
  };

  const createTicket = async () => {
    if (!subject.trim()) return;
    setCreating(true);
    try {
      const ticket = await api.createTicket(subject);
      setTicketId(ticket.id);
      setSubject('');
    } catch (err: any) { alert(err.message); }
    finally { setCreating(false); }
  };

  const send = async () => {
    if (!input.trim() || loading || !ticketId) return;
    const content = input.trim();
    setInput('');
    setLoading(true);
    try {
      console.log('[SupportChat] sending:', content);
      await api.sendTicketMessage(ticketId, content);
      console.log('[SupportChat] sent OK');
      await loadMessages();
    } catch (e) {
      console.error('[SupportChat] send error:', e);
      setInput(content);
    }
    finally { setLoading(false); }
  };

  if (!user) return null;

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2.3, type: 'spring' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-24 z-40 w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-2xl shadow-gray-400/30"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="sup" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Headphones size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 left-6 z-40 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
            style={{ maxHeight: 'calc(100vh - 7rem)', height: 480 }}
            dir="rtl"
          >
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Headphones size={18} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">الدعم والمساعدة</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-gray-300 text-xs">متصل الآن</span>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="mr-auto text-white/70 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {!ticketId ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquare size={28} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">ابدأ محادثة جديدة</h3>
                <p className="text-gray-500 text-sm mb-6">أخبرنا بموضوع استفسارك</p>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') createTicket(); }}
                  placeholder="موضوع الاستفسار..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-500 mb-3"
                />
                <button onClick={createTicket} disabled={!subject.trim() || creating}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                >
                  {creating ? 'جاري الإنشاء...' : 'بدء المحادثة'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-8">لا توجد رسائل بعد. ابدأ المحادثة!</div>
                  )}
                  {messages.map((m, i) => {
                    const isMe = m.sender_id === user?.id;
                    return (
                      <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${isMe ? 'bg-gray-100 text-gray-800 rounded-tr-sm' : 'bg-gray-900 text-white rounded-tl-sm'}`}>
                          {!isMe && <div className="text-xs text-gray-400 mb-1 font-medium">{m.sender_name || 'الدعم'}</div>}
                          {m.content}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <div className="p-3 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') send(); }}
                      placeholder="اكتب رسالتك..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-gray-400 transition-all"
                      disabled={loading}
                    />
                    <button onClick={send} disabled={loading || !input.trim()}
                      className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white disabled:opacity-50 flex-shrink-0"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
