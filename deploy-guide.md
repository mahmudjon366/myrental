# 🚀 VPS Deploy Guide - Rentacloud

## VPS Talablari
- Ubuntu 20.04+ yoki CentOS 7+
- 2GB RAM (minimum)
- 20GB disk space
- Root yoki sudo huquqlari

## 1. VPS ni tayyorlash

### Node.js o'rnatish
```bash
# NodeSource repository qo'shish
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Node.js o'rnatish
sudo apt-get install -y nodejs

# Versiyani tekshirish
node --version
npm --version
```

### MongoDB o'rnatish
```bash
# MongoDB GPG key import qilish
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# MongoDB repository qo'shish
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Package list yangilash
sudo apt-get update

# MongoDB o'rnatish
sudo apt-get install -y mongodb-org

# MongoDB xizmatini ishga tushirish
sudo systemctl start mongod
sudo systemctl enable mongod
```

### PM2 o'rnatish (Process Manager)
```bash
sudo npm install -g pm2
```

### Nginx o'rnatish (Reverse Proxy)
```bash
sudo apt-get install -y nginx
```

## 2. Loyihani VPS ga yuklash

```bash
# Git o'rnatish (agar yo'q bo'lsa)
sudo apt-get install -y git

# Loyihani klonlash
git clone https://github.com/mahmudjon366/rentacloud.git
cd rentacloud

# Dependencies o'rnatish
npm run install-all
```

## 3. Environment Variables sozlash

### Backend .env
```bash
cd backend
cp .env.example .env
nano .env
```

`.env` faylini quyidagicha o'zgartiring:
```env
MONGO_URL=mongodb://localhost:27017/rentacloudorg
PORT=4000
JWT_SECRET=your-super-secure-jwt-secret-key-for-production
NODE_ENV=production
```

### Frontend .env
```bash
cd ../frontend
cp .env.example .env.local
nano .env.local
```

`.env.local` faylini quyidagicha o'zgartiring:
```env
VITE_API_BASE=http://your-server-ip:4000/api
```

## 4. Frontend build qilish

```bash
cd frontend
npm run build
```

## 5. PM2 bilan backend ishga tushirish

```bash
cd ../backend

# PM2 ecosystem fayl yaratish
pm2 ecosystem
```

## 6. Nginx sozlash

Nginx konfiguratsiya fayli yaratish:
```bash
sudo nano /etc/nginx/sites-available/rentacloud
```

## 7. SSL sertifikat (Let's Encrypt)

```bash
# Certbot o'rnatish
sudo apt-get install -y certbot python3-certbot-nginx

# SSL sertifikat olish
sudo certbot --nginx -d your-domain.com
```

## 8. Firewall sozlash

```bash
# UFW firewall yoqish
sudo ufw enable

# Kerakli portlarni ochish
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 4000  # Backend API (ixtiyoriy)
```

## 9. Monitoring va Logs

```bash
# PM2 logs ko'rish
pm2 logs

# PM2 status
pm2 status

# PM2 restart
pm2 restart all

# PM2 ni system startup ga qo'shish
pm2 startup
pm2 save
```

## 10. Database backup

```bash
# MongoDB backup
mongodump --db rentacloudorg --out /backup/mongodb/

# Cron job qo'shish backup uchun
crontab -e
# Har kuni soat 2:00 da backup
0 2 * * * mongodump --db rentacloudorg --out /backup/mongodb/$(date +\%Y\%m\%d)
```

## Troubleshooting

### Portlarni tekshirish
```bash
sudo netstat -tlnp | grep :4000
sudo netstat -tlnp | grep :80
```

### Nginx test
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### MongoDB status
```bash
sudo systemctl status mongod
```

### Logs ko'rish
```bash
# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# PM2 logs
pm2 logs rentacloud-backend

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```