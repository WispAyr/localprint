import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { authMiddleware } from "./auth";
import authRoutes from "./routes/auth";
import designRoutes from "./routes/designs";
import brandRoutes from "./routes/brand";
import uploadRoutes from "./routes/upload";
import adminRoutes from "./routes/admin";

const app = new Hono();

// Auth middleware on all /api routes
app.use("/api/*", authMiddleware);

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/designs", designRoutes);
app.route("/api/brand", brandRoutes);
app.route("/api/brand", uploadRoutes);
app.route("/api/admin", adminRoutes);

// Serve uploaded files
app.use("/uploads/*", serveStatic({ root: "/root/localprint/" }));

// Health check
app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));

const port = 3970;
console.log("LocalPrint API listening on port " + port);
serve({ fetch: app.fetch, port });
