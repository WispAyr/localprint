import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { updateBrand, uploadLogo, type BrandProfile } from "@/features/auth/api";

export default function BrandPage() {
  const { user, brand, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    business_name: "",
    primary_color: "#1E3A5F",
    secondary_color: "#FFFFFF",
    accent_color: "#4A90D9",
    tagline: "",
    address: "",
    website: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoPath, setLogoPath] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
      return;
    }
    if (brand) {
      setForm({
        business_name: brand.business_name || "",
        primary_color: brand.primary_color || "#1E3A5F",
        secondary_color: brand.secondary_color || "#FFFFFF",
        accent_color: brand.accent_color || "#4A90D9",
        tagline: brand.tagline || "",
        address: brand.address || "",
        website: brand.website || "",
      });
      setLogoPath(brand.logo_path);
    }
  }, [user, brand, loading, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateBrand(form);
    await refresh();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = await uploadLogo(file);
    if (path) {
      setLogoPath(path);
      await refresh();
    }
  };

  if (loading) return <div className="lp-page-center"><p>Loading...</p></div>;

  return (
    <div className="lp-page">
      <div className="lp-page-header">
        <div>
          <h1 className="lp-page-title">Brand Profile</h1>
          <p className="lp-page-subtitle">Set your brand once, apply it to any design</p>
        </div>
        <button className="lp-btn lp-btn-outline" onClick={() => navigate("/dashboard")}>
          ← My Designs
        </button>
      </div>

      <form className="lp-brand-form" onSubmit={handleSave}>
        <div className="lp-brand-section">
          <h3>Logo</h3>
          <div className="lp-brand-logo-area">
            {logoPath ? (
              <img src={logoPath} alt="Logo" className="lp-brand-logo-preview" />
            ) : (
              <div className="lp-brand-logo-placeholder">No logo</div>
            )}
            <label className="lp-btn lp-btn-outline lp-btn-sm">
              Upload Logo
              <input type="file" accept="image/png,image/jpeg,image/svg+xml" hidden onChange={handleLogoUpload} />
            </label>
          </div>
        </div>

        <div className="lp-brand-section">
          <h3>Business Details</h3>
          <label className="lp-field">
            <span>Business Name</span>
            <input className="lp-input" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
          </label>
          <label className="lp-field">
            <span>Tagline</span>
            <input className="lp-input" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="e.g. Scotland's Favourite..." />
          </label>
          <label className="lp-field">
            <span>Address</span>
            <input className="lp-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <label className="lp-field">
            <span>Website</span>
            <input className="lp-input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
          </label>
        </div>

        <div className="lp-brand-section">
          <h3>Brand Colours</h3>
          <div className="lp-brand-colors">
            <label className="lp-color-field">
              <span>Primary</span>
              <div className="lp-color-input-wrap">
                <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
                <input className="lp-input lp-input-sm" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
              </div>
            </label>
            <label className="lp-color-field">
              <span>Secondary</span>
              <div className="lp-color-input-wrap">
                <input type="color" value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} />
                <input className="lp-input lp-input-sm" value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} />
              </div>
            </label>
            <label className="lp-color-field">
              <span>Accent</span>
              <div className="lp-color-input-wrap">
                <input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} />
                <input className="lp-input lp-input-sm" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} />
              </div>
            </label>
          </div>
        </div>

        <div className="lp-brand-actions">
          <button type="submit" className="lp-btn lp-btn-primary" disabled={saving}>
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Brand Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
