# My App — Docker + CI/CD (GitHub Actions)

Production-ready Node.js Express API with Docker containerization and GitHub Actions CI/CD pipeline.

## Features

- Express.js REST API with full CRUD operations
- PostgreSQL database (with in-memory fallback)
- Docker multi-stage build
- GitHub Actions CI/CD (build, test, lint, security, deploy)
- Kubernetes manifests
- Health checks and graceful shutdown
- Horizontal Pod Autoscaler

## Quick Start

### Local Development (with Docker Compose)

```bash
# Start all services (app + PostgreSQL)
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Run server (uses in-memory store if no DB)
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/status` | App status |
| GET | `/api/info` | System info |
| GET | `/api/items` | List items |
| GET | `/api/items/:id` | Get item |
| POST | `/api/items` | Create item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

## CI/CD Pipeline (GitHub Actions)

### Workflow Jobs

| Job | Description | When |
|-----|-------------|------|
| `build` | Build Docker image → Push to GHCR | Every push |
| `test` | Run unit tests | Every push |
| `lint` | ESLint code quality | Every push |
| `security` | npm audit | Every push |
| `test-compose` | Full stack test with docker compose | Every push |
| `deploy-vps` | SSH deploy to VPS | main branch (manual) |
| `deploy-k8s` | Deploy to Kubernetes | main branch (manual) |

### GitHub Secrets Required

See `DEPLOYMENT.md` for all required secrets.

## Project Structure

```
.
├── .github/workflows/
│   └── ci-cd.yml           # GitHub Actions pipeline
├── app/
│   └── index.html          # Static frontend
├── db/
│   ├── schema.sql          # Database schema
│   └── migrations/         # Database migrations
├── k8s/
│   ├── namespace.yaml      # K8s namespace
│   ├── configmap.yaml      # K8s config
│   ├── secret.yaml         # K8s secrets
│   ├── deployment.yaml     # K8s deployment
│   ├── postgres.yaml       # K8s PostgreSQL
│   └── ingress.yaml        # K8s ingress
├── tests/
│   └── server.test.js      # Unit tests
├── .gitlab-ci.yml          # GitLab CI/CD (legacy)
├── Dockerfile              # Docker image
├── docker-compose.yml      # Local development
├── .dockerignore           # Docker exclusions
├── .gitignore              # Git exclusions
├── server.js               # Express API server
├── package.json            # Dependencies
├── eslint.config.js        # ESLint config
├── README.md
└── TESTING.md              # Testing guide
```

## Database

### PostgreSQL (Production)

Set `DATABASE_URL` environment variable:
```
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### In-Memory (Development/Testing)

If no `DATABASE_URL` is set, the app uses an in-memory store. Data is lost on restart.

## Kubernetes

```bash
# Create namespace and resources
kubectl apply -f k8s/

# Check status
kubectl -n myapp get all

# View logs
kubectl -n myapp logs -l app.kubernetes.io/name=myapp -f
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `DATABASE_SSL` | `false` | Use SSL for DB |
| `LOG_LEVEL` | `info` | Logging level |

## License

MIT


Production-ready Node.js Express API with Docker containerization and GitLab CI/CD pipeline.

## Features

- Express.js REST API with full CRUD operations
- PostgreSQL database (with in-memory fallback)
- Docker multi-stage build
- GitLab CI/CD pipeline (build, test, deploy)
- Kubernetes manifests
- Health checks and graceful shutdown
- Horizontal Pod Autoscaler

## Quick Start

### Local Development (with Docker Compose)

```bash
# Start all services (app + PostgreSQL)
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Run server (uses in-memory store if no DB)
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/status` | App status |
| GET | `/api/info` | System info |
| GET | `/api/items` | List items |
| GET | `/api/items/:id` | Get item |
| POST | `/api/items` | Create item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

## CI/CD Pipeline

### Stages

1. **Build** — Build Docker image → Push to GitLab Container Registry
2. **Test** — Unit tests, linting, security scan
3. **Deploy** — VPS / Cloud Run / Kubernetes (manual approval)

### Deployment Targets

| Target | File | Description |
|--------|------|-------------|
| VPS | `.gitlab-ci.yml` | SSH + Docker Compose |
| Cloud Run | `.gitlab-ci.yml` | Google Cloud Run |
| Kubernetes | `k8s/*.yaml` | Any K8s cluster |

### GitLab CI/CD Variables

See `DEPLOYMENT.md` for required variables.

## Project Structure

```
.
├── app/
│   └── index.html          # Static frontend
├── db/
│   ├── schema.sql          # Database schema
│   └── migrations/         # Database migrations
├── k8s/
│   ├── namespace.yaml      # K8s namespace
│   ├── configmap.yaml      # K8s config
│   ├── secret.yaml         # K8s secrets
│   ├── deployment.yaml     # K8s deployment
│   ├── postgres.yaml       # K8s PostgreSQL
│   └── ingress.yaml        # K8s ingress
├── tests/
│   └── server.test.js      # Unit tests
├── .gitlab-ci.yml          # CI/CD pipeline
├── Dockerfile              # Docker image
├── docker-compose.yml      # Local development
├── .dockerignore           # Docker exclusions
├── .gitignore              # Git exclusions
├── server.js               # Express API server
├── package.json            # Dependencies
└── DEPLOYMENT.md           # Deployment guide
```

## Database

### PostgreSQL (Production)

Set `DATABASE_URL` environment variable:
```
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### In-Memory (Development/Testing)

If no `DATABASE_URL` is set, the app uses an in-memory store. Data is lost on restart.

## Kubernetes

```bash
# Create namespace and resources
kubectl apply -f k8s/

# Check status
kubectl -n myapp get all

# View logs
kubectl -n myapp logs -l app.kubernetes.io/name=myapp -f
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `DATABASE_SSL` | `false` | Use SSL for DB |
| `LOG_LEVEL` | `info` | Logging level |

## License

MIT
# Trigger pipeline
