import { Context, Next } from "hono";
import pool from "./db";

export interface AuthUser {
  id: string;
  email: string;
  business_name: string | null;
}

export async function authMiddleware(c: Context, next: Next) {
  const cookies = c.req.header("cookie") || "";
  const match = cookies.match(/session=([^;]+)/);
  if (!match) {
    c.set("user", null);
    return next();
  }

  const token = match[1];
  const result = await pool.query(
    "SELECT u.id, u.email, u.business_name FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = $1 AND s.expires_at > NOW()",
    [token]
  );

  if (result.rows.length === 0) {
    c.set("user", null);
    return next();
  }

  c.set("user", result.rows[0] as AuthUser);
  return next();
}

export function requireAuth(c: Context): AuthUser | null {
  const user = c.get("user") as AuthUser | null;
  if (!user) {
    return null;
  }
  return user;
}
