import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import pool from "../db";
import { requireAuth, type AuthUser } from "../auth";

const admin = new Hono();

// Admin middleware
async function requireAdmin(c: any): Promise<AuthUser | null> {
  const user = requireAuth(c);
  if (!user) {
    return null;
  }
  const result = await pool.query("SELECT role FROM users WHERE id = $1", [user.id]);
  if (result.rows.length === 0 || !["admin", "superadmin"].includes(result.rows[0].role)) {
    return null;
  }
  return user;
}

async function auditLog(userId: string, action: string, targetType: string | null, targetId: string | null, details: any, ip: string) {
  await pool.query(
    "INSERT INTO audit_log (user_id, action, target_type, target_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)",
    [userId, action, targetType, targetId, details ? JSON.stringify(details) : null, ip]
  );
}

function getIp(c: any): string {
  return c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || c.req.header("x-real-ip") || "unknown";
}

// ── Stats ──
admin.get("/stats", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const [users, designs, sessions, signups] = await Promise.all([
    pool.query("SELECT count(*) as total, count(*) FILTER (WHERE status = 'active') as active FROM users"),
    pool.query("SELECT count(*) as total FROM designs"),
    pool.query("SELECT count(*) as total FROM sessions WHERE expires_at > NOW() AND created_at > NOW() - interval '24 hours'"),
    pool.query(`
      SELECT date_trunc('day', created_at)::date as day, count(*) as count
      FROM users WHERE created_at > NOW() - interval '30 days'
      GROUP BY 1 ORDER BY 1
    `),
  ]);

  return c.json({
    totalUsers: parseInt(users.rows[0].total),
    activeUsers: parseInt(users.rows[0].active),
    totalDesigns: parseInt(designs.rows[0].total),
    activeSessions24h: parseInt(sessions.rows[0].total),
    signupsLast30Days: signups.rows.map((r: any) => ({ day: r.day, count: parseInt(r.count) })),
  });
});

// ── Audit Log ──
admin.get("/audit-log", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const page = parseInt(c.req.query("page") || "1");
  const limit = Math.min(parseInt(c.req.query("limit") || "50"), 100);
  const offset = (page - 1) * limit;
  const action = c.req.query("action") || null;
  const userId = c.req.query("user_id") || null;

  let where = "WHERE 1=1";
  const params: any[] = [];
  let pi = 0;
  if (action) { params.push(action); where += ` AND a.action = $${++pi}`; }
  if (userId) { params.push(userId); where += ` AND a.user_id = $${++pi}`; }

  const countResult = await pool.query(`SELECT count(*) FROM audit_log a ${where}`, params);
  const total = parseInt(countResult.rows[0].count);

  params.push(limit, offset);
  const result = await pool.query(
    `SELECT a.*, u.email as user_email FROM audit_log a LEFT JOIN users u ON a.user_id = u.id ${where} ORDER BY a.created_at DESC LIMIT $${++pi} OFFSET $${++pi}`,
    params
  );

  return c.json({ logs: result.rows, total, page, limit });
});

// ── Users ──
admin.get("/users", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const page = parseInt(c.req.query("page") || "1");
  const limit = Math.min(parseInt(c.req.query("limit") || "50"), 100);
  const offset = (page - 1) * limit;
  const search = c.req.query("search") || null;
  const role = c.req.query("role") || null;
  const status = c.req.query("status") || null;
  const plan = c.req.query("plan") || null;

  let where = "WHERE 1=1";
  const params: any[] = [];
  let pi = 0;
  if (search) { params.push(`%${search}%`); where += ` AND (u.email ILIKE $${++pi} OR u.business_name ILIKE $${pi})`; }
  if (role) { params.push(role); where += ` AND u.role = $${++pi}`; }
  if (status) { params.push(status); where += ` AND u.status = $${++pi}`; }
  if (plan) { params.push(plan); where += ` AND u.plan = $${++pi}`; }

  const countResult = await pool.query(`SELECT count(*) FROM users u ${where}`, params);
  const total = parseInt(countResult.rows[0].count);

  params.push(limit, offset);
  const result = await pool.query(
    `SELECT u.id, u.email, u.business_name, u.role, u.status, u.plan, u.max_designs, u.org_id, u.last_login_at, u.created_at, u.updated_at,
      (SELECT count(*) FROM designs d WHERE d.user_id = u.id) as designs_count
     FROM users u ${where} ORDER BY u.created_at DESC LIMIT $${++pi} OFFSET $${++pi}`,
    params
  );

  return c.json({ users: result.rows, total, page, limit });
});

