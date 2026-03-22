export interface AuthUser {
  id: string;
  email: string;
  business_name: string | null;
}

export interface BrandProfile {
  id: string;
  user_id: string;
  logo_path: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  business_name: string | null;
  tagline: string | null;
  address: string | null;
  website: string | null;
}

export interface DesignSummary {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DesignFull extends DesignSummary {
  state: Record<string, unknown>;
  user_id: string;
}

export async function loginWithPassword(email: string, password: string): Promise<{ ok: boolean; user?: AuthUser; error?: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function registerAccount(email: string, password: string, businessName: string): Promise<{ ok: boolean; user?: AuthUser; error?: string }> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, businessName }),
  });
  return res.json();
}

export async function fetchMe(): Promise<{ user: AuthUser; brand: BrandProfile | null } | null> {
  const res = await fetch("/api/auth/me");
  if (!res.ok) return null;
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function fetchDesigns(): Promise<DesignSummary[]> {
  const res = await fetch("/api/designs");
  if (!res.ok) return [];
  const data = await res.json();
  return data.designs || data || [];
}

export async function fetchDesign(id: string): Promise<DesignFull | null> {
  const res = await fetch("/api/designs/" + id);
  if (!res.ok) return null;
  return res.json();
}

export async function saveDesign(id: string, data: { name?: string; description?: string; state?: Record<string, unknown>; thumbnail?: string }): Promise<{ ok: boolean }> {
  const res = await fetch("/api/designs/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createDesign(data: { name: string; description?: string; state: Record<string, unknown> }): Promise<{ ok: boolean; design?: DesignFull; error?: string }> {
  const res = await fetch("/api/designs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteDesign(id: string): Promise<{ ok: boolean }> {
  const res = await fetch("/api/designs/" + id, { method: "DELETE" });
  return res.json();
}

export async function duplicateDesign(id: string): Promise<{ ok: boolean; design?: DesignFull }> {
  const res = await fetch("/api/designs/" + id + "/duplicate", { method: "POST" });
  return res.json();
}

// Keep old export name for compatibility
export const loginWithEmail = loginWithPassword;

export async function updateBrand(data: Partial<BrandProfile>): Promise<{ ok: boolean }> {
  const res = await fetch("/api/brand", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function uploadLogo(file: File): Promise<{ ok: boolean; path?: string }> {
  const form = new FormData();
  form.append("logo", file);
  const res = await fetch("/api/brand/logo", { method: "POST", body: form });
  return res.json();
}

export async function updateDesign(id: string, data: { name?: string; description?: string; state?: Record<string, unknown>; thumbnail?: string }): Promise<{ ok: boolean }> {
  return saveDesign(id, data);
}
