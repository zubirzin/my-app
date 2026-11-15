const assert = require("node:assert");
const { describe, it, before, after } = require("node:test");

// Import server without starting it (server.js only listens when run directly)
const { app, start } = require("../server.js");

let server;
let baseUrl;

describe("Server Tests", () => {
  before(async () => {
    server = await start();
    const address = server.address();
    baseUrl = `http://localhost:${address.port}`;
  });

  after(() => {
    if (server) server.close();
  });

  it("should export express app", () => {
    assert.ok(app);
    assert.strictEqual(typeof app.listen, "function");
  });

  it("should respond to /health with 200", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.status, "healthy");
  });

  it("should respond to /api/status", async () => {
    const res = await fetch(`${baseUrl}/api/status`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.name, "my-app");
    assert.strictEqual(json.version, "1.0.0");
  });

  it("should list items", async () => {
    const res = await fetch(`${baseUrl}/api/items`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.ok(Array.isArray(json.data));
    assert.ok(json.data.length >= 3);
  });

  it("should create, update and delete an item", async () => {
    // Create
    const createRes = await fetch(`${baseUrl}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Item", description: "Created by test" }),
    });
    assert.strictEqual(createRes.status, 201);
    const created = await createRes.json();
    assert.strictEqual(created.name, "Test Item");
    assert.ok(created.id);

    // Read
    const readRes = await fetch(`${baseUrl}/api/items/${created.id}`);
    assert.strictEqual(readRes.status, 200);

    // Update
    const updateRes = await fetch(`${baseUrl}/api/items/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Item" }),
    });
    assert.strictEqual(updateRes.status, 200);
    const updated = await updateRes.json();
    assert.strictEqual(updated.name, "Updated Item");

    // Delete
    const deleteRes = await fetch(`${baseUrl}/api/items/${created.id}`, {
      method: "DELETE",
    });
    assert.strictEqual(deleteRes.status, 204);

    // Verify deleted
    const verifyRes = await fetch(`${baseUrl}/api/items/${created.id}`);
    assert.strictEqual(verifyRes.status, 404);
  });

  it("should reject item without name", async () => {
    const res = await fetch(`${baseUrl}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "No name provided" }),
    });
    assert.strictEqual(res.status, 400);
  });

  it("should return 404 for unknown route", async () => {
    const res = await fetch(`${baseUrl}/this-route-does-not-exist`);
    assert.strictEqual(res.status, 404);
  });
});
