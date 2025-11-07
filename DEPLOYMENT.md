# Deployment Guide

This guide covers deploying the IoT Data Exchange Protocol to production.

## Prerequisites

- Sui wallet with sufficient SUI tokens (for gas fees)
- Walrus testnet access
- Node.js 18+ installed
- Domain name (optional, for production frontend)

## Step 1: Deploy Smart Contracts

### 1.1 Configure Sui CLI

```bash
# Check current configuration
sui client active-address

# If needed, switch to the correct network
sui client switch --env testnet

# Verify you have SUI tokens
sui client gas
```

### 1.2 Publish Contracts

```bash
cd contracts

# Build and test contracts first
sui move build
sui move test

# Publish to testnet
sui client publish --gas-budget 100000000

# Save the output! You'll need:
# - Package ID
# - DataFeedRegistry Object ID
# - PlatformTreasury Object ID
```

### 1.3 Save Contract Information

Create a file `deployed-objects.json`:

```json
{
  "packageId": "0x...",
  "registryId": "0x...",
  "treasuryId": "0x...",
  "network": "testnet",
  "deployedAt": "2024-01-01T00:00:00Z"
}
```

## Step 2: Configure Backend

### 2.1 Environment Variables

Create `.env` file in `backend/` directory:

```bash
# Sui Configuration
SUI_NETWORK=testnet
SUI_PRIVATE_KEY=your_private_key_here
SUI_PACKAGE_ID=0x...from_step_1
SUI_REGISTRY_ID=0x...from_step_1
SUI_TREASURY_ID=0x...from_step_1

# Walrus Configuration
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
WALRUS_EPOCHS=5

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS
FRONTEND_URL=https://your-domain.com

# Cache Configuration
CACHE_TTL=300
```

### 2.2 Build Backend

```bash
cd backend
npm install
npm run build
```

### 2.3 Test Backend Locally

```bash
npm run dev

# In another terminal, test health endpoint
curl http://localhost:3001/health
```

## Step 3: Configure Frontend

### 3.1 Environment Variables

Create `.env.local` file in `frontend/` directory:

```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com/ws
NEXT_PUBLIC_SUI_NETWORK=testnet
```

For local development:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
NEXT_PUBLIC_SUI_NETWORK=testnet
```

### 3.2 Build Frontend

```bash
cd frontend
npm install
npm run build
```

### 3.3 Test Frontend Locally

```bash
npm run dev

# Visit http://localhost:3000
```

## Step 4: Initialize Demo Data (Optional)

If you want to pre-populate the marketplace with sample feeds:

```bash
cd backend
npm run build

# Run initialization script
node dist/scripts/init-demo-feeds.js
```

This will create 5 sample IoT data feeds on-chain.

## Step 5: Production Deployment

### Option A: Docker Deployment

#### 5.1 Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

#### 5.2 Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
```

#### 5.3 Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    env_file:
      - ./backend/.env
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      - backend
    restart: unless-stopped
```

Deploy:

```bash
docker-compose up -d
```

### Option B: Cloud Deployment (Vercel + Railway)

#### Backend on Railway

1. Sign up at [Railway.app](https://railway.app)
2. Create new project
3. Deploy from GitHub or upload code
4. Add environment variables from `.env`
5. Deploy
6. Note the public URL

#### Frontend on Vercel

1. Sign up at [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL
   - `NEXT_PUBLIC_WS_URL`: Your Railway backend URL with `wss://`
5. Deploy

### Option C: VPS Deployment

#### Backend Setup

```bash
# SSH into your server
ssh user@your-server.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo-url>
cd data-marketplace-/backend

# Install dependencies
npm install

# Create .env file
nano .env
# (paste your environment variables)

# Build
npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start backend
pm2 start dist/index.js --name iot-marketplace-api

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local
nano .env.local
# (paste your environment variables)

# Build
npm run build

# Start with PM2
pm2 start npm --name iot-marketplace-web -- start

# Save
pm2 save
```

#### Nginx Configuration

Create `/etc/nginx/sites-available/iot-marketplace`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:3001/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}

# Frontend
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/iot-marketplace /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL with Certbot

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

## Step 6: Monitoring

### Backend Logs

```bash
# If using PM2
pm2 logs iot-marketplace-api

# If using Docker
docker-compose logs -f backend
```

### Health Checks

Set up a monitoring service to ping:
- `https://api.your-domain.com/health`

### Metrics to Monitor

- API response times
- WebSocket connections
- Walrus upload/download success rates
- Sui transaction success rates
- Error rates

## Step 7: Post-Deployment

### 7.1 Test the Deployment

1. Visit your frontend URL
2. Connect a Sui wallet
3. Create a test feed as provider
4. Subscribe to a feed as consumer
5. Verify data access
6. Test WebSocket streaming

### 7.2 Update Documentation

Update your README with:
- Live demo URLs
- Deployed contract addresses
- API documentation

### 7.3 Security Checklist

- [ ] Environment variables are not exposed
- [ ] Private keys are secure
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enabled
- [ ] Firewall rules are configured
- [ ] Backup strategy is in place

## Troubleshooting

### Common Issues

**Issue**: Contract deployment fails
- **Solution**: Ensure you have enough SUI for gas fees
- Check network connectivity
- Verify Sui CLI configuration

**Issue**: Backend can't connect to Sui
- **Solution**: Check `SUI_PRIVATE_KEY` format
- Verify network is set to `testnet`
- Ensure package ID is correct

**Issue**: Walrus uploads fail
- **Solution**: Check Walrus endpoints are accessible
- Verify data size is within limits
- Try increasing `WALRUS_EPOCHS`

**Issue**: Frontend can't connect to backend
- **Solution**: Verify CORS settings
- Check `NEXT_PUBLIC_API_URL` is correct
- Ensure backend is running

## Maintenance

### Updating Smart Contracts

```bash
# Build new version
cd contracts
sui move build

# Publish upgrade
sui client publish --gas-budget 100000000

# Update backend .env with new package ID
# Restart backend
```

### Updating Backend

```bash
git pull
cd backend
npm install
npm run build

# If using PM2
pm2 restart iot-marketplace-api

# If using Docker
docker-compose down
docker-compose up -d --build
```

### Updating Frontend

```bash
git pull
cd frontend
npm install
npm run build

# If using PM2
pm2 restart iot-marketplace-web

# If using Docker
docker-compose down
docker-compose up -d --build
```

## Support

For deployment issues:
1. Check logs first
2. Review this guide
3. Open an issue on GitHub
4. Contact support

---

**Happy Deploying! 🚀**
