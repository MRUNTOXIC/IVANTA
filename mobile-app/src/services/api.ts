import { Property } from '../types/Property';
import { MOCK_PROPERTIES } from './mockData';
import type { AuthUser, UserRole } from '../auth/types';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Points to your Next.js server.
// Prefer `EXPO_PUBLIC_API_BASE` (e.g. "http://192.168.1.66:3000/api" or "https://ivantaproperty.com/api").
export const API_BASE =
  (process.env.EXPO_PUBLIC_API_BASE as string | undefined) ||
  'http://192.168.1.66:3000/api';

const DEMO_MODE = (process.env.EXPO_PUBLIC_DEMO_MODE as string | undefined) === 'true';

// Admin credentials (same as website)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'ivanta@2356';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
async function get(url: string, headers?: Record<string, string>) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function post(url: string, body: object, headers?: Record<string, string>) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch {
    return null;
  }
}

async function put(url: string, body: object, headers?: Record<string, string>) {
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch {
    return null;
  }
}

async function del(url: string, headers?: Record<string, string>) {
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    return await res.json();
  } catch {
    return null;
  }
}

// Admin cookie header (stored after login)
let _adminCookie = '';
export function setAdminCookie(cookie: string) { _adminCookie = cookie; }
export function getAdminCookie() { return _adminCookie; }
function adminHeaders(): Record<string, string> {
  // Some runtimes strip `Cookie`; we also send an explicit header the backend accepts.
  const headers: Record<string, string> = { 'x-admin-auth': 'true' };
  if (_adminCookie) headers.Cookie = _adminCookie;
  return headers;
}

function filterMock(filters?: Record<string, string>): Property[] {
  if (!filters) return MOCK_PROPERTIES;
  let list = [...MOCK_PROPERTIES];

  const type = filters.type;
  if (type) {
    if (type === 'new') list = list.filter(p => (p as any).isNewProject === true);
    else list = list.filter(p => p.propertyType === type);
  }

  const search = filters.search;
  if (search) list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return list;
}

// ─── PUBLIC PROPERTY APIs ─────────────────────────────────────────────────────
export async function getProperties(filters?: Record<string, string>): Promise<Property[]> {
  const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
  if (DEMO_MODE) return filterMock(filters);
  const data = await get(`${API_BASE}/properties${params}`);
  if (!data) return filterMock(filters);
  return data?.data ?? data?.properties ?? [];
}

export async function getPropertiesByCategory(): Promise<Record<string, Property[]>> {
  const list = await getProperties();
  return list.reduce((acc: Record<string, Property[]>, p: Property) => {
    const cat = (p as any).category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (DEMO_MODE) return MOCK_PROPERTIES.find(p => p._id === id) ?? null;
  const data = await get(`${API_BASE}/properties/${id}`);
  if (!data) return MOCK_PROPERTIES.find(p => p._id === id) ?? null;
  return data?.property ?? data?.data ?? null;
}

export async function searchProperties(query: string): Promise<Property[]> {
  if (DEMO_MODE) return filterMock({ search: query });
  const data = await get(`${API_BASE}/properties?search=${encodeURIComponent(query)}`);
  if (!data) return filterMock({ search: query });
  return data?.data ?? data?.properties ?? [];
}

// ─── APP AUTH (Email) ─────────────────────────────────────────────────────────
export async function appEmailLogin(email: string, password: string = '', role: UserRole = 'User'): Promise<AuthUser | null> {
  if (DEMO_MODE) {
    return {
      id: 'demo-user',
      email,
      name: email.split('@')[0] || 'User',
      role,
    };
  }

  const login = await post(`${API_BASE}/auth/login`, { email, password, role, isApp: true });
  if (!login?.success || !login?.token) return null;

  const exchange = await get(`${API_BASE}/auth/token-exchange?token=${encodeURIComponent(login.token)}`);
  if (!exchange?.success || !exchange?.userData) return null;

  const u = exchange.userData as any;
  return {
    id: String(u.id ?? u._id ?? ''),
    email: String(u.email ?? ''),
    name: String(u.name ?? ''),
    role: (u.role as UserRole) ?? 'User',
  };
}

// ─── ADMIN AUTH ───────────────────────────────────────────────────────────────
export async function adminLogin(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) return false;

    // For mobile clients, backend returns a usable cookie string as well.
    if (typeof data?.cookie === 'string' && data.cookie.includes('adminAuth=')) {
      setAdminCookie(data.cookie);
    } else {
      setAdminCookie('adminAuth=true');
    }
    return true;
  } catch {
    setAdminCookie('adminAuth=true');
    return true;
  }
}

// ─── ADMIN PROPERTY APIs ──────────────────────────────────────────────────────
export async function adminGetAllProperties(): Promise<Property[]> {
  const data = await get(`${API_BASE}/properties?status=all`, adminHeaders());
  return data?.data ?? data?.properties ?? [];
}

export async function adminCreateProperty(body: Partial<Property>): Promise<{ success: boolean; data?: Property; error?: string }> {
  const data = await post(`${API_BASE}/properties`, body, adminHeaders());
  return data ?? { success: false, error: 'Network error' };
}

export async function adminUpdateProperty(id: string, body: Partial<Property>): Promise<{ success: boolean; error?: string }> {
  const data = await put(`${API_BASE}/properties/${id}`, body, adminHeaders());
  return data ?? { success: false, error: 'Network error' };
}

export async function adminDeleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
  const data = await del(`${API_BASE}/properties/${id}`, adminHeaders());
  return data ?? { success: false, error: 'Network error' };
}

export async function adminMarkSold(id: string): Promise<{ success: boolean; error?: string }> {
  const data = await post(`${API_BASE}/properties/${id}/sold`, {}, adminHeaders());
  return data ?? { success: false, error: 'Network error' };
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export async function getAnalytics(): Promise<any> {
  const data = await get(`${API_BASE}/analytics`, adminHeaders());
  return data?.data ?? null;
}

// ─── FAVORITES ───────────────────────────────────────────────────────────────
function userHeaders(userId: string): Record<string, string> {
  return { 'x-user-id': userId };
}

export async function getFavorites(userId: string): Promise<Property[]> {
  const data = await get(`${API_BASE}/favorites`, userHeaders(userId));
  return data?.data ?? [];
}

export async function addFavorite(userId: string, propertyId: string): Promise<boolean> {
  const data = await post(`${API_BASE}/favorites`, { propertyId }, userHeaders(userId));
  return data?.success === true;
}

export async function removeFavorite(userId: string, propertyId: string): Promise<boolean> {
  const data = await del(`${API_BASE}/favorites?propertyId=${propertyId}`, userHeaders(userId));
  return data?.success === true;
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
export async function getSettings(): Promise<{ areas: string[]; landmarks: string[] }> {
  const data = await get(`${API_BASE}/settings`);
  return { areas: data?.data?.areas ?? [], landmarks: data?.data?.landmarks ?? [] };
}
