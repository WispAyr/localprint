import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { fetchDesigns, deleteDesign, duplicateDesign, type DesignSummary } from "@/features/auth/api";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<DesignSummary[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(true);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadingDesigns(true);
    const d = await fetchDesigns();
    setDesigns(d);
    setLoadingDesigns(false);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
      return;
    }
    if (user) load();
  }, [user, loading, navigate, load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this design?")) return;
    await deleteDesign(id);
    setDesigns((prev) => prev.filter((d) => d.id !== id));
    setMenuOpen(null);
  };

  const handleDuplicate = async (id: string) => {
    const dup = await duplicateDesign(id);
    if (dup) setDesigns((prev) => [dup, ...prev]);
    setMenuOpen(null);
  };

  const filtered = designs.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="lp-page-center"><p>Loading...</p></div>;

  return (
    <div className="lp-page">
      <div className="lp-page-header">
        <div>
          <h1 className="lp-page-title">My Designs</h1>
          <p className="lp-page-subtitle">{designs.length} design{designs.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="lp-page-actions">
          <input
            type="text"
            className="lp-input lp-input-sm"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="lp-btn lp-btn-primary" onClick={() => navigate("/")}>
            + New Design
          </button>
        </div>
      </div>

      {loadingDesigns ? (
        <div className="lp-page-center"><p>Loading designs...</p></div>
      ) : filtered.length === 0 ? (
        <div className="lp-empty-state">
          <p>No designs yet. Create your first map!</p>
          <button className="lp-btn lp-btn-primary" onClick={() => navigate("/")}>
            Create Design
          </button>
        </div>
      ) : (
        <div className="lp-design-grid">
          {filtered.map((d) => (
            <div key={d.id} className="lp-design-card" onClick={() => navigate("/?design=" + d.id)}>
              <div className="lp-design-thumb">
                {d.thumbnail ? (
                  <img src={d.thumbnail} alt={d.name} />
                ) : (
                  <div className="lp-design-thumb-placeholder">🗺️</div>
                )}
              </div>
              <div className="lp-design-info">
                <h3 className="lp-design-name">{d.name}</h3>
                <p className="lp-design-date">
                  {new Date(d.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="lp-design-menu-wrap">
                <button
                  className="lp-design-menu-btn"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === d.id ? null : d.id); }}
                  aria-label="Design options"
                >
                  ⋮
                </button>
                {menuOpen === d.id && (
                  <div className="lp-design-menu" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleDuplicate(d.id)}>Duplicate</button>
                    <button className="lp-text-danger" onClick={() => handleDelete(d.id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
