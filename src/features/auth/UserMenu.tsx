import { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

interface UserMenuProps {
  onLoginClick: () => void;
}

export default function UserMenu({ onLoginClick }: UserMenuProps) {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <button className="lp-btn lp-btn-outline lp-btn-sm" onClick={onLoginClick}>
        Sign In
      </button>
    );
  }

  const initials = (user.business_name || user.email)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  const isAdmin = user.role === "admin" || user.role === "superadmin";

  return (
    <div className="lp-user-menu" ref={ref}>
      <button className="lp-avatar" onClick={() => setOpen(!open)} title={user.email}>
        {initials}
      </button>
      {open && (
        <div className="lp-dropdown">
          <div className="lp-dropdown-header">
            <strong>{user.business_name || "My Account"}</strong>
            <span>{user.email}</span>
          </div>
          <button className="lp-dropdown-item" onClick={() => { setOpen(false); navigate("/dashboard"); }}>
            My Designs
          </button>
          <button className="lp-dropdown-item" onClick={() => { setOpen(false); navigate("/brand"); }}>
            Brand Profile
          </button>
          {isAdmin && (
            <>
              <hr className="lp-dropdown-sep" />
              <button className="lp-dropdown-item" onClick={() => { setOpen(false); navigate("/admin"); }}>
                ⚙️ Admin Panel
              </button>
            </>
          )}
          <hr className="lp-dropdown-sep" />
          <button className="lp-dropdown-item" onClick={() => { setOpen(false); navigate("/"); }}>
            Editor
          </button>
          <button className="lp-dropdown-item lp-text-danger" onClick={async () => { setOpen(false); await signOut(); navigate("/"); }}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
