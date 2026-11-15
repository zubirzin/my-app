# ============================================
# DEPLOYMENT GUIDE — Railway / Render
# ============================================
# Free tier deployment without your own server
# ============================================

## Option A: Railway (Recommended — easiest)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (free)
3. No credit card required

### Step 2: Create Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `zubirzin/my-app`
4. Railway auto-detects Dockerfile
5. Click "Deploy Now"

### Step 3: Get Credentials
1. Go to Project → Settings → Tokens
2. Create "Project Token"
3. Copy the token

### Step 4: Add GitHub Secrets
Go to your repo → Settings → Secrets → Actions → New repository secret:

| Name | Value |
|------|-------|
| `RAILWAY_TOKEN` | Your Railway project token |
| `RAILWAY_PROJECT` | Your project ID (from URL) |

### Step 5: Enable Deployment
Add GitHub Variable:
- Name: `RAILWAY_DEPLOY_ENABLED`
- Value: `true`

---

## Option B: Render

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (free)
3. No credit card required

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect `zubirzin/my-app`
3. Select "Docker" runtime
4. Name: `myapp`
5. Region: Singapore (closest to Malaysia)
6. Click "Create Web Service"

### Step 3: Get Credentials
1. Go to Dashboard → Account Settings → API Keys
2. Create API Key
3. Copy the key
4. Note your Service ID from URL: `https://dashboard.render.com/web/[SERVICE_ID]`

### Step 4: Add GitHub Secrets
| Name | Value |
|------|-------|
| `RENDER_API_KEY` | Your Render API key |
| `RENDER_SERVICE_ID` | Service ID from URL |

### Step 5: Enable Deployment
- Name: `RENDER_DEPLOY_ENABLED`
- Value: `true`

---

## Option C: Both (Deploy to Both)

Set both variables to `true`:
- `RAILWAY_DEPLOY_ENABLED` = `true`
- `RENDER_DEPLOY_ENABLED` = `true`

---

## Free Tier Limits

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| **Railway** | $5 credit/month | ~500 hours runtime |
| **Render** | 750 hours/month | Sleeps after 15 min inactivity |

---

## Environment Variables (Set in Railway/Render Dashboard)

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URL` | (add if using external DB) |

---

## Custom Domain (Optional)

Both platforms support custom domains:
- Railway: Project → Settings → Domains
- Render: Service → Settings → Custom Domain

---

## Monitoring

- Railway: Project → Observability (metrics, logs)
- Render: Service → Logs, Metrics, Events

---

## Cost

| Usage | Cost |
|-------|------|
| Within free tier | **$0** |
| Exceeds free tier | Pay-as-you-go |

**Recommendation**: Start with Railway — it's simpler for Docker apps and has better free tier for always-on services.
