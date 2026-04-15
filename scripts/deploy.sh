#!/bin/bash

# StockFlow VPS Deployment Script
# 
# This script deploys the StockFlow app to a standard Linux VPS.
# It handles app installation, build, and nginx reverse proxy setup.
#
# Prerequisites:
# - Node.js 18+ installed
# - nginx installed
# - sudo access for nginx reload
#
# Usage:
# ./deploy.sh --env-file .env.production --port 3000 --domain stock.example.com

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
APP_DIR="${APP_DIR:-.}"
PORT="${PORT:-3000}"
DOMAIN="${DOMAIN:?ERROR: DOMAIN is required}"
ENV_FILE="${ENV_FILE:-.env.production}"
APP_NAME="stockflow"
APP_USER="${APP_USER:-${APP_NAME}}"

echo -e "${YELLOW}📦 StockFlow VPS Deployment${NC}"
echo "================================"
echo "App Directory: $APP_DIR"
echo "Port: $PORT"
echo "Domain: $DOMAIN"
echo "Environment File: $ENV_FILE"
echo ""

# Validate environment file
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}❌ Environment file not found: $ENV_FILE${NC}"
  echo "Create the file with:"
  echo "  GEMINI_API_KEY=your_key_here"
  echo "  APP_URL=https://$DOMAIN"
  exit 1
fi

echo -e "${GREEN}✓ Environment file found${NC}"

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
  echo -e "${RED}❌ App directory not found: $APP_DIR${NC}"
  exit 1
fi

cd "$APP_DIR"

# Install/update dependencies
echo -e "${YELLOW}📥 Installing dependencies...${NC}"
npm ci

# Build the app
echo -e "${YELLOW}🔨 Building application...${NC}"
export $(grep -v '^#' "$ENV_FILE" | xargs)
npm run build

if [ ! -d "dist" ]; then
  echo -e "${RED}❌ Build failed - dist directory not found${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Build completed${NC}"

# Create/update systemd service for app
echo -e "${YELLOW}⚙️ Setting up systemd service...${NC}"

SERVICE_FILE="/etc/systemd/system/${APP_NAME}.service"

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then 
  echo -e "${YELLOW}ℹ️ Note: Systemd setup requires sudo. Creating local service template instead.${NC}"
  SERVICE_FILE="${APP_NAME}.service"
fi

cat > "$SERVICE_FILE" << EOF
[Unit]
Description=StockFlow Application
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run preview
Restart=on-failure
RestartSec=10s

# Environment variables
EnvironmentFile=-$ENV_FILE

[Install]
WantedBy=multi-user.target
EOF

if [ "$EUID" -eq 0 ]; then
  systemctl daemon-reload
  systemctl enable "$APP_NAME"
  echo -e "${GREEN}✓ Service installed and enabled${NC}"
else
  echo -e "${YELLOW}⚠️ Created $SERVICE_FILE template. Install with:${NC}"
  echo "   sudo cp $SERVICE_FILE /etc/systemd/system/"
  echo "   sudo systemctl daemon-reload"
  echo "   sudo systemctl enable $APP_NAME"
fi

# Setup nginx configuration
echo -e "${YELLOW}⚙️ Configuring nginx...${NC}"

NGINX_CONFIG="/etc/nginx/sites-available/${APP_NAME}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${APP_NAME}"

cat > "${NGINX_CONFIG}.tmp" << EOF
upstream stockflow {
    server 127.0.0.1:$PORT;
}

server {
    listen 80;
    server_name $DOMAIN;
    
    # Redirect HTTP to HTTPS (if using HTTPS)
    # Uncomment after enabling SSL
    # return 301 https://\$server_name\$request_uri;
    
    location / {
        proxy_pass http://stockflow;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static assets with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://stockflow;
        proxy_cache_valid 200 30d;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# HTTPS Configuration (uncomment after getting SSL certificate)
# server {
#     listen 443 ssl http2;
#     server_name $DOMAIN;
#     
#     ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
#     
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#     ssl_prefer_server_ciphers on;
#     
#     # ... location blocks same as above ...
# }
EOF

if [ "$EUID" -eq 0 ]; then
  mv "${NGINX_CONFIG}.tmp" "$NGINX_CONFIG"
  
  # Enable site if not already enabled
  if [ ! -L "$NGINX_ENABLED" ]; then
    ln -s "$NGINX_CONFIG" "$NGINX_ENABLED"
  fi
  
  # Test and reload nginx
  if nginx -t; then
    systemctl reload nginx
    echo -e "${GREEN}✓ Nginx configured and reloaded${NC}"
  else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️ Created nginx config (requires sudo to install):${NC}"
  echo "   sudo cp ${NGINX_CONFIG}.tmp $NGINX_CONFIG"
  echo "   sudo ln -s $NGINX_CONFIG $NGINX_ENABLED"
  echo "   sudo nginx -t && sudo systemctl reload nginx"
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Start the application:"
echo "   sudo systemctl start $APP_NAME"
echo ""
echo "2. Verify it's running:"
echo "   sudo systemctl status $APP_NAME"
echo "   curl http://localhost:$PORT"
echo ""
echo "3. For HTTPS (recommended for production):"
echo "   - Install certbot: sudo apt install certbot python3-certbot-nginx"
echo "   - Get certificate: sudo certbot --nginx -d $DOMAIN"
echo "   - Uncomment HTTPS section in nginx config at $NGINX_CONFIG"
echo ""
echo "4. Monitor logs:"
echo "   sudo journalctl -u $APP_NAME -f"
echo ""
echo "Access your app at: http://$DOMAIN"
