#!/bin/bash
# ==========================================
# Great Society - Hostinger Deployment
# Run on Hostinger VPS via SSH
# ==========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Great Society Deployment ===${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo "Please create .env with your Hostinger credentials"
    exit 1
fi

echo -e "${YELLOW}[1/6] Installing dependencies...${NC}"
npm install --legacy-peer-deps || npm install --legacy-peer-deps --force
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo -e "${YELLOW}[2/6] Building frontend...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"

echo -e "${YELLOW}[3/6] Checking environment...${NC}"
source .env

if [ "$JWT_SECRET" = "REPLACE_WITH_OPENSSL_RAND_HEX_64_OUTPUT" ] || [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}ERROR: JWT_SECRET not configured!${NC}"
    echo "Run: openssl rand -hex 64"
    exit 1
fi

if [[ "$DATABASE_URL" == *"REPLACE_"* ]] || [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL not configured!${NC}"
    echo "Update .env with your Hostinger database credentials"
    exit 1
fi

echo -e "${GREEN}✓ Environment configured${NC}"

echo -e "${YELLOW}[4/6] Starting server with PM2...${NC}"
pm2 delete great-society 2>/dev/null || true

# Start the server with tsx
pm2 start npx -- tsx server/index.ts --name great-society --interpreter npx

# Wait for server to start
sleep 3

echo -e "${YELLOW}[5/6] Checking server status...${NC}"
pm2 status

echo -e "${YELLOW}[6/6] Testing health endpoint...${NC}"
sleep 2
curl -s http://localhost:3001/api/health || echo -e "${YELLOW}⚠ Server may need more time to start${NC}"

echo -e ""
echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  pm2 status          - Check server status"
echo "  pm2 logs great-society - View logs"
echo "  pm2 restart great-society - Restart server"
echo ""
echo -e "${BLUE}API Health Check:${NC}"
echo "  curl http://localhost:3001/api/health"
echo ""
echo -e "${BLUE}Frontend:${NC}"
echo "  Should be served at /"
echo ""
echo -e "${GREEN}Deployment successful!${NC}"