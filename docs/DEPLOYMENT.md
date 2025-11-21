# 🚀 Rentacloud Production Deployment Guide

Bu qo'llanma Rentacloud ijara boshqaruv tizimini production muhitiga deploy qilish uchun to'liq yo'riqnoma.

## 📋 Talablar

### Server Talablari
- **OS**: Ubuntu 20.04+ (tavsiya etiladi)
- **RAM**: Minimum 2GB, tavsiya 4GB+
- **CPU**: 2 core minimum
- **Disk**: 20GB+ bo'sh joy
- **Network**: Internet aloqasi

### Dasturiy Ta'minot
- Node.js 18+
- MongoDB 7.0+
- Nginx
- PM2
- Git

## 🔧 Avtomatik Deployment

### Tez Deployment (Tavsiya etiladi)

```bash
# Repository'ni klonlash
git clone https://github.com/mahmudjon366/rentacloud.git
cd rentacloud

# Avtomatik deployment script'ni ishga tushirish
bash auto-deploy-vps.sh
```

Bu script quyidagilarni avtomatik bajaradi:
- Barcha kerakli dasturlarni o'rnatadi
- Loyihani sozlaydi
- Environment fayllarini yaratadi
- Xizmatlarni ishga tushiradi

## 📝 Qo'lda Deployment

### 1-qadam: Server Tayyorlash

```bash
# Sistema yangilash
sudo apt update && sudo apt upgrade -y

# Kerakli paketlarni o'rnatish
sudo apt install -y curl wget gnupg2 software-properties-common
```

### 2-qadam: Node.js O'rnatish

```bash
# NodeSource repository qo'shish
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Node.js o'rnatish
sudo apt-get install -y nodejs

# Versiyani tekshirish
node --version
npm --version
```

### 3-qadam: MongoDB O'rnatish

```bash
# MongoDB GPG key import qilish
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# MongoDB repository qo'shish
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# MongoDB o'rnatish
sudo apt-get update
sudo apt-get install -y mongodb-org

# MongoDB ishga tushirish
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 4-qadam: PM2 O'rnatish

```bash
# PM2 global o'rnatish
sudo npm install -g pm2

# PM2 versiyani tekshirish
pm2 --version
```

### 5-qadam: Nginx O'rnatish

```bash
# Nginx o'rnatish
sudo apt-get install -y nginx

# Nginx ishga tushirish
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6-qadam: Loyihani Klonlash

```bash
# Loyihani klonlash
git clone https://github.com/mahmudjon366/rentacloud.git
cd rentacloud

# Dependencies o'rnatish
npm run install-all
```

### 7-qadam: Environment Variables Sozlash

#### Backend Environment (.env)
```bash
cd backend
cp .env.example .env
nano .env
```

`.env` faylini quyidagicha to'ldiring:
```env
# Database
MONGO_URL=mongodb://localhost:27017/rentacloudorg

# Server
PORT=4000
NODE_ENV=production

# Security
JWT_SECRET=your-super-secure-jwt-secret-here-32-chars-minimum
JWT_EXPIRES_IN=24h

# Admin User
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password

# CORS
CORS_ORIGIN=https://your-domain.com

# Logging
LOG_LEVEL=info
```

#### Frontend Environment (.env.local)
```bash
cd ../frontend
cp .env.example .env.local
nano .env.local
```

`.env.local` faylini to'ldiring:
```env
# API Configuration
VITE_API_BASE=https://your-domain.com/api

# Application
VITE_APP_NAME=Rentacloud
VITE_APP_VERSION=1.0.0
```

### 8-qadam: Database Initialization

```bash
# Database va admin user yaratish
cd backend
npm run init-db
```

### 9-qadam: Frontend Build

```bash
cd ../frontend
npm run build
```

### 10-qadam: PM2 bilan Backend Ishga Tushirish

```bash
cd ..
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 11-qadam: Nginx Konfiguratsiya

```bash
# Nginx konfiguratsiya faylini nusxalash
sudo cp nginx-config.conf /etc/nginx/sites-available/rentacloud

# Domain/IP manzilini o'zgartirish
sudo nano /etc/nginx/sites-available/rentacloud
# server_name qatorida your-domain.com ni o'z domeningiz bilan almashtiring

