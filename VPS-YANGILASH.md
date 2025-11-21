# 🚀 VPS Serverda Loyihani Yangilash

## Muammo
VPS'da `renta30.10` papkasi git repository emas.

## Yechim

### 1. VPS'ga SSH orqali kiring
```bash
ssh root@vps06922
```

### 2. Eski papkani backup qiling (agar kerak bo'lsa)
```bash
cd ~
mv renta30.10 renta30.10.backup
```

### 3. GitHub'dan yangi clone qiling
```bash
git clone https://github.com/mahmudjon366/renta30.10.git
cd renta30.10
```

### 4. Backend .env faylini yarating
```bash
nano backend/.env
```

Quyidagilarni kiriting:
```env
# MongoDB Atlas
MONGO_URL=mongodb+srv://mahmudjon:98txFWYWe9BLVGkM@cluster0.gaoak2c.mongodb.net/rentacloudorg?retryWrites=true&w=majority&appName=Cluster0

# Server
PORT=4000
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters-for-production-security
JWT_EXPIRES_IN=7d

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password-in-production-immediately

# CORS - VPS IP yoki domain
CORS_ORIGIN=http://your-vps-ip:5173,http://localhost:5173

# Logging
LOG_LEVEL=info
```

`Ctrl + X`, keyin `Y`, keyin `Enter` bosing.

### 5. Frontend .env faylini yarating
```bash
nano frontend/.env
```

Quyidagilarni kiriting:
```env
# VPS IP yoki domain bilan
VITE_API_BASE=http://your-vps-ip:4000/api
```

`Ctrl + X`, keyin `Y`, keyin `Enter` bosing.

### 6. Dependencies o'rnating va build qiling
```bash
npm run build
```

### 7. PM2 bilan ishga tushiring
```bash
# Agar eski process ishlayotgan bo'lsa, to'xtating
pm2 stop all
pm2 delete all

# Yangi process'larni ishga tushiring
pm2 start ecosystem.config.js
pm2 save
```

### 8. Statusni tekshiring
```bash
pm2 status
pm2 logs
```

## Tezkor Yangilash (keyingi safar)

Agar git repository to'g'ri sozlangan bo'lsa:

```bash
cd ~/renta30.10
git pull origin main
npm run build
pm2 restart all
```

## Nginx sozlash (agar kerak bo'lsa)

Agar domain bilan ishlatmoqchi bo'lsangiz:

```bash
nano /etc/nginx/sites-available/rentacloud
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/rentacloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Xavfsizlik

⚠️ **MUHIM**: 
- `.env` fayllarini git'ga commit qilmang
- Production'da kuchli JWT_SECRET ishlating
- ADMIN_PASSWORD'ni o'zgartiring
- Firewall sozlang

## Muammolar

### Port band bo'lsa:
```bash
# Port 4000
lsof -i :4000
kill -9 <PID>

# Port 5173
lsof -i :5173
kill -9 <PID>
```

### PM2 ishlamasa:
```bash
pm2 logs --err
pm2 restart all
```

### MongoDB ulanmasa:
```bash
node backend/test-mongodb-connection.js
```

## Foydali buyruqlar

```bash
# PM2 status
pm2 status
pm2 logs
pm2 monit

# Nginx
sudo systemctl status nginx
sudo nginx -t
sudo systemctl reload nginx

# Disk space
df -h

# Memory
free -h
```
