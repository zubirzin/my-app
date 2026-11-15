# ============================================
# Deployment Configuration Guide
# ============================================
# Fill in these values in GitLab CI/CD Variables
# Settings → CI/CD → Variables
# ============================================

## Required for ALL deployments
# (GitLab provides these automatically for the registry)
# CI_REGISTRY_USER, CI_REGISTRY_PASSWORD, CI_REGISTRY, CI_REGISTRY_IMAGE

## VPS Deployment (deploy:vps)
SSH_PRIVATE_KEY          # Your SSH private key (ed25519)
VPS_USER                 # SSH user (e.g., ubuntu, root)
VPS_HOST                 # Server IP or hostname
SSH_KNOWN_HOSTS          # Output of: ssh-keyscan your-server.com

## Google Cloud Run (deploy:cloudrun)
GCP_SERVICE_ACCOUNT_KEY  # JSON service account key
GCP_PROJECT_ID           # GCP project ID
GCP_REGION               # e.g., us-central1, asia-southeast1

## Kubernetes (deploy:k8s)
K8S_SERVER               # API server URL
K8S_CLUSTER              # Cluster name
K8S_CONTEXT              # Context name
K8S_USER                 # User name
K8S_CERTIFICATE_AUTHORITY_DATA  # Base64 CA cert
K8S_CLIENT_CERTIFICATE_DATA     # Base64 client cert
K8S_CLIENT_KEY_DATA             # Base64 client key

## Database (for app)
DATABASE_URL             # postgresql://user:pass@host:5432/db
DATABASE_HOST            # Database hostname
DATABASE_PORT            # 5432
DATABASE_USER            # Database user
DATABASE_PASSWORD        # Database password
DATABASE_NAME            # Database name
DATABASE_SSL             # true/false

## Application
NODE_ENV                 # production / staging / development
PORT                     # 3000
