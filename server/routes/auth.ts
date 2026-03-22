import { Hono } from "hono";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import pool from "../db";
import { requireAuth } from "../auth";

const auth = new Hono();

// POST /api/auth/login — email + password
auth.post("/login", async (c) => {
  const body = await c.req.json();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  if (!email || !email.includes("@")) {
    return c.json({ error: "Valid email required" }, 400);
  }
  if (!password) {
    return c.json({ error: "Password required" }, 400);
  }

  const userResult = await pool.query(
    "SELECT id, email, business_name, password_hash FROM users WHERE email = $1",
    [email]
  );

  if (userResult.rows.length === 0) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const user = userResult.rows[0];
  if (!user.password_hash) {
    return c.json({ error: "Account has no password set. Contact support." }, 401);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  // Create session (30 days)
  const sessionToken = nanoid(48);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await pool.query(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [user.id, sessionToken, expiresAt]
  );

  const isSecure = c.req.header("x-forwarded-proto") === "https";
  c.header(
    "Set-Cookie",
    "session=" + sessionToken + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" + (30 * 24 * 60 * 60) + (isSecure ? "; Secure" : "")
  );

  return c.json({
    ok: true,
    user: { id: user.id, email: user.email, business_name: user.business_name },
  });
});

// POST /api/auth/register — create account with password
auth.post("/register", async (c) => {
  const body = await c.req.json();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const businessName = (body.businessName || "").trim();

  if (!email || !email.includes("@")) {
    return c.json({ error: "Valid email required" }, 400);
  }
  if (password.length < 6) {
    return c.json({ error: "Password must be at least 6 characters" }, 400);
  }

  // Check if email exists
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    return c.json({ error: "An account with this email already exists" }, 409);
  }

  const hash = await bcrypt.hash(password, 10);
  const ins = await pool.query(
    "INSERT INTO users (email, password_hash, business_name) VALUES ($1, $2, $3) RETURNING id",
    [email, hash, businessName || null]
  );
  const userId = ins.rows[0].id;

  // Auto-login: create session
  const sessionToken = nanoid(48);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await pool.query(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [userId, sessionToken, expiresAt]
  );

  const isSecure = c.req.header("x-forwarded-proto") === "https";
  c.header(
    "Set-Cookie",
    "session=" + sessionToken + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" + (30 * 24 * 60 * 60) + (isSecure ? "; Secure" : "")
  );

  return c.json({
    ok: true,
    user: { id: userId, email, business_name: businessName || null },
  });
});

// GET /api/auth/me
auth.get("/me", async (c) => {
  const user = requireAuth(c);
  if (!user) return c.json({ error: "Not authenticated" }, 401);

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
