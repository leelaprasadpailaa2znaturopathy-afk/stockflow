# StockFlow VPS Deployment Guide

This guide covers deploying StockFlow to a standard Linux VPS with nginx and Node.js.

## Overview

**Architecture:**
```
Client Browser
    ↓
  nginx (Reverse Proxy, Port 80/443)
    ↓
StockFlow App (Node.js, Port 3000, systemd service)
    ↓
Firebase Firestore (Cloud)
    ↓ 
Gemini API (Cloud)
```

## Prerequisites

### VPS Requirements
- **OS**: Ubuntu 20.04 LTS or newer (other Linux distros similar steps)
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 20GB+
- **SSH access** with sudo privileges

### Software to Install
1. Node.js 18+ and npm
2. nginx
3. Git (optional, for cloning repo)
4. Certbot + nginx plugin (for HTTPS/SSL)

## Step 1: Server Setup

### Connect to your VPS
```bash
ssh root@your-server-ip
```

### Update system packages
```bash
apt update && apt upgrade -y
```

### Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
```

### Install nginx
```bash
apt install -y nginx
```

### Install Git (optional)
```bash
apt install -y git
```

### Start nginx
```bash
systemctl start nginx
systemctl enable nginx
```

## Step 2: Deploy Application

### Create app directory and user (optional but recommended)
```bash
useradd -m -d /home/stockflow -s /bin/bash stockflow
mkdir -p /home/stockflow/app
chown -R stockflow:stockflow /home/stockflow
```

### Clone or upload repository
```bash
cd /home/stockflow/app
git clone <your-repo-url> .
# OR upload files manually using SCP
```

### Install dependencies
```bash
cd /home/stockflow/app
npm install
```

### Create `.env.production` file
```bash
cat > .env.production << 'EOF'
APP_URL="https://your-domain.com"
NODE_ENV="production"
EOF

# Secure permissions (only app user can read)
chmod 600 .env.production
chown stockflow:stockflow .env.production
```

Note: No API keys needed! App uses local enrichment.

### Build the application
```bash
npm run build
```

Verify `dist/` directory was created and contains `index.html`.

## Step 3: Setup Systemd Service

### Create systemd service file
```bash
cat > /etc/systemd/system/stockflow.service << 'EOF'
[Unit]
Description=StockFlow Application
After=network.target

[Service]
Type=simple
User=stockflow
WorkingDirectory=/home/stockflow/app
EnvironmentFile=/home/stockflow/app/.env.production
ExecStart=/usr/bin/npm run preview
Restart=on-failure
RestartSec=10s
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

### Enable and start service
```bash
systemctl daemon-reload
systemctl enable stockflow
systemctl start stockflow
```

### Verify service is running
```bash
systemctl status stockflow
```

You should see: **Active: active (running)**

### View logs
```bash
journalctl -u stockflow -f
```

## Step 4: Configure nginx

### Get your domain's IP address
```bash
# Skip if already set to your server IP with DNS provider
```

### Create nginx configuration
```bash
cat > /etc/nginx/sites-available/stockflow << 'EOF'
upstream stockflow {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://stockflow;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://stockflow;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF
```

### Enable the site
```bash
ln -s /etc/nginx/sites-available/stockflow /etc/nginx/sites-enabled/
```

### Test nginx configuration
```bash
nginx -t
```

Should output: **test is successful**

### Reload nginx
```bash
systemctl reload nginx
```

## Step 5: Setup HTTPS (SSL/TLS)

### Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### Get SSL certificate (requires domain DNS pointing to server)
```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts. Certbot will:
1. Create SSL certificate
2. Automatically update nginx config
3. Setup auto-renewal

### Verify HTTPS works
```bash
curl https://your-domain.com
```

## Step 6: Update Application

### Pull latest changes
```bash
cd /home/stockflow/app
git pull origin main
```

### Rebuild and restart
```bash
npm install
npm run build
systemctl restart stockflow
```

## Step 7: Monitoring & Maintenance

### Monitor service status
```bash
systemctl status stockflow
systemctl is-active stockflow
```

### View recent logs
```bash
journalctl -u stockflow -n 50
journalctl -u stockflow -f  # Real-time logs
```

### Check nginx status
```bash
systemctl status nginx
nginx -t  # Verify config
```

### Resource usage
```bash
ps aux | grep "node\|npm"
free -h  # Memory
df -h    # Disk space
```

## Troubleshooting

### "Service failed to start"
```bash
journalctl -u stockflow -n 20
# Check for errors in output
# Common issues:
# - Port 3000 already in use
# - .env.production file missing or incorrect
# - dist/ directory empty (run npm run build)
```

### "502 Bad Gateway"
- App service not running: `systemctl restart stockflow`
- Check app logs: `journalctl -u stockflow -f`
- Verify proxy settings in nginx

### "Connection refused"
- Verify app is on port 3000: `ss -tlnp | grep 3000`
- Check firewall: `ufw status` and `ufw allow 80,443/tcp`

### "SSL certificate issues"
```bash
certbot renew --dry-run  # Test renewal
systemctl list-timers certbot  # Check auto-renewal schedule
certbot certificates  # List certificates
```

### "Out of memory or disk space"
```bash
du -sh /home/stockflow  # Check app size
npm cache clean --force  # Clean npm cache
# Consider upgrading VPS if consistently low on resources
```

## Backup & Recovery

### Backup database (Firestore)
- Use Firebase Console → Firestore → Backups
- Or use [Firebase Admin SDK](https://firebase.google.com/docs/firestore/manage-data/export-import)

### Backup .env file (contains sensitive keys!)
```bash
# Secure backup location (off-server recommended)
cp /home/stockflow/app/.env.production ~/backups/.env.production.bak
chmod 600 ~/backups/.env.production.bak
```

### Restore application
```bash
cd /home/stockflow/app
git pull origin main
npm install
npm run build
systemctl restart stockflow
```

## Security Recommendations

1. **Firewall**: Restrict SSH to known IPs
   ```bash
   ufw allow from YOUR_IP to any port 22
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

2. **Keep VPS updated**
   ```bash
   apt update && apt upgrade -y
   apt autoremove -y
   ```

3. **Rotate credentials regularly**
   - Update GEMINI_API_KEY in `.env.production`
   - Verify Firebase security rules are strict

4. **Monitor logs**
   - Set up log rotation
   - Use monitoring tools (e.g., Prometheus, New Relic)

5. **Enable automated backups**
   - Firebase settings
   - Application configuration

## Performance Tuning

### Increase Node.js memory (if needed)
```bash
# Edit systemd service
systemctl edit stockflow

# Add under [Service]:
Environment="NODE_OPTIONS=--max-old-space-size=2048"
```

### nginx compression
Add to nginx config:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### Monitor performance
```bash
# Top process by memory/CPU
top

# Connection count
ss -s

# Nginx request rate
tail -f /var/log/nginx/access.log | head -20
```

## Useful Commands

```bash
# Service management
systemctl start stockflow
systemctl stop stockflow
systemctl restart stockflow
systemctl status stockflow

# View logs
journalctl -u stockflow -f
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check ports
ss -tlnp
lsof -i :3000
lsof -i :80

# npm operations
npm run build      # Build before restart
npm outdated       # Check for updates
npm audit         # Check security
```

## Next Steps

1. ✅ Create admin user: SSH into server and run setup steps
2. ✅ Test the deployed app at `https://your-domain.com`
3. ✅ Setup monitoring alerts
4. ✅ Document your backup procedure
5. ✅ Schedule regular security updates

## Support

For issues:
- Check logs: `journalctl -u stockflow -f`
- Verify Firebase credentials
- Ensure Gemini API key is valid
- Check [Firebase Status](https://www.firebase.google.com/status)

---

**Deployment complete!** Your StockFlow app is now live! 🎉
