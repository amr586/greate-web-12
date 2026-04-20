import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Heart, LogOut, CreditCard, MessageSquare, Phone, Send, ChevronRight, X, Plus, User, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import PropertyChat from '../components/PropertyChat';
import ProfileTab from '../components/ProfileTab';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop';
const COMPANY_PHONE = '01100111618';

function PropertyRow({ property, onChat, onEdit }: { property: any; onChat?: () => void; onEdit?: () => void }) {
  const STATUS_LABEL: Record<string, string> = { pending: 'مراجعة', approved: 'موافق', rejected: 'مرفوض', sold: 'مباع' };
  const STATUS_COLOR: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', sold: 'bg-gray-100 text-gray-600' };
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-[#ccdfed] transition-all flex gap-4 p-4">
      <Link to={`/properties/${property.id}`} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
        <img src={property.primary_image || DEFAULT_IMAGE} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform"
          onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }} />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/properties/${property.id}`}>
          <div className="font-bold text-gray-900 text-sm line-clamp-1 hover:text-[#005a7d] transition-colors">{property.title_ar || property.title}</div>
        </Link>
        <div className="text-gray-500 text-xs mt-0.5">{property.district} · {Number(property.area)}م²</div>
        <div className="text-[#005a7d] font-bold text-sm mt-1">{Number(property.price).toLocaleString()} جنيه</div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${STATUS_COLOR[property.status] || 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABEL[property.status] || property.status}
        </span>
        {property.status === 'pending' && onEdit && (
          <button onClick={onEdit} className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
            <Pencil size={12} />تعديل
          </button>
        )}
        {onChat && (
          <button onClick={onChat} className="flex items-center gap-1 text-xs text-[#005a7d] bg-[#e6f2f5] hover:bg-[#ccdfed] px-2.5 py-1.5 rounded-lg font-medium transition-colors">
            <MessageSquare size={12} />محادثة
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc, link, linkLabel }: { icon: React.ReactNode; title: string; desc: string; link: string; linkLabel: string; }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
      <div className="w-16 h-16 bg-[#e6f2f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#005a7d]">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 text-sm mb-4">{desc}</p>
      <Link to={link} className="text-[#005a7d] font-semibold text-sm hover:underline">{linkLabel}</Link>
    </div>
  );
}


export default function UserDashboard() {
  const { user, logout, isAdmin, isSuperAdmin, updateUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('properties');
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatProperty, setChatProperty] = useState<{ id: number; title: string } | null>(null);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [replyMsg, setReplyMsg] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    if (isSuperAdmin) { navigate('/superadmin'); return; }
    if (isAdmin) { navigate('/admin'); return; }
    loadData();
  }, [user, authLoading, navigate, isSuperAdmin, isAdmin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticketMessages]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [propertiesData, savedData, paymentsData, ticketsData] = await Promise.allSettled([
        api.getProperties({ user_id: user?.id }),
        api.getSaved(),
        api.myPayments(),
        api.getTickets(),
      ]);
      if (propertiesData.status === 'fulfilled') setMyProperties((propertiesData.value as any)?.properties || []);
      if (savedData.status === 'fulfilled') setSavedProperties((savedData.value as any) || []);
      if (paymentsData.status === 'fulfilled') setPayments((paymentsData.value as any) || []);
      if (ticketsData.status === 'fulfilled') setTickets((ticketsData.value as any) || []);
    } catch {}
    finally { setIsLoading(false); }
  };

  const openTicket = async (ticket: any) => {
    setActiveTicket(ticket);
    const msgs = await api.getTicketMessages(ticket.id);
    setTicketMessages(msgs || []);
  };

  const sendReply = async () => {
    if (!replyMsg.trim() || !activeTicket) return;
    setSendingReply(true);
    try {
      const msg = await api.sendTicketMessage(activeTicket.id, replyMsg);
      setTicketMessages(prev => [...prev, msg]);
      setReplyMsg('');
    } catch {}
    finally { setSendingReply(false); }
  };

  const createTicket = async () => {
    if (!newSubject.trim() || !newPhone.trim()) return;
    setCreatingTicket(true);
    try {
      const ticket = await api.createTicket(newSubject);
      await api.sendTicketMessage(ticket.id, `رقم هاتفي للتواصل: ${newPhone}`);
      setTickets(prev => [ticket, ...prev]);
      setNewSubject('');
      setNewPhone('');
      setShowNewTicket(false);
      openTicket(ticket);
    } catch {}
    finally { setCreatingTicket(false); }
  };

  if (!user) return null;

  const tabs = [
    { id: 'profile', label: 'بروفايلي', icon: <User size={16} /> },
    { id: 'properties', label: 'عقاراتي', icon: <Building2 size={16} />, count: myProperties.length },
    { id: 'saved', label: 'المحفوظات', icon: <Heart size={16} />, count: savedProperties.length },
    { id: 'payments', label: 'طلباتي', icon: <CreditCard size={16} />, count: payments.length },
    { id: 'inquiries', label: 'استفساراتي', icon: <MessageSquare size={16} />, count: tickets.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#005a7d] to-[#004a68] rounded-3xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4" />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-white/30">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/20 flex items-center justify-center text-3xl font-black">
                  {user.name?.charAt(0) || '؟'}
                </div>
              )}
            </div>
            <div className="text-center sm:text-right flex-1">
              <h1 className="text-2xl font-black">{user.name}</h1>
              <p className="text-[#99c8db] text-sm mt-1">{user.email}</p>
              {user.phone && <p className="text-[#99c8db] text-sm" dir="ltr">{user.phone}</p>}
            </div>
            <button onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-medium"
            >
              <LogOut size={15} />تسجيل الخروج
            </button>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-[#005a7d] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {t.icon}<span className="hidden sm:inline">{t.label}</span>
              {(t as any).count > 0 && <span className={`text-xs rounded-full px-2 py-0.5 ${activeTab === t.id ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'}`}>{(t as any).count}</span>}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <ProfileTab user={user} updateUser={updateUser} />
        )}

        {isLoading && activeTab !== 'profile' ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#99c8db] border-t-[#005a7d] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'properties' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">عقاراتي ({myProperties.length})</h2>
                  <Link to="/sell" className="flex items-center gap-1.5 bg-[#005a7d] text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90">
                    <Building2 size={14} />أضف عقاراً
                  </Link>
                </div>
                {myProperties.length === 0 ? (
                  <EmptyState icon={<Building2 size={32} />} title="لا توجد عقارات" desc="لم تُضف أي عقارات بعد" link="/sell" linkLabel="أضف أول عقار" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myProperties.map(p => (
                      <PropertyRow key={p.id} property={p}
                        onChat={() => setChatProperty({ id: p.id, title: p.title_ar || p.title })}
                        onEdit={() => navigate(`/edit-property/${p.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'saved' && (
              <div>
                <h2 className="font-bold text-gray-900 mb-4">المحفوظات ({savedProperties.length})</h2>
                {savedProperties.length === 0 ? (
                  <EmptyState icon={<Heart size={32} />} title="لا توجد مفضلات" desc="احفظ العقارات التي تعجبك" link="/properties" linkLabel="تصفح العقارات" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedProperties.map((p: any) => <PropertyRow key={p.id} property={p} />)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <h2 className="font-bold text-gray-900 mb-4">طلباتي ({payments.length})</h2>
                {payments.length === 0 ? (
                  <EmptyState icon={<CreditCard size={32} />} title="لا توجد طلبات" desc="لم تُقدم أي طلبات شراء بعد" link="/properties" linkLabel="تصفح العقارات" />
                ) : (
                  <div className="space-y-3">
                    {payments.map((p: any) => (
                      <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#ccdfed] rounded-xl flex items-center justify-center flex-shrink-0">
                          <CreditCard size={20} className="text-[#005a7d]" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 text-sm">{p.property_title_ar || 'عقار'}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{Number(p.amount).toLocaleString()} جنيه · {p.payment_method}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${p.status === 'approved' ? 'bg-green-100 text-green-700' : p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.status === 'approved' ? 'موافق عليه' : p.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inquiries' && (
              <div>
                <div className="bg-gradient-to-r from-[#005a7d]/10 to-[#007a9a]/10 border border-[#005a7d]/20 rounded-2xl p-4 mb-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#005a7d] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">تواصل مباشر مع خدمة العملاء</p>
                    <p className="text-gray-500 text-xs mt-0.5">يمكنك التواصل معنا مباشرة أو فتح استفسار أدناه</p>
                  </div>
                  <a href={`tel:${COMPANY_PHONE}`}
                    className="flex items-center gap-2 bg-[#005a7d] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#004a68] transition-colors"
                    dir="ltr"
                  >
                    <Phone size={16} />{COMPANY_PHONE}
                  </a>
                </div>

                <AnimatePresence>
                  {activeTicket ? (
                    <motion.div key="ticket-chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#f8fafc]">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{activeTicket.subject}</h3>
                          <span className={`text-xs font-medium ${activeTicket.status === 'open' ? 'text-green-600' : 'text-gray-400'}`}>
                            {activeTicket.status === 'open' ? '● مفتوح' : '● مغلق'}
                          </span>
                        </div>
                        <button onClick={() => setActiveTicket(null)}
                          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
                        ><X size={14} /></button>
                      </div>

                      <div className="p-4 h-72 overflow-y-auto space-y-3">
                        {ticketMessages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender_id === user.id ? 'bg-[#005a7d] text-white rounded-bl-none' : 'bg-[#e6f2f5] text-gray-800 rounded-br-none'}`}>
                              {msg.is_admin && <p className="text-xs mb-1 opacity-70 font-semibold">خدمة العملاء</p>}
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {ticketMessages.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">لا توجد رسائل بعد — ابدأ المحادثة</p>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {activeTicket.status === 'open' ? (
                        <div className="p-4 border-t border-gray-100 flex gap-2">
                          <input value={replyMsg} onChange={e => setReplyMsg(e.target.value)}
                            placeholder="اكتب رسالتك..."
                            onKeyDown={e => e.key === 'Enter' && sendReply()}
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d]" />
                          <button onClick={sendReply} disabled={sendingReply || !replyMsg.trim()}
                            className="w-10 h-10 bg-[#005a7d] rounded-xl flex items-center justify-center text-white hover:bg-[#004a68] disabled:opacity-50"
                          ><Send size={16} /></button>
                        </div>
                      ) : (
                        <div className="p-4 border-t border-gray-100 text-center text-sm text-gray-400">
                          تم إغلاق هذا الاستفسار
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="ticket-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-900">استفساراتي ({tickets.length})</h2>
                        <button onClick={() => { setShowNewTicket(true); setNewPhone((user as any)?.phone || ''); }}
                          className="flex items-center gap-1.5 bg-[#005a7d] text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90"
                        >
                          <Plus size={14} />استفسار جديد
                        </button>
                      </div>

                      <AnimatePresence>
                        {showNewTicket && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-2xl p-5 border border-[#005a7d]/30 shadow-sm mb-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-bold text-gray-900 text-sm">استفسار جديد</h3>
                              <button onClick={() => setShowNewTicket(false)}
                                className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                              ><X size={13} /></button>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">موضوع الاستفسار <span className="text-red-500">*</span></label>
                                <input value={newSubject} onChange={e => setNewSubject(e.target.value)}
                                  placeholder="مثال: أريد الاستفسار عن شقة في التجمع..."
                                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d]" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">رقم هاتفك للتواصل <span className="text-red-500">*</span></label>
                                <input
                                  type="tel"
                                  value={newPhone}
                                  onChange={e => setNewPhone(e.target.value)}
                                  placeholder="01xxxxxxxxx"
                                  dir="ltr"
                                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#005a7d] text-right"
                                />
                                <p className="text-xs text-gray-400 mt-1">سيستخدمه فريق الدعم للتواصل معك مباشرة</p>
                              </div>
                              <button onClick={createTicket} disabled={creatingTicket || !newSubject.trim() || !newPhone.trim()}
                                className="w-full bg-[#005a7d] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#004a68] disabled:opacity-50 transition-colors"
                              >
                                {creatingTicket ? 'جاري الإرسال...' : 'إرسال الاستفسار'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {tickets.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                          <MessageSquare size={48} className="text-gray-300 mx-auto mb-3" />
                          <p className="font-bold text-gray-900 mb-1">لا توجد استفسارات</p>
                          <p className="text-gray-500 text-sm mb-4">افتح استفساراً جديداً وسيرد عليك فريق الدعم</p>
                          <button onClick={() => { setShowNewTicket(true); setNewPhone((user as any)?.phone || ''); }}
                            className="text-[#005a7d] font-semibold text-sm hover:underline"
                          >+ استفسار جديد</button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {tickets.map(ticket => (
                            <motion.div key={ticket.id} layout
                              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-[#005a7d]/30 hover:shadow-md transition-all"
                              onClick={() => openTicket(ticket)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ticket.status === 'open' ? 'bg-[#e6f2f5] text-[#005a7d]' : 'bg-gray-100 text-gray-400'}`}>
                                    <MessageSquare size={18} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">{ticket.subject}</p>
                                    <p className="text-gray-400 text-xs mt-0.5">{new Date(ticket.created_at).toLocaleDateString('ar-EG')}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {ticket.status === 'open' ? 'مفتوح' : 'مغلق'}
                                  </span>
                                  <ChevronRight size={16} className="text-gray-400" />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {chatProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setChatProperty(null); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              className="w-full max-w-lg h-[70vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <PropertyChat
                propertyId={chatProperty.id}
                propertyTitle={chatProperty.title}
                onClose={() => setChatProperty(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
