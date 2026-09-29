# ===================================================
# Dockerfile: Botock FastAPI AI & Tools Backend
# Optimized for Microsoft Azure App Service & Container Apps
# ===================================================

FROM python:3.11-slim

# Prevent Python from writing .pyc files & enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# 1. Install OS dependencies required by Playwright & Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    ca-certificates \
    curl \
    git \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libxkbcommon0 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    fonts-liberation \
    libappindicator3-1 \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 3. Install Playwright Chromium & dependencies
RUN playwright install chromium

# 4. Copy backend source code
COPY . .

# 5. Create storage directories for sessions, generated videos and downloads
RUN mkdir -p session generated_videos

# Azure App Service sets the PORT environment variable (default 8000)
ENV PORT=8000
EXPOSE 8000

# 6. Start Uvicorn Server with dynamic port support
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]
