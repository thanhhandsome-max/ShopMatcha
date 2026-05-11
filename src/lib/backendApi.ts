/**
 * Base URL cho JSON API (Route Handlers Next.js: /api/...).
 * Nếu NEXT_PUBLIC_API_URL có (ví dụ proxy sang host khác), dùng giá trị đó; ngược lại same-origin `/api`.
 */
export function getBackendApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, '');
  }
  return '/api';
}

export function getAuthHeadersJson(): HeadersInit {
  if (typeof window === 'undefined') {
    return { 'Content-Type': 'application/json' };
  }
  const token = localStorage.getItem('htdcha-token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}
