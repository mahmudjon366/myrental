# 🚀 VPS'da Bajarish Kerak Bo'lgan Buyruqlar

## 1️⃣ Eski Loyihani O'chirish va Yangi Versiyani Olish

```bash
# Eski rentacloud papkasini o'chirish
cd ~
rm -rf rentacloud

# GitHub'dan yangi versiyani klonlash
git clone https://github.com/mahmudjon366/rentacloud.git

# Papkaga kirish
cd rentacloud

# Fayllarni ko'rish
ls -la
```

## 2️⃣ Dependencies O'rnatish

```bash
# Backend dependencies
cd ~/rentacloud/backend
npm install

# Frontend dependencies
cd ~/rentacloud/frontend
npm install

# Root dependencies (agar kerak bo'lsa)
cd ~/rentacloud
npm install
```

## 3️⃣ Environment Variables Sozlash

### Backend .env

```bash
cd ~/rentacloud/backend
nano .env
```

Quyidagi ma'lumotlarni kiriting:

```env
MONGO_URL=mongodb+srv://mahmudjon:98txFWYWe9BLVGkM@cluster0.gaoak2c.mongodb.net/rentacloudorg?retryWrites=true&w=majority&appName=Cluster0
PORT=4000
NODE_ENV=production
JWT_SECRET=myrental-uz-super-secret-jwt-key-2025-production-secure-32chars
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=MyRental2025!Secure
CORS_ORIGIN=https://myrental.uz,https://www.myrental.uz,http://myrental.uz,http://www.myrental.uz
LOG_LEVEL=info
```

**Saqlash:** `Ctrl+O`, `Enter`, `Ctrl+X`

### Frontend .env.local

```bash
cd ~/rentacloud/frontend
nano .env.local
```

```env
VITE_API_BASE=https://myrental.uz/api
VITE_APP_NAME=MyRental
VITE_APP_VERSION=1.0.0
```

**Saqlash:** `Ctrl+O`, `Enter`, `Ctrl+X`

## 4️⃣ Database Initialization

```bash
cd ~/rentacloud/backend
npm run init-db
```

Bu admin user va database indexes yaratadi.

## 5️⃣ Frontend Build

```bash
cd ~/rentacloud/frontend
npm run build

# Build muvaffaqiyatli bo'lganini tekshirish
ls -la dist/
```

## 6️⃣ Backend Ishga Tushirish (PM2)

```bash
cd ~/rentacloud

# Agar eski PM2 process bo'lsa, to'xtatish
pm2 stop all
pm2 delete all

# Yangi process ishga tushirish
pm2 start ecosystem.config.js --env production

# PM2 ni avtomatik ishga tushirish
pm2 startup
pm2 save

# Status tekshirish
pm2 status

# Logs ko'rish
pm2 logs rentacloud-backend --lines 50
```

## 7️⃣ Nginx Sozlash

```bash
cd ~/rentacloud

# Nginx konfiguratsiyasini nusxalash
sudo cp nginx-rentacloud.conf /etc/nginx/sites-available/myrental

# Default saytni o'chirish (agar mavjud bo'lsa)
sudo rm /etc/nginx/sites-enabled/default

# MyRental saytini yoqish
sudo ln -s /etc/nginx/sites-available/myrental /etc/nginx/sites-enabled/

# Konfiguratsiyani tekshirish
sudo nginx -t

# Nginx restart
sudo systemctl restart nginx

# Status tekshirish
sudo systemctl status nginx
```

## 8️⃣ Firewall Sozlash

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

## 9️⃣ Saytni Tekshirish

### Terminalda:

```bash
# Frontend
curl http://myrental.uz

# Backend API
curl http://myrental.uz/api/products

# Health check
curl http://myrental.uz/health

# Backend to'g'ridan-to'g'ri
curl http://localhost:4000/health
```

### Brauzerda:

```
http://myrental.uz
http://www.myrental.uz
```

## 🔟 SSL Sertifikat O'rnatish (HTTPS)

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

## 🔍 Monitoring va Logs

```bash
# PM2 logs
pm2 logs

# PM2 status
pm2 status

# Nginx access logs
sudo tail -f /var/log/nginx/myrental-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/myrental-error.log

# Backend logs
pm2 logs rentacloud-backend

# System resources
htop
```

## 🚨 Muammolarni Hal Qilish

### Backend ishlamayapti:
```bash
pm2 logs rentacloud-backend
pm2 restart rentacloud-backend
```

### Nginx 502 xatosi:
```bash
# Backend ishlab turganini tekshiring
pm2 status
curl http://localhost:4000/health

# Nginx logs
sudo tail -f /var/log/nginx/myrental-error.log
```

### Frontend ko'rinmayapti:
```bash
# Build mavjudligini tekshiring
ls -la ~/rentacloud/frontend/dist/

# Nginx konfiguratsiyani tekshirish
sudo nginx -t

# Nginx restart
sudo systemctl restart nginx
```

## ✅ Tayyor!

Saytingiz endi ishlashi kerak:
- **Frontend:** http://myrental.uz
- **Backend API:** http://myrental.uz/api
- **Health:** http://myrental.uz/health

SSL o'rnatgandan keyin:
- **Frontend:** https://myrental.uz
- **Backend API:** https://myrental.uz/api

---

**Omad! 🚀**
