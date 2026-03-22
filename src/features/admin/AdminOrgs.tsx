import { useEffect, useState } from "react";
import { adminApi, type AdminOrg } from "./adminApi";

function CreateOrgModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await adminApi.createOrg({ name, slug: slug || undefined });
    onCreated();
    onClose();
  };

  return (
    <div className="lp-modal-backdrop" onClick={onClose}>
      <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
        <button className="lp-modal-close" onClick={onClose}>×</button>
        <h2 className="lp-modal-title">Create Organisation</h2>
        <label className="lp-field"><span>Name</span><input className="lp-input" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="lp-field"><span>Slug</span><input className="lp-input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto" /></label>
        <button className="lp-btn lp-btn-primary" onClick={handleCreate} disabled={saving || !name.trim()}>{saving ? "Creating..." : "Create"}</button>
      </div>
    </div>
  );
}

export default function AdminOrgs() {
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => { adminApi.orgs().then((d) => setOrgs(d.orgs)); };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this organisation?")) return;
    await adminApi.deleteOrg(id);
    load();
  };

  return (
    <div className="admin-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Organisations <span className="admin-count">({orgs.length})</span></h1>
        <button className="lp-btn lp-btn-primary lp-btn-sm" onClick={() => setShowCreate(true)}>+ New Org</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Slug</th><th>Owner</th><th>Plan</th><th>Members</th><th>Designs</th><th>Created</th><th></th></tr></thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id}>
                <td>{o.name}</td>
                <td>{o.slug || "—"}</td>
                <td>{o.owner_email || "—"}</td>
                <td>{o.plan}</td>
                <td>{o.members_count ?? 0}</td>
                <td>{o.designs_count ?? 0}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td><button className="lp-btn lp-btn-sm lp-btn-outline lp-text-danger" onClick={() => handleDelete(o.id)}>Delete</button></td>
              </tr>
            ))}
            {orgs.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", color: "#666", padding: 32 }}>No organisations yet</td></tr>}
          </tbody>
        </table>
      </div>

      {showCreate && <CreateOrgModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}
