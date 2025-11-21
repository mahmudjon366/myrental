# 🔧 Rentacloud Troubleshooting Guide

Bu qo'llanma Rentacloud tizimida yuzaga kelishi mumkin bo'lgan muammolar va ularning yechimlarini o'z ichiga oladi.

## 🚨 Tez Yechimlar

### Tizim To'liq Ishlamayapti
```bash
# Barcha xizmatlarni qayta ishga tushirish
sudo systemctl restart mongod
sudo systemctl restart nginx
pm2 restart all

# Status tekshirish
sudo systemctl status mongod nginx
pm2 status
```

### Ma'lumotlar Yo'qolgan
```bash
# Eng oxirgi backup'ni tiklash
cd /path/to/rentacloud
npm run restore --prefix backend backup-name

# Database holatini tekshirish
mongo rentacloudorg --eval "db.products.count()"
```

## 🔍 Diagnostika

### System Health Check
```bash
#!/bin/bash
echo "=== RENTACLOUD HEALTH CHECK ==="

# 1. System Resources
echo "1. System Resources:"
echo "Memory: $(free -h | grep Mem | awk '{print $3"/"$2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $3"/"$2" ("$5" used)"}')"
echo "CPU Load: $(uptime | awk -F'load average:' '{print $2}')"

# 2. Services Status
echo -e "\n2. Services Status:"
echo "MongoDB: $(sudo systemctl is-active mongod)"
echo "Nginx: $(sudo systemctl is-active nginx)"
echo "PM2: $(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null || echo 'unknown')"

# 3. Network Connectivity
echo -e "\n3. Network:"
echo "Port 80: $(sudo netstat -tlnp | grep :80 | wc -l) connections"
echo "Port 4000: $(sudo netstat -tlnp | grep :4000 | wc -l) connections"

# 4. Application Health
echo -e "\n4. Application:"
curl -s http://localhost:4000/health | jq -r '.status' 2>/dev/null || echo "API not responding"

echo -e "\n=== END HEALTH CHECK ==="
```

## 🐛 Backend Muammolari

### 1. Server Ishga Tushmayapti

**Alomatlar:**
- PM2 status "errored" yoki "stopped"
- API endpoints javob bermayapti
- 502/503 xatolari

**Diagnostika:**
```bash
# PM2 logs ko'rish
pm2 logs rentacloud-backend --lines 50

# Manual ishga tushirish
cd /path/to/rentacloud/backend
node src/index.js
```

**Yechimlar:**

#### Environment Variables Muammosi
```bash
# .env faylini tekshirish
cd backend
cat .env

# Kerakli o'zgaruvchilar mavjudligini tekshirish
grep -E "MONGO_URL|JWT_SECRET|PORT" .env
```

#### Port Band Bo'lgan
```bash
# Port 4000 ni kim ishlatayotganini topish
sudo lsof -i :4000

# Jarayonni to'xtatish
sudo kill -9 <PID>

# PM2 restart
pm2 restart rentacloud-backend
```

#### Dependencies Muammosi
```bash
# Node modules qayta o'rnatish
cd backend
rm -rf node_modules package-lock.json
npm install

# PM2 restart
pm2 restart rentacloud-backend
```

### 2. Database Ulanish Muammolari

**Alomatlar:**
- "MongooseServerSelectionError"
- "ECONNREFUSED" xatolari
- Database operations ishlamayapti

**Diagnostika:**
```bash
# MongoDB status
sudo systemctl status mongod

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Manual connection test
mongo --eval "db.adminCommand('ping')"
```

**Yechimlar:**

#### MongoDB Ishlamayapti
```bash
# MongoDB restart
sudo systemctl restart mongod

# Status tekshirish
sudo systemctl status mongod

# Agar ishga tushmasa, config tekshirish
sudo nano /etc/mongod.conf
```

#### Disk Joy Yetishmayapti
```bash
# Disk joy tekshirish
df -h

# MongoDB data directory
sudo du -sh /var/lib/mongodb/

# Eski loglarni tozalash
sudo find /var/log/mongodb/ -name "*.log.*" -mtime +7 -delete
```

#### Connection String Noto'g'ri
```bash
# .env da MONGO_URL tekshirish
grep MONGO_URL backend/.env

# To'g'ri format:
# MONGO_URL=mongodb://localhost:27017/rentacloudorg
```

### 3. Authentication Muammolari

**Alomatlar:**
- Login ishlamayapti
- JWT token xatolari
- 401/403 responses

**Diagnostika:**
```bash
# JWT secret tekshirish
grep JWT_SECRET backend/.env

# Admin user mavjudligini tekshirish
mongo rentacloudorg --eval "db.users.find()"
```

**Yechimlar:**

#### Admin User Yo'q
```bash
# Admin user yaratish
cd backend
npm run seed-admin

# Yoki manual:
node src/scripts/seedShoxruxUser.js
```

#### JWT Secret Noto'g'ri
```bash
# Yangi JWT secret generatsiya qilish
openssl rand -base64 32

# .env da yangilash
nano backend/.env
# JWT_SECRET=yangi-secret-key

# Backend restart
pm2 restart rentacloud-backend
```

## 🌐 Frontend Muammolari

### 1. Sahifa Yuklanmayapti

**Alomatlar:**
- Oq sahifa
- JavaScript xatolari
- 404 xatolari

**Diagnostika:**
```bash
# Build files mavjudligini tekshirish
ls -la frontend/dist/

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

**Yechimlar:**

#### Build Yo'q yoki Buzilgan
```bash
# Frontend qayta build qilish
cd frontend
rm -rf dist/
npm run build

# Build files tekshirish
ls -la dist/
```

#### Nginx Konfiguratsiya Muammosi
```bash
# Nginx config test
sudo nginx -t

