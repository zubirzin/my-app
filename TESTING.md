# ============================================
# TESTING GUIDE — My App
# ============================================
# How to test each component end-to-end
# ============================================

## Quick Status Check

```
✅ = Test passed
❌ = Test failed
⚠️  = Warning / needs attention
```

---

## 1. Unit Tests (Jest/Mocha/Node Test Runner)

### Run locally (no Docker needed)
```bash
cd /tmp/kilo/my-app
npm install
npm test
```

### Expected output
```
✓ Server Tests
  ✓ should export express app
  ✓ should have health endpoint

2 passing (50ms)
```

### What it tests
- Server exports correctly
- Health endpoint returns 200 OK

---

## 2. API Endpoints (Manual Test)

### Start server locally
```bash
cd /tmp/kilo/my-app
npm start
# Server runs on http://localhost:3000
```

### Test each endpoint
```bash
# Health check
curl http://localhost:3000/health
# Expected: {"status":"healthy","uptime":...}

# API status
curl http://localhost:3000/api/status
# Expected: {"name":"my-app","version":"1.0.0",...}

# System info
curl http://localhost:3000/api/info
# Expected: {"node_version":"v20...","platform":"linux",...}

# List items
curl http://localhost:3000/api/items
# Expected: {"total":3,"count":3,"data":[...]}

# Get single item
curl http://localhost:3000/api/items/1
# Expected: {"id":1,"name":"Item 1",...}

# Create item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","description":"Testing"}'
# Expected: {"id":4,"name":"Test Item",...}

# Update item
curl -X PUT http://localhost:3000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Item"}'
# Expected: {"id":1,"name":"Updated Item",...}

# Delete item
curl -X DELETE http://localhost:3000/api/items/1
# Expected: (empty, status 204)

# 404 test
curl http://localhost:3000/nonexistent
# Expected: {"error":"Not found"}
```

---

## 3. Docker Build & Run

### Build image
```bash
cd /tmp/kilo/my-app
docker build -t myapp:test .
```

### Expected output
```
[+] Building 45.2s (12/12) FINISHED
 => [internal] load build definition
 => => transferring dockerfile: 1.23kB
 => [1/5] FROM docker.io/library/node:20-alpine
 => [2/5] WORKDIR /app
 => [3/5] COPY package*.json ./
 => [4/5] RUN npm ci --only=production
 => [5/5] COPY . .
 => exporting to image
 => => naming to docker.io/library/myapp:test
```

### Run container
```bash
docker run -d --name myapp-test -p 3000:3000 myapp:test
```

### Test running container
```bash
curl http://localhost:3000/health
# Expected: {"status":"healthy",...}

docker logs myapp-test
# Expected: "Server running on port 3000"
```

### Stop & cleanup
```bash
docker stop myapp-test && docker rm myapp-test
```

---

## 4. Docker Compose (Full Stack)

### Start all services
```bash
cd /tmp/kilo/my-app
docker compose up -d
```

### Expected output
```
[+] Running 3/3
 ✔ Network my-app_app-network  Created
 ✔ Container myapp-db           Started
 ✔ Container myapp              Started
```

### Check status
```bash
docker compose ps
```

### Expected output
```
NAME      STATUS                    PORTS
myapp     running (healthy)         0.0.0.0:3000->3000/tcp
myapp-db  running (healthy)         0.0.0.0:5432->5432/tcp
```

### Test database connection
```bash
docker compose exec db psql -U myapp -d myapp_db -c "SELECT * FROM items;"
```

### Expected output
```
 id |   name   | description | created_at | updated_at
----+----------+-------------+------------+------------
  1 | Item 1   | Sample 1    | 2026-11-15 | 2026-11-15
  2 | Item 2   | Sample 2    | 2026-11-15 | 2026-11-15
  3 | Item 3   | Sample 3    | 2026-11-15 | 2026-11-15
```

### Test app with database
```bash
curl http://localhost:3000/api/items
# Should return items from PostgreSQL
```

### View logs
```bash
docker compose logs -f app
docker compose logs -f db
```

### Stop everything
```bash
docker compose down
```

---

## 5. GitLab CI/CD Pipeline

### Check pipeline status
```bash
# Option A: Browser
open https://gitlab.com/ai.zubirzin/my-app/-/pipelines

# Option B: GitLab CLI (if installed)
glab pipeline list
```

