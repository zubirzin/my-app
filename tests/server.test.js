const assert = require("node:assert");
const { describe, it } = require("node:test");

// Basic server test
describe("Server Tests", () => {
  it("should export express app", () => {
    const server = require("../server.js");
    assert.ok(server);
  });

  it("should have health endpoint", async () => {
    const http = require("http");
    const PORT = process.env.PORT || 3000;
    const options = {
      hostname: "localhost",
      port: PORT,
      path: "/health",
      method: "GET",
    };

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        assert.strictEqual(res.statusCode, 200);
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const json = JSON.parse(data);
          assert.strictEqual(json.status, "healthy");
          resolve();
        });
      });
      req.on("error", reject);
      req.end();
    });
  });
});
