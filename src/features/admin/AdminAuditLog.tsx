import { useEffect, useState, useCallback } from "react";
import { adminApi, type AuditEntry } from "./adminApi";

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");

  const load = useCallback(() => {
    const params: Record<string, string> = { page: String(page), limit: "50" };
    if (actionFilter) params.action = actionFilter;
    adminApi.auditLog(params).then((d) => { setLogs(d.logs); setTotal(d.total); });
  }, [page, actionFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Audit Log <span className="admin-count">({total})</span></h1>

      <div className="admin-filters">
        <select className="lp-input lp-input-sm" value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} style={{ maxWidth: 200, marginBottom: 0 }}>
          <option value="">All Actions</option>
          <option value="user.update">user.update</option>
          <option value="user.delete">user.delete</option>
          <option value="user.reset_password">user.reset_password</option>
          <option value="user.impersonate">user.impersonate</option>
          <option value="org.create">org.create</option>
          <option value="org.update">org.update</option>
          <option value="org.delete">org.delete</option>
          <option value="design.delete">design.delete</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Target</th><th>IP</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.created_at).toLocaleString()}</td>
                <td>{l.user_email || l.user_id?.slice(0, 8)}</td>
                <td><code className="admin-action-code">{l.action}</code></td>
                <td>{l.target_type ? `${l.target_type}:${l.target_id?.slice(0, 8)}` : "—"}</td>
                <td>{l.ip_address}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "#666", padding: 32 }}>No audit entries</td></tr>}
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
    </div>
  );
}