### Expected pipeline stages
```
✅ build
✅ test:unit
✅ test:lint
✅ test:security
⏸️  deploy:production (manual)
```

### Manual deploy (if configured)
1. Go to https://gitlab.com/ai.zubirzin/my-app/-/pipelines
2. Click on latest pipeline
3. Click "Play" button on deploy:production
4. Confirm deployment

---

## 6. Kubernetes (Local or Remote)

### Check manifests validity
```bash
cd /tmp/kilo/my-app
kubectl apply --dry-run=client -f k8s/
```

### Expected output
```
namespace/myapp created (dry run)
configmap/myapp-config created (dry run)
secret/myapp-secrets created (dry run)
deployment.apps/myapp created (dry run)
service/myapp created (dry run)
horizontalpodautoscaler.autoscaling/myapp-hpa created (dry run)
```

### Deploy to cluster (if you have one)
```bash
kubectl apply -f k8s/
kubectl -n myapp get all
```

### Expected output
```
NAME                        READY   STATUS    RESTARTS   AGE
pod/myapp-xxxx-yyyy         1/1     Running   0          1m
pod/myapp-xxxx-zzzz         1/1     Running   0          1m
pod/postgres-0              1/1     Running   0          1m

NAME           TYPE        CLUSTER-IP      PORT(S)
service/myapp  ClusterIP   10.x.x.x       80/TCP

NAME                     READY   UP-TO-DATE   AVAILABLE
deployment.apps/myapp   2/2     2            2
```

---

## 7. Database Migrations

### Run migrations manually
```bash
cd /tmp/kilo/my-app

# With Docker Compose running
docker compose exec db psql -U myapp -d myapp_db -f /docker-entrypoint-initdb.d/init.sql

# Or connect directly
docker compose exec db psql -U myapp -d myapp_db
```

### Check migration status
```bash
docker compose exec db psql -U myapp -d myapp_db -c "\dt"
```

### Expected output
```
           List of relations
 Schema | Name  | Type  | Owner
--------+-------+-------+-------
 public | items | table | myapp
```

---

## 8. Security Tests

### Check for vulnerabilities
```bash
cd /tmp/kilo/my-app
npm audit
```

### Expected output
```
found 0 vulnerabilities
```

### Docker image security scan
```bash
docker scan myapp:test
# Or use Trivy
trivy image myapp:test
```

---

## 9. Performance Test

### Load test with Apache Bench
```bash
# Install apache2-utils if needed
ab -n 1000 -c 100 http://localhost:3000/health
```

### Expected output
```
Concurrency Level:      100
Time taken for tests:   2.345 seconds
Complete requests:      1000
Failed requests:        0
Requests per second:    426.44 [#/sec]
```

---

## 10. End-to-End Test (All Components)

### Full stack test script
```bash
#!/bin/bash
# save as test-e2e.sh

set -e

echo "=== 1. Unit Tests ==="
npm test

echo "=== 2. Build Docker Image ==="
docker build -t myapp:test .

echo "=== 3. Start Services ==="
docker compose up -d

echo "=== 4. Wait for services ==="
sleep 10

echo "=== 5. Health Check ==="
curl -f http://localhost:3000/health || exit 1

echo "=== 6. API Test ==="
curl -f http://localhost:3000/api/items || exit 1

echo "=== 7. Database Test ==="
docker compose exec -T db psql -U myapp -d myapp_db -c "SELECT 1" || exit 1

echo "=== 8. Cleanup ==="
docker compose down
docker rmi myapp:test

echo "=== All tests passed! ==="
```

Run it:
```bash
chmod +x test-e2e.sh
./test-e2e.sh
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm test` fails | `npm install` first |
| Docker build fails | Check Dockerfile syntax |
| `docker compose up` fails | Check port 3000/5432 not in use |
| Pipeline fails | Check GitLab CI/CD variables |
| K8s deploy fails | Check cluster connection |
| DB connection fails | Check DATABASE_URL |

---

## Quick Test Commands

```bash
# Test 1: Unit
npm test

# Test 2: API (server must be running)
curl http://localhost:3000/health

# Test 3: Docker
docker build -t myapp:test . && docker run -d -p 3000:3000 myapp:test

# Test 4: Full stack
docker compose up -d && curl http://localhost:3000/health

# Test 5: Database
docker compose exec db psql -U myapp -d myapp_db -c "SELECT * FROM items;"
```

---

**Status**: All tests should pass. If any fail, check the troubleshooting table or ask for help.
