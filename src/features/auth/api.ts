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
  state: any;
  user_id: string;
}

export async function fetchMe(): Promise<{ user: AuthUser; brand: BrandProfile | null } | null> {
  const res = await fetch("/api/auth/me");
  if (!res.ok) return null;
  return res.json();
}

export async function loginWithEmail(email: string): Promise<{ ok: boolean; magicLink?: string; error?: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function fetchDesigns(): Promise<DesignSummary[]> {
  const res = await fetch("/api/designs");
  if (!res.ok) return [];
  const data = await res.json();
  return data.designs;
}

export async function fetchDesign(id: string): Promise<DesignFull | null> {
  const res = await fetch("/api/designs/" + id);
  if (!res.ok) return null;
  const data = await res.json();
  return data.design;
}

export async function createDesign(name: string, description: string, state: any, thumbnail?: string): Promise<DesignSummary | null> {
  const res = await fetch("/api/designs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, state, thumbnail }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.design;
}

export async function updateDesign(id: string, updates: { name?: string; description?: string; state?: any; thumbnail?: string }): Promise<DesignSummary | null> {
  const res = await fetch("/api/designs/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.design;
}

export async function deleteDesign(id: string): Promise<boolean> {
  const res = await fetch("/api/designs/" + id, { method: "DELETE" });
  return res.ok;
}

export async function duplicateDesign(id: string): Promise<DesignSummary | null> {
  const res = await fetch("/api/designs/" + id + "/duplicate", { method: "POST" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.design;
}

export async function updateBrand(brand: Partial<BrandProfile>): Promise<BrandProfile | null> {
  const res = await fetch("/api/brand", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(brand),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.brand;
}

export async function uploadLogo(file: File): Promise<string | null> {
  const form = new FormData();
  form.append("logo", file);
  const res = await fetch("/api/brand/logo", { method: "POST", body: form });
  if (!res.ok) return null;
  const data = await res.json();
  return data.logoPath;
}
