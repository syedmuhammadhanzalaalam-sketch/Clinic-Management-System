const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "doctor" | "patient";
  phone?: string;
};

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("clinic_token") || "";
}

export function setSession(token: string, user: User) {
  localStorage.setItem("clinic_token", token);
  localStorage.setItem("clinic_user", JSON.stringify(user));
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("clinic_user");
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem("clinic_token");
  localStorage.removeItem("clinic_user");
}

export async function api(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  // Always prefix /api so Next.js routes work correctly
  const fullPath = path.startsWith("/api") ? path : `/api${path}`;
  const url = `${API_URL}${fullPath}`;
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data;
}

export { API_URL };
