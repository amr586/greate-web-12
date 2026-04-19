export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location?.hostname === 'greatsociety-eg.com') {
    return 'https://greate-web-12.vercel.app';
  }
  return '/api';
}
