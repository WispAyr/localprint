import { useState } from "react";
import { loginWithPassword, registerAccount } from "./api";
import { useAuth } from "./AuthContext";

interface LoginModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { refresh } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = mode === "login"
        ? await loginWithPassword(email, password)
        : await registerAccount(email, password, businessName);

      if (result.ok) {
        await refresh();
        onSuccess?.();
        onClose();
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-modal-backdrop" onClick={onClose}>
      <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
        <button className="lp-modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="lp-modal-title">{mode === "login" ? "Sign In" : "Create Account"}</h2>
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              type="text"
              className="lp-input"
              placeholder="Business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              autoFocus
            />
          )}
          <input
            type="email"
            className="lp-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus={mode === "login"}
          />
          <input
            type="password"
            className="lp-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="lp-error">{error}</p>}
          <button type="submit" className="lp-btn lp-btn-primary" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
        <p className="lp-modal-switch">
          {mode === "login" ? (
            <>Don't have an account? <button type="button" className="lp-link-btn" onClick={() => { setMode("register"); setError(""); }}>Create one</button></>
          ) : (
            <>Already have an account? <button type="button" className="lp-link-btn" onClick={() => { setMode("login"); setError(""); }}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
