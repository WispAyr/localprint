import { useState } from "react";
import { loginWithEmail } from "./api";

interface LoginModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const result = await loginWithEmail(email);
      if (result.ok && result.magicLink) {
        setMagicLink(result.magicLink);
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch {
      setError("Network error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="lp-modal-backdrop" onClick={onClose}>
      <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
        <button className="lp-modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="lp-modal-title">Sign In</h2>
        {!magicLink ? (
          <form onSubmit={handleSubmit}>
            <p className="lp-modal-desc">Enter your email to receive a magic sign-in link. No password needed!</p>
            <input
              type="email"
              className="lp-input"
              placeholder="you@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            {error && <p className="lp-error">{error}</p>}
            <button type="submit" className="lp-btn lp-btn-primary" disabled={sending}>
              {sending ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        ) : (
          <div>
            <p className="lp-modal-desc">
              ✨ Magic link generated! In production this would be emailed. For now, click below:
            </p>
            <a href={magicLink} className="lp-btn lp-btn-primary" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
              Sign In Now
            </a>
            <p className="lp-modal-hint">Link expires in 15 minutes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
