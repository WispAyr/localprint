import { Hono } from "hono";
import pool from "../db";
import { requireAuth } from "../auth";

const brand = new Hono();

// GET /api/brand
brand.get("/", async (c) => {
  const user = requireAuth(c);
  if (!user) return c.json({ error: "Not authenticated" }, 401);

  const result = await pool.query("SELECT * FROM brand_profiles WHERE user_id = $1", [user.id]);
  return c.json({ brand: result.rows[0] || null });
});

// PUT /api/brand
brand.put("/", async (c) => {
  const user = requireAuth(c);
  if (!user) return c.json({ error: "Not authenticated" }, 401);

  const body = await c.req.json();
  const { business_name, primary_color, secondary_color, accent_color, tagline, address, website } = body;

  const existing = await pool.query("SELECT id FROM brand_profiles WHERE user_id = $1", [user.id]);
  
  if (existing.rows.length === 0) {
    const result = await pool.query(
      "INSERT INTO brand_profiles (user_id, business_name, primary_color, secondary_color, accent_color, tagline, address, website) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [user.id, business_name, primary_color, secondary_color, accent_color, tagline, address, website]
    );
    return c.json({ brand: result.rows[0] });
  } else {
    const result = await pool.query(
      "UPDATE brand_profiles SET business_name = COALESCE($2, business_name), primary_color = COALESCE($3, primary_color), secondary_color = COALESCE($4, secondary_color), accent_color = COALESCE($5, accent_color), tagline = COALESCE($6, tagline), address = COALESCE($7, address), website = COALESCE($8, website), updated_at = NOW() WHERE user_id = $1 RETURNING *",
      [user.id, business_name, primary_color, secondary_color, accent_color, tagline, address, website]
    );
    return c.json({ brand: result.rows[0] });
  }
});

export default brand;
