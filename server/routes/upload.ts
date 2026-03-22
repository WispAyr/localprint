import { Hono } from "hono";
import pool from "../db";
import { requireAuth } from "../auth";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const upload = new Hono();
const UPLOAD_DIR = "/root/localprint/uploads/logos";
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];

// POST /api/brand/logo
upload.post("/logo", async (c) => {
  const user = requireAuth(c);
  if (!user) return c.json({ error: "Not authenticated" }, 401);

  const formData = await c.req.formData();
  const file = formData.get("logo") as File | null;
  if (!file) return c.json({ error: "No file uploaded" }, 400);

  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json({ error: "Only PNG, JPG, and SVG allowed" }, 400);
  }
  if (file.size > MAX_SIZE) {
    return c.json({ error: "File too large (max 2MB)" }, 400);
  }

  const userDir = join(UPLOAD_DIR, user.id);
  await mkdir(userDir, { recursive: true });

  const ext = file.name.split(".").pop() || "png";
  const filename = "logo." + ext;
  const filepath = join(userDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const logoPath = "/uploads/logos/" + user.id + "/" + filename;

  const existing = await pool.query("SELECT id FROM brand_profiles WHERE user_id = $1", [user.id]);
  if (existing.rows.length === 0) {
    await pool.query(
      "INSERT INTO brand_profiles (user_id, logo_path) VALUES ($1, $2)",
      [user.id, logoPath]
    );
  } else {
    await pool.query(
      "UPDATE brand_profiles SET logo_path = $2, updated_at = NOW() WHERE user_id = $1",
      [user.id, logoPath]
    );
  }

  return c.json({ logoPath });
});

export default upload;