# Saytni yoqish
sudo ln -s /etc/nginx/sites-available/rentacloud /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Nginx konfiguratsiyasini tekshirish
sudo nginx -t

# Nginx qayta yuklash
sudo systemctl reload nginx
```

### 12-qadam: Firewall Sozlash

```bash
# UFW yoqish
sudo ufw enable

# Kerakli portlarni ochish
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 4000  # Backend (ixtiyoriy)

# Status tekshirish
sudo ufw status
```

### 13-qadam: SSL Sertifikat (Let's Encrypt)

```bash
# Certbot o'rnatish
sudo apt install certbot python3-certbot-nginx

# SSL sertifikat olish
sudo certbot --nginx -d your-domain.com

# Avtomatik yangilanishni tekshirish
sudo certbot renew --dry-run
```

## 🔍 Deployment Tekshirish

### Xizmatlar Holati
```bash
# MongoDB
sudo systemctl status mongod

# Nginx
sudo systemctl status nginx

# PM2
pm2 status

# Portlar
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :4000
```

### Health Check
```bash
# Backend API
curl http://localhost:4000/health

# Frontend
curl http://localhost/

# Database
mongo --eval "db.adminCommand('ismaster')"
```

## 📊 Monitoring va Maintenance

### Loglarni Ko'rish
```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# System logs
sudo journalctl -u mongod -f
```

### Performance Monitoring
```bash
# System resources
htop
df -h
free -h

# PM2 monitoring
pm2 monit

# Nginx status
sudo systemctl status nginx
```

### Database Backup
```bash
# Manual backup
npm run backup --prefix backend

# Automated backup (crontab)
crontab -e
# Add: 0 2 * * * cd /path/to/rentacloud && npm run backup --prefix backend
```

## 🔄 Updates va Maintenance

### Code Update
```bash
cd /path/to/rentacloud

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

# Reload nginx (if config changed)
sudo nginx -t && sudo systemctl reload nginx
```

### Database Migration
```bash
# Backup before migration
npm run backup --prefix backend

# Run migration scripts (if any)
npm run migrate --prefix backend
```

## 🚨 Troubleshooting

### Umumiy Muammolar

#### 1. Backend ishlamayapti
```bash
# PM2 status tekshirish
pm2 status

# Logs ko'rish
pm2 logs rentacloud-backend

# Restart
pm2 restart rentacloud-backend
```

#### 2. Database ulanmayapti
```bash
# MongoDB status
sudo systemctl status mongod

# MongoDB restart
sudo systemctl restart mongod

# Connection test
mongo --eval "db.adminCommand('ping')"
```

#### 3. Nginx 502/503 xatolari
```bash
# Nginx logs
sudo tail -f /var/log/nginx/error.log

# Backend port tekshirish
sudo netstat -tlnp | grep :4000

# Nginx config test
sudo nginx -t
```

#### 4. SSL muammolari
```bash
# Certbot status
sudo certbot certificates

# SSL renewal
sudo certbot renew

# Nginx SSL config
sudo nginx -t
```

### Performance Issues

#### Sekin API responses
```bash
# Database indexes tekshirish
mongo rentacloudorg --eval "db.products.getIndexes()"

# PM2 memory usage
pm2 monit

# System resources
htop
```

#### High memory usage
```bash
# PM2 restart with memory limit
pm2 restart rentacloud-backend --max-memory-restart 1G

# Database memory
mongo --eval "db.serverStatus().mem"
```

## 📞 Support

Muammolar yuzaga kelganda:

1. **Logs tekshiring**: PM2, Nginx, MongoDB loglarini ko'ring
2. **Health check**: `/health` endpoint orqali system holatini tekshiring
3. **Resources**: Server resurslarini monitoring qiling
4. **Backup**: Har doim backup mavjudligini tekshiring

### Kontakt Ma'lumotlari
- **Telefon**: +998 91 975 27 57
- **Email**: support@rentacloud.uz
- **GitHub**: https://github.com/mahmudjon366/rentacloud

---

**Eslatma**: Bu qo'llanma production muhit uchun mo'ljallangan. Development uchun `npm run dev` buyrug'ini ishlating.