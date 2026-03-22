import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { useEffect } from "react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: "📊", end: true },
  { to: "/admin/users", label: "Users", icon: "👥" },
  { to: "/admin/orgs", label: "Organisations", icon: "🏢" },
  { to: "/admin/designs", label: "Designs", icon: "🎨" },
  { to: "/admin/audit", label: "Audit Log", icon: "📋" },
];

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !["admin", "superadmin"].includes((user as any).role || ""))) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="lp-page-center"><p>Loading...</p></div>;
  if (!user || !["admin", "superadmin"].includes((user as any).role || "")) return null;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <NavLink to="/" className="admin-logo-link">← LocalPrint</NavLink>
          <span className="admin-badge">Admin</span>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-item${isActive ? " is-active" : ""}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
