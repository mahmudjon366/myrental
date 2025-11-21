# 🚀 Tezkor Deploy Buyruqlari

## VPS da ishlatish uchun buyruqlar ketma-ketligi:

### 1. Loyihani VPS ga yuklash
```bash
git clone https://github.com/mahmudjon366/rentacloud.git
cd rentacloud
```

### 2. Dependencies o'rnatish
```bash
npm run install-all
```

### 3. Environment fayllarini sozlash
```bash
# Backend .env
cd backend
cp .env.example .env
nano .env

# Frontend .env
cd ../frontend  
cp .env.example .env.local
nano .env.local
```

### 4. Frontend build qilish
```bash
npm run build
```

### 5. PM2 bilan backend ishga tushirish
```bash
cd ..
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Nginx sozlash
```bash
sudo cp nginx-config.conf /etc/nginx/sites-available/rentacloud
sudo ln -s /etc/nginx/sites-available/rentacloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Status tekshirish
```bash
pm2 status
pm2 logs
```

## Muhim eslatmalar:

1. **MongoDB** ishlab turganiga ishonch hosil qiling
2. **Domain/IP** manzilini frontend/.env.local da to'g'ri kiriting  
3. **Firewall** portlarini oching (80, 443, 4000)
4. **SSL sertifikat** o'rnating (Let's Encrypt)

## Muammolarni hal qilish:

```bash
# Portlarni tekshirish
sudo netstat -tlnp | grep :4000
sudo netstat -tlnp | grep :80

# Nginx test
sudo nginx -t

# PM2 restart
pm2 restart all

# Logs ko'rish
pm2 logs rentacloud-backend
sudo tail -f /var/log/nginx/error.log
```