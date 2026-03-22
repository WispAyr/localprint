export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalDesigns: number;
  activeSessions24h: number;
  signupsLast30Days: { day: string; count: number }[];
}

export interface AdminUser {
  id: string;
  email: string;
  business_name: string | null;
  role: string;
  status: string;
  plan: string;
  max_designs: number;
  org_id: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  designs_count: number;
  brand?: any;
}

export interface AdminOrg {
  id: string;
  name: string;
  slug: string | null;
  owner_id: string | null;
  owner_email?: string;
  plan: string;
  max_users: number;
  max_designs: number;
  members_count?: number;
  designs_count?: number;
  created_at: string;
}

export interface AuditEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  ip_address: string;
  created_at: string;
}

export interface AdminDesign {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  is_public: boolean;
  user_id: string;
  user_email: string;
  created_at: string;
  updated_at: string;
}

async function adminFetch(path: string, opts?: RequestInit) {
  const res = await fetch("/api/admin" + path, opts);
  if (res.status === 403) throw new Error("Forbidden");
  return res.json();
}

export const adminApi = {
  stats: (): Promise<AdminStats> => adminFetch("/stats"),

  users: (params?: Record<string, string>): Promise<{ users: AdminUser[]; total: number; page: number }> => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return adminFetch("/users" + qs);
  },

  user: (id: string): Promise<{ user: AdminUser }> => adminFetch("/users/" + id),

  updateUser: (id: string, data: any): Promise<any> =>
    adminFetch("/users/" + id, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),

  deleteUser: (id: string): Promise<any> =>
    adminFetch("/users/" + id, { method: "DELETE" }),

  resetPassword: (id: string, password: string): Promise<any> =>
    adminFetch("/users/" + id + "/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }),

  impersonate: (id: string): Promise<any> =>
    adminFetch("/users/" + id + "/impersonate", { method: "POST" }),

  orgs: (): Promise<{ orgs: AdminOrg[] }> => adminFetch("/orgs"),

  createOrg: (data: any): Promise<any> =>
    adminFetch("/orgs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),

  org: (id: string): Promise<any> => adminFetch("/orgs/" + id),

  updateOrg: (id: string, data: any): Promise<any> =>
    adminFetch("/orgs/" + id, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),

  deleteOrg: (id: string): Promise<any> =>
    adminFetch("/orgs/" + id, { method: "DELETE" }),

  addUserToOrg: (orgId: string, userId: string): Promise<any> =>
    adminFetch("/orgs/" + orgId + "/add-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId }) }),

  removeUserFromOrg: (orgId: string, userId: string): Promise<any> =>
    adminFetch("/orgs/" + orgId + "/remove-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId }) }),

  designs: (params?: Record<string, string>): Promise<{ designs: AdminDesign[]; total: number; page: number }> => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return adminFetch("/designs" + qs);
  },

  deleteDesign: (id: string): Promise<any> =>
    adminFetch("/designs/" + id, { method: "DELETE" }),

  auditLog: (params?: Record<string, string>): Promise<{ logs: AuditEntry[]; total: number; page: number }> => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return adminFetch("/audit-log" + qs);
  },
};
