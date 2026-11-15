# ============================================
# DEPLOYMENT GUIDE — GitHub Actions
# ============================================
# Fill in these values in GitHub Secrets
# Settings → Secrets and variables → Actions
# ============================================

## Auto-provided by GitHub (no setup needed)
# GITHUB_TOKEN — automatically available

## Container Registry (ghcr.io)
# No setup needed — GITHUB_TOKEN handles auth

## VPS Deployment (deploy-vps)
VPS_HOST              # Your server IP or hostname
VPS_USER              # SSH user (e.g., ubuntu, root)
VPS_SSH_PRIVATE_KEY   # SSH private key content

## Google Cloud Run (deploy-cloudrun)
# GCP_SERVICE_ACCOUNT_KEY  # JSON key (entire file content)
# GCP_PROJECT_ID           # GCP project ID
# GCP_REGION               # e.g., us-central1

## Kubernetes (deploy-k8s)
K8S_CLUSTER           # Cluster name
K8S_SERVER            # API server URL
K8S_CERTIFICATE_AUTHORITY_DATA  # Base64 CA cert
K8S_CLIENT_CERTIFICATE_DATA     # Base64 client cert
K8S_CLIENT_KEY_DATA             # Base64 client key

## Database
DATABASE_URL          # postgresql://user:pass@host:5432/db
DATABASE_HOST         # Database hostname
DATABASE_PORT         # 5432
DATABASE_USER         # Database user
DATABASE_PASSWORD     # Database password
DATABASE_NAME         # Database name
DATABASE_SSL          # true/false

## Application
NODE_ENV              # production / staging / development
PORT                  # 3000

# ============================================
# How to Add Secrets in GitHub
# ============================================
# 1. Go to your repo on GitHub
# 2. Settings → Secrets and variables → Actions
# 3. Click "New repository secret"
# 4. Name: enter the name (e.g., VPS_HOST)
# 5. Secret: enter the value
# 6. Click "Add secret"

# ============================================
# Optional: Enable Environments
# ============================================
# For production deployments with protection rules:
# 1. Go to Settings → Environments
# 2. Click "New environment"
# 3. Name: production
# 4. Add protection rules (require approval, restrict to branches)
# 5. The workflow will show "Approve and deploy" button
