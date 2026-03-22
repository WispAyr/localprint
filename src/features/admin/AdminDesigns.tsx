import { useEffect, useState, useCallback } from "react";
import { adminApi, type AdminDesign } from "./adminApi";

export default function AdminDesigns() {
  const [designs, setDesigns] = useState<AdminDesign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    const params: Record<string, string> = { page: String(page), limit: "30" };
    if (search) params.search = search;
    adminApi.designs(params).then((d) => { setDesigns(d.designs); setTotal(d.total); });
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this design?")) return;
    await adminApi.deleteDesign(id);
    load();
  };

  const totalPages = Math.ceil(total / 30);

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Designs <span className="admin-count">({total})</span></h1>

      <div className="admin-filters">
        <input className="lp-input lp-input-sm" placeholder="Search by name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 260, marginBottom: 0 }} />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th style={{ width: 50 }}></th><th>Name</th><th>Owner</th><th>Public</th><th>Created</th><th>Updated</th><th></th></tr></thead>
          <tbody>
            {designs.map((d) => (
              <tr key={d.id}>
                <td>
                  {d.thumbnail ? (
                    <img src={d.thumbnail} alt="" className="admin-thumb" />
                  ) : (
                    <div className="admin-thumb-placeholder">🗺</div>
                  )}
                </td>
                <td>{d.name}</td>
                <td>{d.user_email}</td>
                <td>{d.is_public ? "✓" : "—"}</td>
                <td>{new Date(d.created_at).toLocaleDateString()}</td>
                <td>{new Date(d.updated_at).toLocaleDateString()}</td>
                <td><button className="lp-btn lp-btn-sm lp-btn-outline lp-text-danger" onClick={() => handleDelete(d.id)}>Delete</button></td>
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
    </div>
  );
}
