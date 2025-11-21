# 🚀 VPS'ga Deploy Qilish - myrental.uz

## 📋 Ma'lumotlar
- **Domen:** myrental.uz
- **IP:** 5.182.26.17
- **Backend Port:** 4000
- **Database:** MongoDB Atlas (cloud)

## 1️⃣ VPS'ga Ulanish

```bash
ssh root@5.182.26.17
# yoki
ssh ubuntu@5.182.26.17
```

## 2️⃣ Tizimni Yangilash

```bash
# Sistema yangilash
sudo apt update && sudo apt upgrade -y

# Kerakli paketlar
sudo apt install -y curl wget git nginx
```

## 3️⃣ Node.js O'rnatish

```bash
# Node.js 18 o'rnatish
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Versiyani tekshirish
node --version
npm --version
```

## 4️⃣ PM2 O'rnatish

```bash
# PM2 global o'rnatish
sudo npm install -g pm2

# PM2 versiyani tekshirish
pm2 --version
```

## 5️⃣ Loyihani Klonlash

```bash
# Home papkaga o'tish
cd ~

# Loyihani klonlash
git clone https://github.com/mahmudjon366/rentacloud.git

# Papkaga kirish
cd rentacloud

# Dependencies o'rnatish
npm run install-all
```

## 6️⃣ Environment Variables Sozlash

### Backend .env

```bash
cd ~/rentacloud/backend
nano .env
```

Quyidagi ma'lumotlarni kiriting:

```env
# Database (MongoDB Atlas)
MONGO_URL=mongodb+srv://mahmudjon:98txFWYWe9BLVGkM@cluster0.gaoak2c.mongodb.net/rentacloudorg?retryWrites=true&w=majority&appName=Cluster0

# Server
PORT=4000
NODE_ENV=production

# Security
JWT_SECRET=myrental-uz-super-secret-jwt-key-2025-production-secure-32chars
JWT_EXPIRES_IN=7d

# Admin User
ADMIN_USERNAME=admin
ADMIN_PASSWORD=MyRental2025!Secure

# CORS
CORS_ORIGIN=https://myrental.uz,https://www.myrental.uz,http://myrental.uz,http://www.myrental.uz

# Logging
LOG_LEVEL=info
```

Saqlash: `Ctrl+O`, `Enter`, `Ctrl+X`

### Frontend .env.local

```bash
cd ~/rentacloud/frontend
nano .env.local
```

```env
# API Configuration
VITE_API_BASE=https://myrental.uz/api

# Application
VITE_APP_NAME=MyRental
VITE_APP_VERSION=1.0.0
```

Saqlash: `Ctrl+O`, `Enter`, `Ctrl+X`

## 7️⃣ Database Initialization

```bash
cd ~/rentacloud/backend
npm run init-db
```

Bu admin user va database indexes yaratadi.

## 8️⃣ Frontend Build

```bash
cd ~/rentacloud/frontend
npm run build

# Build muvaffaqiyatli bo'lganini tekshiring
ls -la dist/
```

## 9️⃣ Backend Ishga Tushirish

```bash
cd ~/rentacloud

# PM2 bilan ishga tushirish
pm2 start ecosystem.config.js --env production

# PM2 ni avtomatik ishga tushirish
pm2 startup
pm2 save

# Status tekshirish
pm2 status

# Logs ko'rish
pm2 logs rentacloud-backend --lines 50
```

## 🔟 Nginx Sozlash

### A. Nginx konfiguratsiyasini nusxalash

```bash
cd ~/rentacloud

# Konfiguratsiya faylini nusxalash
sudo cp nginx-rentacloud.conf /etc/nginx/sites-available/myrental

# Default saytni o'chirish
sudo rm /etc/nginx/sites-enabled/default

# MyRental saytini yoqish
sudo ln -s /etc/nginx/sites-available/myrental /etc/nginx/sites-enabled/

# Konfiguratsiyani tekshirish
sudo nginx -t
```

### B. Nginx'ni ishga tushirish

```bash
# Nginx restart
sudo systemctl restart nginx

# Status tekshirish
sudo systemctl status nginx

# Avtomatik ishga tushirish
sudo systemctl enable nginx
```

## 1️⃣1️⃣ Firewall Sozlash

```bash
# UFW yoqish
sudo ufw enable

# Portlarni ochish
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS

# Status
sudo ufw status
```

## 1️⃣2️⃣ Saytni Tekshirish

### Brauzerda:
```
http://myrental.uz
http://www.myrental.uz
```

### Terminalda:
```bash
# Frontend
curl http://myrental.uz

# Backend API
curl http://myrental.uz/api/products

# Health check
curl http://myrental.uz/health
```

## 1️⃣3️⃣ SSL Sertifikat (HTTPS)

```bash
# Certbot o'rnatish
sudo apt install certbot python3-certbot-nginx -y

# SSL sertifikat olish
sudo certbot --nginx -d myrental.uz -d www.myrental.uz

# Savollar:
# Email: sizning emailingiz
# Terms: A (agree)
# Redirect HTTP to HTTPS: 2 (yes)

# Avtomatik yangilanishni tekshirish
sudo certbot renew --dry-run
```

SSL o'rnatilgandan keyin:
```
https://myrental.uz
https://www.myrental.uz
```

## 🔍 Monitoring

### Logs ko'rish

```bash
# PM2 logs
pm2 logs

# Nginx access logs
sudo tail -f /var/log/nginx/myrental-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/myrental-error.log

# System logs
sudo journalctl -u nginx -f
```

### Status tekshirish

```bash
# Backend
pm2 status

# Nginx
sudo systemctl status nginx

# Portlar
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :4000

# Disk space
df -h

# Memory
free -h
```

## 🔄 Yangilash (Update)

```bash
cd ~/rentacloud

# Backup current state
git stash

# Pull latest changes
git pull origin main

# Update dependencies
npm run install-all

# Rebuild frontend
cd frontend && npm run build && cd ..

# Restart backend
pm2 restart rentacloud-backend

# Reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

## 🚨 Muammolarni Hal Qilish

### Backend ishlamayapti
```bash
pm2 logs rentacloud-backend
pm2 restart rentacloud-backend
```

### Nginx 502 xatosi
```bash
# Backend ishlab turganini tekshiring
pm2 status

# Nginx logs
sudo tail -f /var/log/nginx/myrental-error.log
```

### Frontend ko'rinmayapti
```bash
# Build mavjudligini tekshiring
ls -la ~/rentacloud/frontend/dist/

# Qayta build
cd ~/rentacloud/frontend
npm run build
```

### Database ulanmayapti
```bash
# .env faylini tekshiring
cat ~/rentacloud/backend/.env | grep MONGO_URL

# Backend logs
pm2 logs rentacloud-backend
```

## ✅ Tayyor!

Saytingiz endi ishlaydi:
- **Frontend:** http://myrental.uz
- **Backend API:** http://myrental.uz/api
- **Health:** http://myrental.uz/health

SSL o'rnatgandan keyin:
- **Frontend:** https://myrental.uz
- **Backend API:** https://myrental.uz/api

## 📞 Yordam

Muammolar yuzaga kelsa:
- Logs tekshiring: `pm2 logs` va `sudo tail -f /var/log/nginx/error.log`
- Health check: `curl http://myrental.uz/health`
- Backend test: `curl http://localhost:4000/health`

---

**Omad! 🚀**
