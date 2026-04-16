#!/bin/bash
# Hostinger Deployment Script

echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Starting server with PM2..."
pm2 delete great-society 2>/dev/null || true
pm2 start server/index.ts --name great-society --interpreter npx

echo "Deployment complete!"
pm2 list