import { Hono } from "hono";
import pool from "../db";
import { requireAuth } from "../auth";

const designs = new Hono();

// GET /api/designs — list user's designs
designs.get("/", async (c) => {
  const user = requireAuth(c);
  if (!user) return c.json({ error: "Not authenticated" }, 401);

  const result = await pool.query(
    "SELECT id, name, description, thumbnail, is_public, created_at, updated_at FROM designs WHERE user_id = $1 ORDER BY updated_at DESC",
    [user.id]
  );
  return c.json({ designs: result.rows });
});

// POST /api/designs — create design
designs.post("/", async (c) => {
  const user = requireAuth(c);
  if (!user) return c.json({ error: "Not authenticated" }, 401);

  const body = await c.req.json();
  const { name, description, state, thumbnail } = body;
  if (!name || !state) {
    return c.json({ error: "Name and state required" }, 400);
  }

  const result = await pool.query(
    "INSERT INTO designs (user_id, name, description, state, thumbnail) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, description, thumbnail, is_public, created_at, updated_at",
    [user.id, name, description || null, JSON.stringify(state), thumbnail || null]
  );
  return c.json({ design: result.rows[0] }, 201);
});

// GET /api/designs/:id — get full design
designs.get("/:id", async (c) => {
  const user = requireAuth(c);
  if (!user) return c.json({ error: "Not authenticated" }, 401);

  const result = await pool.query(
    "SELECT * FROM designs WHERE id = $1 AND user_id = $2",
    [c.req.param("id"), user.id]
  );
  if (result.rows.length === 0) return c.json({ error: "Not found" }, 404);
  return c.json({ design: result.rows[0] });
});

// PUT /api/designs/:id — update design
designs.put("/:id", async (c) => {
  const user = requireAuth(c);
  if (!user) return c.json({ error: "Not authenticated" }, 401);

  const body = await c.req.json();
  const { name, description, state, thumbnail } = body;

  const result = await pool.query(
    "UPDATE designs SET name = COALESCE($3, name), description = COALESCE($4, description), state = COALESCE($5, state), thumbnail = COALESCE($6, thumbnail), updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id, name, description, thumbnail, is_public, created_at, updated_at",
    [c.req.param("id"), user.id, name || null, description, state ? JSON.stringify(state) : null, thumbnail]
  );
  if (result.rows.length === 0) return c.json({ error: "Not found" }, 404);
  return c.json({ design: result.rows[0] });
});

// DELETE /api/designs/:id
designs.delete("/:id", async (c) => {
  const user = requireAuth(c);
  if (!user) return c.json({ error: "Not authenticated" }, 401);

  const result = await pool.query(
    "DELETE FROM designs WHERE id = $1 AND user_id = $2 RETURNING id",
    [c.req.param("id"), user.id]
  );
  if (result.rows.length === 0) return c.json({ error: "Not found" }, 404);
  return c.json({ ok: true });
});

// POST /api/designs/:id/duplicate
designs.post("/:id/duplicate", async (c) => {
  const user = requireAuth(c);
  if (!user) return c.json({ error: "Not authenticated" }, 401);

  const original = await pool.query(
    "SELECT * FROM designs WHERE id = $1 AND user_id = $2",
    [c.req.param("id"), user.id]
  );
  if (original.rows.length === 0) return c.json({ error: "Not found" }, 404);

  const d = original.rows[0];
  const result = await pool.query(
    "INSERT INTO designs (user_id, name, description, state, thumbnail) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, description, thumbnail, is_public, created_at, updated_at",
    [user.id, d.name + " (copy)", d.description, JSON.stringify(d.state), d.thumbnail]
  );
  return c.json({ design: result.rows[0] }, 201);
});

export default designs;
