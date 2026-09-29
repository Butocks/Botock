# Botock Architecture: Azure Backend + Vercel Frontend Deployment Guide

This guide details how to run the **FastAPI AI Backend on Microsoft Azure** while keeping the **Next.js Frontend on Vercel**.

---

## 1. Why this Hybrid Setup Works Best
- **Frontend on Vercel:** Lightning-fast static pages, zero latency edge rendering, free hosting for low traffic.
- **Backend on Azure:** No serverless timeouts (critical for AI video generation that takes 30-90s), persistent session storage, Playwright headless browser support, and built-in Anti-Bot protection.

---

## 2. Deploying Backend to Azure in 3 Commands

### Step A: Login to Azure CLI
```bash
az login
```

### Step B: Build & Push Docker Image to Azure Container Registry (ACR)
```bash
# 1. Create a Resource Group
az group create --name botock-rg --location eastus

# 2. Create Azure Container Registry
az acr create --resource-group botock-rg --name botockregistry --sku Basic --admin-enabled true

# 3. Build & push backend image directly to Azure ACR (no local docker needed!)
az acr build --registry botockregistry --image botock-backend:latest ./backend
```

### Step C: Deploy to Azure App Service (Web App for Containers)
```bash
# 1. Create Linux App Service Plan (B1 basic or higher recommended for Playwright)
az appservice plan create --name botock-plan --resource-group botock-rg --sku B1 --is-linux

# 2. Create the Web App using the ACR Image
az webapp create \
  --resource-group botock-rg \
  --plan botock-plan \
  --name botock-api \
  --deployment-container-image-name botockregistry.azurecr.io/botock-backend:latest

# 3. Configure ACR credentials on the Web App
ACR_PASSWORD=$(az acr credential show --name botockregistry --query "passwords[0].value" -o tsv)
az webapp config container set \
  --name botock-api \
  --resource-group botock-rg \
  --docker-custom-image-name botockregistry.azurecr.io/botock-backend:latest \
  --docker-registry-server-url https://botockregistry.azurecr.io \
  --docker-registry-server-user botockregistry \
  --docker-registry-server-password $ACR_PASSWORD
```

---

## 3. Configure Environment Variables in Azure

Go to **Azure Portal** -> **botock-api** -> **Settings** -> **Environment variables** (or run via CLI):

```bash
az webapp config appsettings set --resource-group botock-rg --name botock-api --settings \
  WEBSITES_PORT=8000 \
  ALLOWED_ORIGINS="https://botock.vercel.app,http://localhost:3000" \
  SUPABASE_URL="https://your-supabase-project.supabase.co" \
  SUPABASE_JWT_SECRET="your-supabase-jwt-secret" \
  GOOGLE_EMAIL="your-google-email@gmail.com" \
  GOOGLE_PASSWORD="your-google-app-password" \
  ADMIN_EMAILS="your-admin-email@gmail.com" \
  SMTP_SERVER="smtp.gmail.com" \
  SMTP_PORT="587" \
  SMTP_USERNAME="your-email@gmail.com" \
  SMTP_PASSWORD="your-email-app-password"
```

Your Azure backend is now live at:
`https://botock-api.azurewebsites.net`

---

## 4. Connect Frontend on Vercel to Azure Backend

In your **Vercel Dashboard**:
1. Go to **Settings** -> **Environment Variables**.
2. Add or update:
   - **Key:** `NEXT_PUBLIC_BACKEND_URL`
   - **Value:** `https://botock-api.azurewebsites.net`
3. Click **Save** and trigger a **Redeploy** on Vercel.

---

## 5. Built-in Anti-Bot & AdSense Safety
- **Search Engine Bots (Googlebot, Bingbot, AdSense Bot):** Explicitly whitelisted so AdSense verification and search indexing succeed without interruption.
- **Malicious Scrapers & Spammers:** Blocked via rate-limiter and user-agent filters.
- **Tool Reward Credits:** Awarded credits automatically expire after 24 hours. Cooldowns prevent abuse.
