export function getWhatsAppNumber(phone?: string | null) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('20')) return digits;
  if (digits.startsWith('0')) return `20${digits.slice(1)}`;
  return digits;
}

export function getContactWhatsAppUrl(message: any) {
  const phone = getWhatsAppNumber(message?.phone || message?.registered_phone);
  if (!phone) return '';
  const text = encodeURIComponent(`مرحباً ${message?.name || ''}، بخصوص طلب التواصل: ${message?.subject || ''}`);
  return `https://wa.me/${phone}?text=${text}`;
}

export function getContactEmailUrl(message: any) {
  const email = String(message?.email || '').trim();
  if (!email) return '';
  const subject = encodeURIComponent(`رد على طلب التواصل: ${message?.subject || ''}`);
  const body = encodeURIComponent(`مرحباً ${message?.name || ''},\n\n`);
  return `mailto:${email}?subject=${subject}&body=${body}`;
}