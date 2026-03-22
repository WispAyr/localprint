import { Hono } from "hono";
import { nanoid } from "nanoid";
import pool from "../db";
import { requireAuth } from "../auth";

const auth = new Hono();

// POST /api/auth/login — generate magic link
auth.post("/login", async (c) => {
  const body = await c.req.json();
  const email = (body.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return c.json({ error: "Valid email required" }, 400);
  }

  // Upsert user
  let userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  let userId: string;
  if (userResult.rows.length === 0) {
    const ins = await pool.query(
      "INSERT INTO users (email) VALUES ($1) RETURNING id",
      [email]
    );
    userId = ins.rows[0].id;
  } else {
    userId = userResult.rows[0].id;
  }

  // Generate magic link token
  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await pool.query(
    "INSERT INTO auth_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [userId, token, expiresAt]
  );

  // MVP: return the link directly instead of emailing
  const proto = c.req.header("x-forwarded-proto") || "https";
  const host = c.req.header("host") || "localprint.local-connect.uk";
  const magicLink = proto + "://" + host + "/auth/verify/" + token;

  return c.json({ ok: true, magicLink, message: "Magic link generated. In production this would be emailed." });
});

// GET /api/auth/verify/:token
auth.get("/verify/:token", async (c) => {
  const token = c.req.param("token");
  const result = await pool.query(
    "SELECT id, user_id FROM auth_tokens WHERE token = $1 AND expires_at > NOW() AND used = FALSE",
    [token]
  );

  if (result.rows.length === 0) {
    return c.json({ error: "Invalid or expired link" }, 400);
  }

  const { id: tokenId, user_id } = result.rows[0];

  // Mark token used
  await pool.query("UPDATE auth_tokens SET used = TRUE WHERE id = $1", [tokenId]);

  // Create session (30 days)
  const sessionToken = nanoid(48);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await pool.query(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [user_id, sessionToken, expiresAt]
  );

  // Set cookie and redirect
  const isSecure = c.req.header("x-forwarded-proto") === "https";
  c.header(
    "Set-Cookie",
    "session=" + sessionToken + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" + (30 * 24 * 60 * 60) + (isSecure ? "; Secure" : "")
  );

  return c.redirect("/dashboard");
});

// GET /api/auth/me
auth.get("/me", async (c) => {
  const user = requireAuth(c);
  if (!user) return c.json({ error: "Not authenticated" }, 401);

  // Also fetch brand profile
  const brand = await pool.query("SELECT * FROM brand_profiles WHERE user_id = $1", [user.id]);

  return c.json({
    user: { id: user.id, email: user.email, business_name: user.business_name },
    brand: brand.rows[0] || null,
  });
});

// POST /api/auth/logout
auth.post("/logout", async (c) => {
  const cookies = c.req.header("cookie") || "";
  const match = cookies.match(/session=([^;]+)/);
  if (match) {
    await pool.query("DELETE FROM sessions WHERE token = $1", [match[1]]);
  }
  c.header("Set-Cookie", "session=; Path=/; HttpOnly; Max-Age=0");
  return c.json({ ok: true });
});

export default auth;
