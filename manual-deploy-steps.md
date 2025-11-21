# 📋 Qo'lda Deploy Qilish - Qadam-baqadam

## VPS ga SSH orqali ulanish:
```bash
ssh root@your-server-ip
# yoki
ssh username@your-server-ip
```

## 1-qadam: Avtomatik script ishga tushirish
```bash
# Loyihani yuklash
git clone https://github.com/mahmudjon366/rentacloud.git
cd rentacloud

# Script ruxsatini berish
chmod +x auto-deploy-vps.sh

# Deploy qilish
sudo bash auto-deploy-vps.sh
```

## 2-qadam: Domain sozlash (agar bor bo'lsa)
```bash
# Nginx konfiguratsiyasini tahrirlash
sudo nano /etc/nginx/sites-available/rentacloud

# server_name qatorini o'zgartirish:
server_name your-domain.com www.your-domain.com;

# Nginx qayta yuklash
sudo nginx -t
sudo systemctl reload nginx
```

## 3-qadam: SSL sertifikat olish
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 4-qadam: Tekshirish
```bash
# Xizmatlar holati
pm2 status
sudo systemctl status nginx
sudo systemctl status mongod

# Sayt ishlayotganini tekshirish
curl http://your-server-ip
curl http://your-server-ip:4000/api/products
```

## Muammolarni hal qilish:

### Backend ishlamasa:
```bash
pm2 logs rentacloud-backend
pm2 restart rentacloud-backend
```

### Nginx muammosi:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### MongoDB muammosi:
```bash
sudo systemctl status mongod
sudo tail -f /var/log/mongodb/mongod.log
```

### Portlar band bo'lsa:
```bash
sudo netstat -tlnp | grep :4000
sudo netstat -tlnp | grep :80
```

## Environment o'zgartirish:
```bash
# Backend environment
nano backend/.env

# Frontend environment  
nano frontend/.env.local

# O'zgarishlardan keyin
cd frontend && npm run build && cd ..
pm2 restart rentacloud-backend
```