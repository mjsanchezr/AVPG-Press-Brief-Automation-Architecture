# Production-grade Dockerfile for AVPG Press Brief Automation
FROM node:20-slim

# Install essential Linux libraries for Puppeteer/Chromium
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxfixes3 \
    libxi6 \
    libxshmfence1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcups2 \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY apps/automation/package*.json ./apps/automation/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the automation service
RUN npm run build --workspace=automation

# Expose port
EXPOSE 8080

# Start the server using the exact path requested
CMD ["node", "apps/automation/dist/index.js"]