admin.get("/users/:id", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param("id");
  const result = await pool.query(
    `SELECT u.*, (SELECT count(*) FROM designs d WHERE d.user_id = u.id) as designs_count,
      (SELECT row_to_json(bp) FROM brand_profiles bp WHERE bp.user_id = u.id) as brand
     FROM users u WHERE u.id = $1`,
    [id]
  );
  if (result.rows.length === 0) return c.json({ error: "Not found" }, 404);

  const user = result.rows[0];
  delete user.password_hash;
  return c.json({ user });
});

admin.put("/users/:id", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param("id");
  const body = await c.req.json();
  const { role, status, plan, max_designs, org_id } = body;

  const result = await pool.query(
    `UPDATE users SET
      role = COALESCE($2, role),
      status = COALESCE($3, status),
      plan = COALESCE($4, plan),
      max_designs = COALESCE($5, max_designs),
      org_id = COALESCE($6, org_id),
      updated_at = NOW()
     WHERE id = $1 RETURNING id, email, role, status, plan, max_designs, org_id`,
    [id, role || null, status || null, plan || null, max_designs || null, org_id || null]
  );
  if (result.rows.length === 0) return c.json({ error: "Not found" }, 404);

  await auditLog(me.id, "user.update", "user", id, body, getIp(c));
  return c.json({ user: result.rows[0] });
});

admin.delete("/users/:id", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param("id");
  await pool.query("UPDATE users SET status = 'deleted', updated_at = NOW() WHERE id = $1", [id]);
  await auditLog(me.id, "user.delete", "user", id, null, getIp(c));
  return c.json({ ok: true });
});

admin.post("/users/:id/reset-password", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param("id");
  const body = await c.req.json();
  const { password } = body;
  if (!password || password.length < 6) return c.json({ error: "Password must be at least 6 chars" }, 400);

  const hash = await bcrypt.hash(password, 10);
  await pool.query("UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1", [id, hash]);
  await auditLog(me.id, "user.reset_password", "user", id, null, getIp(c));
  return c.json({ ok: true });
});

admin.post("/users/:id/impersonate", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param("id");
  const sessionToken = nanoid(48);
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  await pool.query("INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)", [id, sessionToken, expiresAt]);
  await auditLog(me.id, "user.impersonate", "user", id, null, getIp(c));

  const isSecure = c.req.header("x-forwarded-proto") === "https";
  c.header("Set-Cookie", `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=7200${isSecure ? "; Secure" : ""}`);
  return c.json({ ok: true });
});

// ── Organisations ──
admin.get("/orgs", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const result = await pool.query(
    `SELECT o.*, u.email as owner_email,
      (SELECT count(*) FROM users uu WHERE uu.org_id = o.id) as members_count,
      (SELECT count(*) FROM designs d JOIN users uu ON d.user_id = uu.id WHERE uu.org_id = o.id) as designs_count
     FROM organisations o LEFT JOIN users u ON o.owner_id = u.id ORDER BY o.created_at DESC`
  );
  return c.json({ orgs: result.rows });
});

