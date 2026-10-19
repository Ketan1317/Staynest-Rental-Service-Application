export const API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  "http://localhost:5000";

const TOKEN_KEY = "staynest_token";
const USER_KEY = "staynest_user";

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const userStore = {
  get(): StoredUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  set(user: StoredUser) {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};

export type StoredUser = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: "OWNER" | "USER";
  profileImage?: string;
};

export class ApiError extends Error {
  status: number;
  payload: any;
  constructor(message: string, status: number, payload: any) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  formData?: FormData;
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
};

export async function api<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, formData, auth = false, query } = opts;

  let url = `${API_BASE}${path}`;
  if (query) {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    });
    const s = qs.toString();
    if (s) url += `?${s}`;
  }

  const headers: Record<string, string> = {};
  if (!formData && body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = tokenStore.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: formData ? formData : body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }
  return data as T;
}

// ---------- Endpoints ----------
export const AuthAPI = {
  register: (formData: FormData) =>
    api<{ token: string; user?: StoredUser; profileImage?: string; success?: boolean }>(
      "/api/user/register",
      { method: "POST", formData }
    ),
  login: (email: string, password: string) =>
    api<{ token: string; user?: StoredUser; success?: boolean }>("/api/user/login", {
      method: "POST",
      body: { email, password },
    }),
};

export type Property = {
  _id: string;
  title: string;
  description: string;
  propertyType: "PG" | "ROOM" | "FLAT";
  address: string;
  city: string;
  rent: number;
  deposit?: number;
  sharingType?: string;
  genderPreference?: string;
  amenities?: string[];
  rules?: string[];
  images: string[];
  ownerId: string | { _id: string; name?: string; email?: string; phone?: string };
  createdAt?: string;
};

export const PropertyAPI = {
  getAll: () => api<{ data?: Property[]; properties?: Property[]; success?: boolean } | Property[]>(
    "/api/property/getAllProperties"
  ),
  search: (q: { city?: string; minRent?: number; maxRent?: number; type?: string }) =>
    api<{ data?: Property[]; properties?: Property[]; count?: number } | Property[]>(
      "/api/property/search",
      { query: q as any }
    ),
  getMine: () => api<any>("/api/property/getPropertiesOfOwner", { auth: true }),
  create: (formData: FormData) =>
    api<any>("/api/property/create", { method: "POST", formData, auth: true }),
  remove: (propertyId: string) =>
    api<any>(`/api/property/delete/${propertyId}`, { method: "POST", auth: true }),
  addFav: (propertyId: string) =>
    api<any>(`/api/property/addToFav/${propertyId}`, { method: "POST", auth: true }),
  delFav: (propertyId: string) =>
    api<any>(`/api/property/delFromFav/${propertyId}`, { method: "POST", auth: true }),
  getFavs: () => api<any>("/api/property/getFavorites", { auth: true }),
};

export const ReviewAPI = {
  upsert: (propertyId: string, rating: number, comment?: string) =>
    api<any>("/api/property/reviews/create", {
      method: "POST",
      body: { propertyId, rating, comment },
      auth: true,
    }),
  remove: (propertyId: string) =>
    api<any>(`/api/property/reviews/delete/${propertyId}`, {
      method: "POST",
      body: { propertyId },
      auth: true,
    }),
};

export type Enquiry = {
  _id: string;
  propertyId: any;
  userId: string;
  ownerId: string;
  status: "PENDING" | "RESPONDED" | "CLOSED";
  isDeleted?: boolean;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: { user: number; owner: number };
};

export type EnquiryMessage = {
  _id: string;
  enquiryId: string;
  senderId: string;
  senderRole: "USER" | "OWNER";
  message: string;
  createdAt: string;
};

export const EnquiryAPI = {
  create: (propertyId: string) =>
    api<any>("/api/enquiry/create", { method: "POST", body: { propertyId }, auth: true }),
  send: (enquiryId: string, message: string) =>
    api<any>(`/api/enquiry/message/${enquiryId}`, {
      method: "POST",
      body: { message },
      auth: true,
    }),
  messages: (enquiryId: string) =>
    api<any>(`/api/enquiry/messages/${enquiryId}`, { auth: true }),
  user: () => api<any>("/api/enquiry/user", { auth: true }),
  owner: () => api<any>("/api/enquiry/owner", { auth: true }),
  close: (enquiryId: string) =>
    api<any>(`/api/enquiry/close/${enquiryId}`, { method: "POST", auth: true }),
  remove: (enquiryId: string) =>
    api<any>(`/api/enquiry/delete/${enquiryId}`, { method: "POST", auth: true }),
};

export const NotificationAPI = {
  list: () => api<any>("/api/notifications/", { auth: true }),
  unread: () => api<{ unreadCount: number } | any>("/api/notifications/unread-count", { auth: true }),
  read: (id: string) => api<any>(`/api/notifications/${id}/read`, { method: "POST", auth: true }),
  readAll: () => api<any>("/api/notifications/mark-all-read", { method: "POST", auth: true }),
};

// Helpers — backend returns various shapes. Normalize to array.
export function unwrapList<T = any>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.properties)) return res.properties;
  if (Array.isArray(res?.enquiries)) return res.enquiries;
  if (Array.isArray(res?.notifications)) return res.notifications;
  if (Array.isArray(res?.messages)) return res.messages;
  if (Array.isArray(res?.favorites)) return res.favorites;
  return [];
}
