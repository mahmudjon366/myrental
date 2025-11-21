# 🌐 Nginx Konfiguratsiya Qo'llanmasi

## 1️⃣ Domeningizni Sozlash

### A. Domen DNS Sozlamalari

Domeningizning DNS sozlamalarida A record qo'shing:

```
Type: A
Name: @ (yoki subdomain nomi)
Value: VPS_IP_MANZILI
TTL: 3600
```

Agar `www` subdomain ham kerak bo'lsa:
```
Type: A
Name: www
Value: VPS_IP_MANZILI
TTL: 3600
```

DNS o'zgarishlar 5-30 daqiqa ichida tarqaladi.

### B. DNS Tekshirish

```bash
# Domeningiz IP ga to'g'ri yo'nalganligini tekshiring
nslookup your-domain.com
# yoki
dig your-domain.com
```

## 2️⃣ Nginx Konfiguratsiyasini O'rnatish

### VPS'da quyidagi buyruqlarni bajaring:

```bash
# 1. Loyiha papkasiga o'ting
cd /home/ubuntu/rentacloud
# yoki sizning path'ingiz

# 2. Nginx konfiguratsiya faylini nusxalang
sudo cp nginx-rentacloud.conf /etc/nginx/sites-available/rentacloud

# 3. Faylni tahrirlang
sudo nano /etc/nginx/sites-available/rentacloud
```

### Quyidagilarni o'zgartiring:

**1. Server name (8-9 qator):**
```nginx
server_name your-domain.com www.your-domain.com;
```
O'zgartiring:
```nginx
server_name rentacloud.uz www.rentacloud.uz;
# yoki IP bilan:
server_name 185.217.131.219;
```

**2. Frontend path (55 qator):**
```nginx
root /home/ubuntu/rentacloud/frontend/dist;
```
To'g'ri path'ni yozing (pwd buyrug'i bilan tekshiring)

**3. Saqlang va chiqing:**
- `Ctrl + O` (saqlash)
- `Enter`
- `Ctrl + X` (chiqish)

## 3️⃣ Nginx'ni Faollashtirish

```bash
# 1. Default saytni o'chirish
sudo rm /etc/nginx/sites-enabled/default

# 2. Rentacloud saytini yoqish
sudo ln -s /etc/nginx/sites-available/rentacloud /etc/nginx/sites-enabled/

# 3. Konfiguratsiyani tekshirish
sudo nginx -t

# Agar "syntax is ok" va "test is successful" ko'rsatsa:

# 4. Nginx'ni qayta yuklash
sudo systemctl reload nginx

# 5. Status tekshirish
sudo systemctl status nginx
```

## 4️⃣ Frontend Build Qilish

```bash
# Loyiha papkasida
cd /home/ubuntu/rentacloud

# Frontend build
cd frontend
npm run build

# Build muvaffaqiyatli bo'lganini tekshiring
ls -la dist/
```

## 5️⃣ Backend Ishga Tushirish

```bash
# Backend papkasiga o'ting
cd /home/ubuntu/rentacloud

# PM2 bilan ishga tushiring
pm2 start ecosystem.config.js --env production

# Status tekshirish
pm2 status

# Logs ko'rish
pm2 logs rentacloud-backend
```

## 6️⃣ Firewall Sozlash

```bash
# UFW firewall yoqish
sudo ufw enable

# Kerakli portlarni ochish
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Status tekshirish
sudo ufw status
```

## 7️⃣ Saytni Tekshirish

### Brauzerda:
```
http://your-domain.com
# yoki
http://185.217.131.219
```

### Terminalda:
```bash
# Frontend
curl http://your-domain.com

# Backend API
curl http://your-domain.com/api/products

# Health check
curl http://your-domain.com/health
```

## 8️⃣ SSL Sertifikat O'rnatish (HTTPS)

```bash
# 1. Certbot o'rnatish
sudo apt install certbot python3-certbot-nginx

# 2. SSL sertifikat olish
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Savollar:
# - Email: sizning emailingiz
# - Terms: A (agree)
# - Share email: N (no)
# - Redirect HTTP to HTTPS: 2 (yes)

# 3. Avtomatik yangilanishni tekshirish
sudo certbot renew --dry-run
```

SSL o'rnatilgandan keyin saytingiz HTTPS orqali ishlaydi:
```
https://your-domain.com
```

## 9️⃣ Muammolarni Hal Qilish

### Nginx ishlamayapti:
```bash
# Logs ko'rish
sudo tail -f /var/log/nginx/error.log

# Konfiguratsiyani tekshirish
sudo nginx -t

# Nginx restart
sudo systemctl restart nginx
```

### 502 Bad Gateway:
```bash
# Backend ishlab turganini tekshiring
pm2 status
pm2 logs rentacloud-backend

# Backend restart
pm2 restart rentacloud-backend
```

### 404 Not Found:
```bash
# Frontend build mavjudligini tekshiring
ls -la /home/ubuntu/rentacloud/frontend/dist/

# Agar yo'q bo'lsa, qayta build qiling
cd /home/ubuntu/rentacloud/frontend
npm run build
```

### DNS ishlamayapti:
```bash
# DNS tekshirish
nslookup your-domain.com

# Agar IP noto'g'ri bo'lsa, DNS sozlamalarini tekshiring
# 5-30 daqiqa kuting
```

## 🔟 Environment Variables

Backend `.env` faylida CORS_ORIGIN'ni yangilang:

```bash
sudo nano /home/ubuntu/rentacloud/backend/.env
```

```env
# Domeningiz bilan o'zgartiring
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com

# Yoki IP bilan
CORS_ORIGIN=http://185.217.131.219
```

Backend'ni restart qiling:
```bash
pm2 restart rentacloud-backend
```

## ✅ Tayyor!

Saytingiz endi ishlashi kerak:
- Frontend: http://your-domain.com
- Backend API: http://your-domain.com/api
- Health: http://your-domain.com/health

SSL o'rnatgandan keyin:
- Frontend: https://your-domain.com
- Backend API: https://your-domain.com/api

---

**Yordam kerak bo'lsa:**
- Telegram: @rentacloud_support
- Telefon: +998 91 975 27 57
