# ⚡ VPS'da Tezkor Sozlash

## VPS'ga kirish
```bash
ssh root@vps06922
```

## 1. Eski papkani o'chirish
```bash
cd ~
rm -rf renta30.10
```

## 2. GitHub'dan yangi clone qilish
```bash
git clone https://github.com/mahmudjon366/renta30.10.git
cd renta30.10
```

## 3. Backend .env yaratish
```bash
cat > backend/.env << 'EOF'
MONGO_URL=mongodb+srv://mahmudjon:98txFWYWe9BLVGkM@cluster0.gaoak2c.mongodb.net/rentacloudorg?retryWrites=true&w=majority&appName=Cluster0
PORT=4000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
EOF
```

## 4. Frontend .env yaratish
```bash
cat > frontend/.env << 'EOF'
VITE_API_BASE=http://localhost:4000/api
EOF
```

## 5. Dependencies o'rnatish va build qilish
```bash
npm run build
```

## 6. PM2 bilan ishga tushirish
```bash
pm2 stop all
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

## 7. Tekshirish
```bash
pm2 status
pm2 logs
```

## Tayyor! ✅

Brauzerda: `http://vps-ip:5173`
