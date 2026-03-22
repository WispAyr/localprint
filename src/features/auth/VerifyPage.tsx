import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function VerifyPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    
    fetch("/api/auth/verify/" + token, { redirect: "manual" })
      .then(async (res) => {
        if (res.type === "opaqueredirect" || res.status === 302 || res.ok) {
          // Cookie should be set. Verify by fetching /api/auth/verify directly
          // Actually the redirect won't work with fetch. Let's just navigate there.
          window.location.href = "/api/auth/verify/" + token;
        } else {
          const data = await res.json();
          setError(data.error || "Invalid or expired link");
        }
      })
      .catch(() => setError("Network error"));
  }, [token]);

  if (error) {
    return (
      <div className="lp-page-center">
        <div className="lp-card" style={{ maxWidth: 400, textAlign: "center" }}>
          <h2>Link Expired</h2>
          <p>{error}</p>
          <button className="lp-btn lp-btn-primary" onClick={() => navigate("/")}>
            Back to Editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lp-page-center">
      <p>Signing you in...</p>
    </div>
  );
}
