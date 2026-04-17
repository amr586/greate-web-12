import { PROPERTIES } from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  try {
    const url = path.includes('?') ? `${path}&t=${Date.now()}` : `${path}?t=${Date.now()}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const res = await fetch(BASE_URL + url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeout);
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'خطأ غير متوقع');
    return data;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('انتهت مهلة الاتصال - تحقق من الاتصال بالخادم');
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('لا يمكن الاتصال بالخادم');
    }
    throw err;
  }
}

export const api = {
  login: async (emailOrPhone: string, password: string) => {
    const deviceId = getDeviceId();
    return request('/auth/login', { 
      method: 'POST', 
      body: JSON.stringify({ emailOrPhone, password, deviceId }) 
    });
  },
register: (data: { name: string; email: string; phone: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  verifyRegister: (email: string, otp: string) =>
    request('/auth/register/verify', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  sendOTP: (data: { name: string; email: string; phone: string; password: string; otpMethod?: string }) =>
    request('/auth/send-otp', { method: 'POST', body: JSON.stringify(data) }),
  resendRegisterOTP: (email: string) =>
    request('/auth/register/verify/resend', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyLoginOTP: (email: string, otp: string, rememberMe?: boolean) => {
    const deviceId = getDeviceId();
    return request('/auth/verify-login-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, rememberDevice: rememberMe, deviceId })
    });
  },
  resendLoginOTP: (email: string) =>
    request('/auth/resend-login-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  sendForgotPassword: (email: string) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyForgotPassword: (email: string, otp: string) =>
    request('/auth/verify-forgot-password', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resetPassword: (email: string, otp: string, newPassword: string) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) }),
  me: () => request('/auth/me'),
  updateProfile: (data: { name: string; phone: string; avatar_url?: string }) =>
    request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request('/auth/change-password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),

  sendEmailVerification: () => request('/auth/send-email-verification', { method: 'POST' }),
  verifyEmail: (email: string, otp: string) => request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  getTrustedDevices: () => request('/auth/trusted-devices'),
  removeTrustedDevice: (deviceId: string) => request(`/auth/trusted-devices/${deviceId}`, { method: 'DELETE' }),

  getProperties: async (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined).map(([k, v]) => [k, String(v)]));
    const result = await request('/properties?' + q.toString());
    if (!result) {
      return PROPERTIES.filter(p => p.status !== 'sold');
    }
    return result;
  },
  getFeatured: async () => {
    const result = await request('/properties/featured');
    if (!result) {
      return PROPERTIES.filter(p => p.featured && p.status !== 'sold');
    }
    return result;
  },
  getProperty: (id: number) => request(`/properties/${id}`),
  addProperty: (data: any) => request('/properties', { method: 'POST', body: JSON.stringify(data) }),
  saveProperty: (id: number) => request(`/properties/${id}/save`, { method: 'POST' }),
  unsaveProperty: (id: number) => request(`/properties/${id}/save`, { method: 'DELETE' }),
  getSaved: () => request('/properties/user/saved'),

  getStats: () => request('/admin/stats'),
  getAllProperties: () => request('/admin/properties'),
  getAdminProperty: (id: number) => request(`/admin/properties/${id}`),
  approveProperty: (id: number, data: any = {}) => request(`/admin/properties/${id}/approve`, { method: 'PATCH', body: JSON.stringify(data) }),
  rejectProperty: (id: number) => request(`/admin/properties/${id}/reject`, { method: 'PATCH' }),
  markSold: (id: number, buyer_id?: number) => request(`/admin/properties/${id}/sold`, { method: 'PATCH', body: JSON.stringify({ buyer_id }) }),
  getUsers: () => request('/admin/users'),
  updateRole: (id: number, role: string, sub_role?: string) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role, sub_role }) }),
  toggleUser: (id: number) => request(`/admin/users/${id}/toggle`, { method: 'PATCH' }),
  resetUserPassword: (id: number, newPassword: string) => request(`/admin/users/${id}/reset-password`, { method: 'PATCH', body: JSON.stringify({ newPassword }) }),
  getAnalytics: () => request('/admin/analytics'),
  getAdminPayments: () => request('/admin/payments'),
  approvePayment: (id: number) => request(`/admin/payments/${id}/approve`, { method: 'PATCH' }),
  editProperty: (id: number, data: any) => request(`/admin/properties/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProperty: (id: number) => request(`/admin/properties/${id}`, { method: 'DELETE' }),
  getAdminPurchaseRequests: () => request('/admin/payments'),
  getPropertyImages: (id: number) => request(`/admin/properties/${id}/images`),
  deletePropertyImage: (propId: number, imageId: number) => request(`/admin/properties/${propId}/images/${imageId}`, { method: 'DELETE' }),
  addPropertyImage: (propId: number, url: string, is_primary?: boolean) => request(`/admin/properties/${propId}/images`, { method: 'POST', body: JSON.stringify({ url, is_primary }) }),
  setPropertyImagePrimary: (propId: number, imageId: number) => request(`/admin/properties/${propId}/images/${imageId}/primary`, { method: 'PATCH' }),

  requestPayment: (data: any) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
  myPayments: () => request('/payments/my-payments'),

  createTicket: (subject: string) => request('/support/tickets', { method: 'POST', body: JSON.stringify({ subject }) }),
  getTickets: () => request('/support/tickets'),
  getTicketMessages: (id: number) => request(`/support/tickets/${id}/messages`),
  sendTicketMessage: (id: number, content: string) => request(`/support/tickets/${id}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  closeTicket: (id: number) => request(`/support/tickets/${id}/close`, { method: 'PATCH' }),

  submitContact: (data: { name: string; email: string; phone: string; subject: string; message: string }) =>
    request('/contact', { method: 'POST', body: JSON.stringify(data) }),
  getContactMessages: () => request('/contact'),
  markContactRead: (id: number) => request(`/contact/${id}/read`, { method: 'PATCH' }),

  getRecommendations: (params: any) => request('/ai/recommend', { method: 'POST', body: JSON.stringify(params) }),

  getPropertyChatMessages: (propertyId: number) => request(`/property-chat/${propertyId}/messages`),
  sendPropertyChatMessage: (propertyId: number, content: string) =>
    request(`/property-chat/${propertyId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  getMyPropertyChats: () => request('/property-chat/my-chats'),
};

export async function streamChat(messages: any[], onChunk: (text: string) => void, onDone: () => void, onError?: (msg: string) => void) {
  const token = getToken();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    
    const res = await fetch(BASE_URL + '/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);

    if (!res.ok) {
      if (onError) onError('خطأ في الخادم');
      else onDone();
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.content) onChunk(data.content);
          if (data.done) onDone();
          if (data.error) {
            if (onError) onError(data.error);
            else onDone();
          }
        } catch {}
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      if (onError) onError('انتهت مهلة الاتصال - الخادم لا يستجيب');
    } else if (onError) {
      onError(err.message || 'خطأ في الاتصال');
    }
    onDone();
  }
}