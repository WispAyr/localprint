import { useEffect, useState, useCallback } from "react";
import { adminApi, type AdminUser } from "./adminApi";

function UserEditModal({ user, onClose, onSave }: { user: AdminUser; onClose: () => void; onSave: () => void }) {
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);
  const [plan, setPlan] = useState(user.plan);
  const [maxDesigns, setMaxDesigns] = useState(String(user.max_designs));
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateUser(user.id, { role, status, plan, max_designs: parseInt(maxDesigns) || 10 });
      if (newPassword) await adminApi.resetPassword(user.id, newPassword);
      setMsg("Saved!");
      setTimeout(() => { onSave(); onClose(); }, 500);
    } catch { setMsg("Error saving"); }
    setSaving(false);
  };

  const handleImpersonate = async () => {
    await adminApi.impersonate(user.id);
    window.location.href = "/";
  };

  const handleDelete = async () => {
    if (!confirm("Soft-delete this user?")) return;
    await adminApi.deleteUser(user.id);
    onSave();
    onClose();
  };

  return (
    <div className="lp-modal-backdrop" onClick={onClose}>
      <div className="lp-modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        <button className="lp-modal-close" onClick={onClose}>×</button>
        <h2 className="lp-modal-title">{user.email}</h2>
        <p style={{ color: "#888", fontSize: 13, margin: "0 0 16px" }}>{user.business_name || "No business name"} · Created {new Date(user.created_at).toLocaleDateString()}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <label className="lp-field"><span>Role</span>
            <select className="lp-input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option><option value="admin">Admin</option><option value="superadmin">Superadmin</option>
            </select>
          </label>
          <label className="lp-field"><span>Status</span>
            <select className="lp-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option><option value="suspended">Suspended</option><option value="deleted">Deleted</option>
            </select>
          </label>
          <label className="lp-field"><span>Plan</span>
            <select className="lp-input" value={plan} onChange={(e) => setPlan(e.target.value)}>
              <option value="free">Free</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
            </select>
          </label>
          <label className="lp-field"><span>Max Designs</span>
            <input className="lp-input" type="number" value={maxDesigns} onChange={(e) => setMaxDesigns(e.target.value)} />
          </label>
        </div>

        <label className="lp-field"><span>New Password (leave blank to keep)</span>
          <input className="lp-input" type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••" />
        </label>

        {msg && <p style={{ color: msg === "Saved!" ? "#6bd8a0" : "#ef4444", fontSize: 13 }}>{msg}</p>}

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="lp-btn lp-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button className="lp-btn lp-btn-outline" onClick={handleImpersonate}>Impersonate</button>
          <button className="lp-btn lp-btn-outline lp-text-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  const load = useCallback(() => {
    const params: Record<string, string> = { page: String(page), limit: "30" };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.status = statusFilter;
    if (planFilter) params.plan = planFilter;
    adminApi.users(params).then((data) => { setUsers(data.users); setTotal(data.total); });
  }, [page, search, roleFilter, statusFilter, planFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / 30);

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Users <span className="admin-count">({total})</span></h1>

      <div className="admin-filters">
        <input className="lp-input lp-input-sm" placeholder="Search email or business..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 260, marginBottom: 0 }} />
        <select className="lp-input lp-input-sm" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} style={{ maxWidth: 130, marginBottom: 0 }}>
          <option value="">All Roles</option><option value="user">User</option><option value="admin">Admin</option><option value="superadmin">Superadmin</option>
        </select>
        <select className="lp-input lp-input-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ maxWidth: 130, marginBottom: 0 }}>
          <option value="">All Status</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="deleted">Deleted</option>
        </select>
        <select className="lp-input lp-input-sm" value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }} style={{ maxWidth: 130, marginBottom: 0 }}>
          <option value="">All Plans</option><option value="free">Free</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th><th>Business</th><th>Role</th><th>Plan</th><th>Status</th><th>Designs</th><th>Last Login</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} onClick={() => setEditUser(u)} className="admin-table-clickable">
                <td>{u.email}</td>
                <td>{u.business_name || "—"}</td>
                <td><span className={`admin-badge-${u.role}`}>{u.role}</span></td>
                <td>{u.plan}</td>
                <td><span className={`admin-status-${u.status}`}>{u.status}</span></td>
                <td>{u.designs_count}</td>
                <td>{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : "Never"}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button className="lp-btn lp-btn-sm lp-btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
          <span className="admin-page-info">Page {page} of {totalPages}</span>
          <button className="lp-btn lp-btn-sm lp-btn-outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}

      {editUser && <UserEditModal user={editUser} onClose={() => setEditUser(null)} onSave={load} />}
    </div>
  );
}
