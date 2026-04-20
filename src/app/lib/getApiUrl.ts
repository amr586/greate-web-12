export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    if (hostname === 'greatsociety-eg.com' || hostname === 'www.greatsociety-eg.com') {
      return 'https://greate-web-12.vercel.app/api';
    }
    if (hostname.includes('vercel.app')) {
      return 'https://greate-web-12.vercel.app/api';
    }
  }
  return 'https://greate-web-12.vercel.app/api';
}