admin.post("/orgs", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const body = await c.req.json();
  const { name, slug, owner_id, plan, max_users, max_designs } = body;
  if (!name) return c.json({ error: "Name required" }, 400);

  const result = await pool.query(
    `INSERT INTO organisations (name, slug, owner_id, plan, max_users, max_designs)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, slug || null, owner_id || null, plan || "free", max_users || 5, max_designs || 50]
  );
  await auditLog(me.id, "org.create", "org", result.rows[0].id, body, getIp(c));
  return c.json({ org: result.rows[0] }, 201);
});

admin.get("/orgs/:id", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param("id");
  const org = await pool.query("SELECT * FROM organisations WHERE id = $1", [id]);
  if (org.rows.length === 0) return c.json({ error: "Not found" }, 404);

  const members = await pool.query(
    "SELECT id, email, business_name, role, status FROM users WHERE org_id = $1",
    [id]
  );
  const designs = await pool.query(
    "SELECT d.id, d.name, d.user_id, u.email as user_email, d.created_at FROM designs d JOIN users u ON d.user_id = u.id WHERE u.org_id = $1 ORDER BY d.created_at DESC",
    [id]
  );

  return c.json({ org: org.rows[0], members: members.rows, designs: designs.rows });
});

admin.put("/orgs/:id", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, slug, plan, max_users, max_designs } = body;

  const result = await pool.query(
    `UPDATE organisations SET
      name = COALESCE($2, name), slug = COALESCE($3, slug),
      plan = COALESCE($4, plan), max_users = COALESCE($5, max_users),
      max_designs = COALESCE($6, max_designs), updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, name || null, slug || null, plan || null, max_users || null, max_designs || null]
  );
  if (result.rows.length === 0) return c.json({ error: "Not found" }, 404);
  await auditLog(me.id, "org.update", "org", id, body, getIp(c));
  return c.json({ org: result.rows[0] });
});

admin.delete("/orgs/:id", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param("id");
  await pool.query("UPDATE users SET org_id = NULL WHERE org_id = $1", [id]);
  await pool.query("DELETE FROM organisations WHERE id = $1", [id]);
  await auditLog(me.id, "org.delete", "org", id, null, getIp(c));
  return c.json({ ok: true });
});

admin.post("/orgs/:id/add-user", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param("id");
  const { user_id } = await c.req.json();
  if (!user_id) return c.json({ error: "user_id required" }, 400);

  await pool.query("UPDATE users SET org_id = $2 WHERE id = $1", [user_id, id]);
  await auditLog(me.id, "org.add_user", "org", id, { user_id }, getIp(c));
  return c.json({ ok: true });
});

admin.post("/orgs/:id/remove-user", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param("id");
  const { user_id } = await c.req.json();
  if (!user_id) return c.json({ error: "user_id required" }, 400);

  await pool.query("UPDATE users SET org_id = NULL WHERE id = $1 AND org_id = $2", [user_id, id]);
  await auditLog(me.id, "org.remove_user", "org", id, { user_id }, getIp(c));
  return c.json({ ok: true });
});

// ── Designs ──
admin.get("/designs", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const page = parseInt(c.req.query("page") || "1");
  const limit = Math.min(parseInt(c.req.query("limit") || "50"), 100);
  const offset = (page - 1) * limit;
  const search = c.req.query("search") || null;
  const userId = c.req.query("user_id") || null;

  let where = "WHERE 1=1";
  const params: any[] = [];
  let pi = 0;
  if (search) { params.push(`%${search}%`); where += ` AND d.name ILIKE $${++pi}`; }
  if (userId) { params.push(userId); where += ` AND d.user_id = $${++pi}`; }

  const countResult = await pool.query(`SELECT count(*) FROM designs d ${where}`, params);
  const total = parseInt(countResult.rows[0].count);

  params.push(limit, offset);
  const result = await pool.query(
    `SELECT d.id, d.name, d.description, d.thumbnail, d.is_public, d.created_at, d.updated_at, d.user_id, u.email as user_email
     FROM designs d LEFT JOIN users u ON d.user_id = u.id ${where} ORDER BY d.updated_at DESC LIMIT $${++pi} OFFSET $${++pi}`,
    params
  );

  return c.json({ designs: result.rows, total, page, limit });
});

admin.get("/designs/:id", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const result = await pool.query(
    "SELECT d.*, u.email as user_email FROM designs d LEFT JOIN users u ON d.user_id = u.id WHERE d.id = $1",
    [c.req.param("id")]
  );
  if (result.rows.length === 0) return c.json({ error: "Not found" }, 404);
  return c.json({ design: result.rows[0] });
});

admin.delete("/designs/:id", async (c) => {
  const me = await requireAdmin(c);
  if (!me) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param("id");
  await pool.query("DELETE FROM designs WHERE id = $1", [id]);
  await auditLog(me.id, "design.delete", "design", id, null, getIp(c));
  return c.json({ ok: true });
});

export default admin;