# Config file tekshirish
sudo nano /etc/nginx/sites-available/rentacloud

# Nginx restart
sudo systemctl restart nginx
```

### 2. API Calls Ishlamayapti

**Alomatlar:**
- Network errors
- CORS xatolari
- API responses yo'q

**Diagnostika:**
```bash
# Frontend .env.local tekshirish
cat frontend/.env.local

# API endpoint test
curl http://localhost:4000/api/products
```

**Yechimlar:**

#### API URL Noto'g'ri
```bash
# .env.local da API URL tekshirish
grep VITE_API_BASE frontend/.env.local

# To'g'ri format:
# VITE_API_BASE=http://your-server-ip:4000/api
```

#### CORS Muammosi
```bash
# Backend CORS settings tekshirish
grep -A 10 "cors" backend/src/index.js

# .env da CORS_ORIGIN tekshirish
grep CORS_ORIGIN backend/.env
```

## 🗄️ Database Muammolari

### 1. Ma'lumotlar Yo'qolgan

**Yechimlar:**
```bash
# Backup mavjudligini tekshirish
ls -la backups/

# Eng oxirgi backup'ni tiklash
npm run restore --prefix backend backup-name

# Manual restore
mongorestore --db rentacloudorg backups/backup-folder/rentacloudorg/
```

### 2. Sekin Database Queries

**Diagnostika:**
```bash
# Database stats
mongo rentacloudorg --eval "db.stats()"

# Slow queries log
mongo rentacloudorg --eval "db.setProfilingLevel(2, {slowms: 100})"
```

**Yechimlar:**

#### Indexes Yo'q
```bash
# Indexes yaratish
cd backend
npm run init-db

# Manual indexes
mongo rentacloudorg --eval "
db.products.createIndex({name: 1});
db.products.createIndex({createdAt: -1});
"
```

#### Memory Yetishmayapti
```bash
# MongoDB memory usage
mongo --eval "db.serverStatus().mem"

# System memory
free -h

# MongoDB cache size sozlash
sudo nano /etc/mongod.conf
# storage.wiredTiger.engineConfig.cacheSizeGB: 1
```

## 🔒 Security Muammolari

### 1. Suspicious Activity

**Diagnostika:**
```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log | grep -E "40[0-9]|50[0-9]"

# Failed login attempts
pm2 logs | grep -i "auth\|login\|fail"

# System auth logs
sudo tail -f /var/log/auth.log
```

**Yechimlar:**

#### IP Blocking
```bash
# Suspicious IP'larni bloklash
sudo ufw deny from suspicious-ip

# Nginx rate limiting
sudo nano /etc/nginx/sites-available/rentacloud
# limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

#### Password Reset
```bash
# Admin parolini o'zgartirish
cd backend
ADMIN_PASSWORD=new-secure-password npm run seed-admin
```

## 📊 Performance Muammolari

### 1. Sekin Response Times

**Diagnostika:**
```bash
# API response time test
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:4000/api/products

# curl-format.txt:
#      time_namelookup:  %{time_namelookup}\n
#         time_connect:  %{time_connect}\n
#      time_appconnect:  %{time_appconnect}\n
#     time_pretransfer:  %{time_pretransfer}\n
#        time_redirect:  %{time_redirect}\n
#   time_starttransfer:  %{time_starttransfer}\n
#                     ----------\n
#           time_total:  %{time_total}\n
```

**Yechimlar:**

#### Database Optimization
```bash
# Query performance monitoring
mongo rentacloudorg --eval "db.setProfilingLevel(2, {slowms: 100})"

# Profiling results
mongo rentacloudorg --eval "db.system.profile.find().limit(5).sort({ts:-1}).pretty()"
```

#### Memory Optimization
```bash
# PM2 memory restart
pm2 restart rentacloud-backend --max-memory-restart 1G

# Node.js memory limit
pm2 delete rentacloud-backend
pm2 start ecosystem.config.js --node-args="--max-old-space-size=1024"
```

### 2. High CPU Usage

**Diagnostika:**
```bash
# Process monitoring
htop

# PM2 monitoring
pm2 monit

# Node.js profiling
node --prof backend/src/index.js
```

**Yechimlar:**

#### Code Optimization
```bash
# PM2 cluster mode
pm2 delete rentacloud-backend
pm2 start ecosystem.config.js --instances max
```

## 🔄 Backup va Recovery

### Emergency Recovery Procedure

```bash
#!/bin/bash
echo "🚨 EMERGENCY RECOVERY STARTING..."

# 1. Stop all services
pm2 stop all
sudo systemctl stop nginx

# 2. Backup current state
mkdir -p emergency-backup/$(date +%Y%m%d_%H%M%S)
cp -r backend/.env emergency-backup/$(date +%Y%m%d_%H%M%S)/
mongodump --db rentacloudorg --out emergency-backup/$(date +%Y%m%d_%H%M%S)/

# 3. Restore from last known good backup
read -p "Enter backup name to restore: " backup_name
mongorestore --db rentacloudorg --drop backups/$backup_name/rentacloudorg/

# 4. Restart services
sudo systemctl start nginx
pm2 start all

echo "✅ EMERGENCY RECOVERY COMPLETED"
```

## 📞 Qachon Yordam So'rash Kerak

### Critical Issues (Darhol bog'laning):
- Ma'lumotlar yo'qolgan
- Security breach
- Tizim to'liq ishlamayapti
- Data corruption

### Non-Critical Issues (24 soat ichida):
- Performance issues
- Minor bugs
- Configuration questions

### Kontakt:
- **Telefon**: +998 91 975 27 57
- **Email**: support@rentacloud.uz
- **Telegram**: @rentacloud_support

---

**Eslatma**: Har qanday o'zgarishdan oldin backup oling!