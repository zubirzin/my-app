const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Configuration
// ============================================
const config = {
  db: {
    enabled: process.env.DATABASE_URL !== undefined && process.env.DATABASE_URL !== "",
    url: process.env.DATABASE_URL || "",
    // For local docker-compose without a driver, use DATABASE_HOST style
    host: process.env.DATABASE_HOST || "",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    user: process.env.DATABASE_USER || "",
    password: process.env.DATABASE_PASSWORD || "",
    name: process.env.DATABASE_NAME || "",
    ssl: process.env.DATABASE_SSL === "true",
  },
  nodeEnv: process.env.NODE_ENV || "development",
};

// In-memory fallback store (used when no database configured)
const memoryItems = [
  { id: 1, name: "Item 1", description: "Sample item 1" },
  { id: 2, name: "Item 2", description: "Sample item 2" },
  { id: 3, name: "Item 3", description: "Sample item 3" },
];

// ============================================
// Middleware
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });
  next();
});

// ============================================
// Health check
// ============================================
app.get("/health", async (req, res) => {
  const db = await checkDatabase();
  res.status(db.ok ? 200 : 200).json({
    status: db.ok ? "healthy" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    database: db,
  });
});

// ============================================
// API Routes
// ============================================
app.get("/api/status", (req, res) => {
  res.json({
    name: "my-app",
    version: "1.0.0",
    status: "running",
    environment: config.nodeEnv,
  });
});

app.get("/api/info", (req, res) => {
  res.json({
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  });
});

// ============================================
// Items CRUD
// ============================================
app.get("/api/items", async (req, res, next) => {
  try {
    const { limit, offset, archived } = req.query;
    let result = await getAllItems();

    if (archived !== undefined) {
      result = result.filter((i) => String(!!i.archived) === String(archived));
    }
    if (offset) result = result.slice(parseInt(offset));
    if (limit) result = result.slice(0, parseInt(limit));

    res.json({ total: result.length, count: result.length, data: result });
  } catch (err) {
    next(err);
  }
});

app.get("/api/items/:id", async (req, res, next) => {
  try {
    const item = await getItem(parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

app.post("/api/items", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const item = await createItem({ name, description: description || "" });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

app.put("/api/items/:id", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const updated = await updateItem(parseInt(req.params.id), { name, description });
    if (!updated) return res.status(404).json({ error: "Item not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/items/:id", async (req, res, next) => {
  try {
    const deleted = await deleteItem(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Item not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Static files
app.use(express.static("app"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/app/index.html");
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// ============================================
// Database Layer
// Uses pg when DATABASE_URL is set, otherwise falls back to in-memory
// ============================================
let pgPool = null;

async function initDatabase() {
  if (!config.db.enabled) {
    console.log("[db] No DATABASE_URL set — using in-memory store");
    return;
  }
  try {
    const { Pool } = require("pg");
    pgPool = new Pool({
      connectionString: config.db.url,
      host: config.db.host || undefined,
      port: config.db.port || undefined,
      user: config.db.user || undefined,
      password: config.db.password || undefined,
      database: config.db.name || undefined,
      ssl: config.db.ssl ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
    });

    // Test connection
    const client = await pgPool.connect();
    await client.query("SELECT 1");
    client.release();

    // Run schema
    const fs = require("fs");
    const path = require("path");
    const schemaPath = path.join(__dirname, "db", "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf8");
      await pgPool.query(schema);
      console.log("[db] Schema applied");
    }

    console.log("[db] Connected to PostgreSQL");
  } catch (err) {
    console.error("[db] Connection failed, falling back to in-memory:", err.message);
    pgPool = null;
  }
}

async function checkDatabase() {
  if (!config.db.enabled) {
    return { ok: true, mode: "in-memory", enabled: false };
  }
  if (!pgPool) {
    return { ok: false, mode: "in-memory", enabled: true, error: "Not connected" };
  }
  try {
    const result = await pgPool.query("SELECT NOW() as time");
    return { ok: true, mode: "postgresql", enabled: true, time: result.rows[0].time };
  } catch (err) {
    return { ok: false, mode: "postgresql", enabled: true, error: err.message };
  }
}

async function getAllItems() {
  if (!pgPool) return [...memoryItems];
  const result = await pgPool.query(
    "SELECT id, name, description, archived, created_at, updated_at FROM items ORDER BY id"
  );
  return result.rows;
}

async function getItem(id) {
  if (!pgPool) return memoryItems.find((i) => i.id === id) || null;
  const result = await pgPool.query(
    "SELECT id, name, description, archived, created_at, updated_at FROM items WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

async function createItem({ name, description }) {
  if (!pgPool) {
    const newItem = {
      id: memoryItems.length > 0 ? Math.max(...memoryItems.map((i) => i.id)) + 1 : 1,
      name,
      description,
    };
    memoryItems.push(newItem);
    return newItem;
  }
  const result = await pgPool.query(
    "INSERT INTO items (name, description) VALUES ($1, $2) RETURNING id, name, description, archived, created_at, updated_at",
    [name, description]
  );
  return result.rows[0];
}

async function updateItem(id, { name, description }) {
  if (!pgPool) {
    const item = memoryItems.find((i) => i.id === id);
    if (!item) return null;
    if (name) item.name = name;
    if (description !== undefined) item.description = description;
    return item;
  }
  const result = await pgPool.query(
    `UPDATE items SET
       name = COALESCE($2, name),
       description = COALESCE($3, description),
       updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, description, archived, created_at, updated_at`,
    [id, name || null, description !== undefined ? description : null]
  );
  return result.rows[0] || null;
}

async function deleteItem(id) {
  if (!pgPool) {
    const index = memoryItems.findIndex((i) => i.id === id);
    if (index === -1) return false;
    memoryItems.splice(index, 1);
    return true;
  }
  const result = await pgPool.query("DELETE FROM items WHERE id = $1", [id]);
  return result.rowCount > 0;
}

// ============================================
// Graceful shutdown
// ============================================
async function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully`);
  if (pgPool) {
    await pgPool.end().catch(() => {});
  }
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ============================================
// Start
// ============================================
async function start() {
  await initDatabase();
  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Database: ${config.db.enabled ? "PostgreSQL" : "in-memory"}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

// Only start listening when run directly (not when imported by tests)
if (require.main === module) {
  start();
}

// Export for testing
module.exports = { app, start, config, memoryStore: { get items() { return memoryItems; } } };
