#!/bin/bash

# VPS'da Rentacloud loyihani sozlash scripti

echo "🚀 Rentacloud VPS Setup"
echo "======================="

# 1. Eski papkani backup qilish
if [ -d "renta30.10" ]; then
    echo "📦 Eski papka topildi, backup qilinmoqda..."
    mv renta30.10 renta30.10.backup.$(date +%Y%m%d_%H%M%S)
fi

# 2. GitHub'dan clone qilish
echo "📥 GitHub'dan yuklanmoqda..."
git clone https://github.com/mahmudjon366/renta30.10.git
cd renta30.10

# 3. Backend .env yaratish
echo "⚙️  Backend .env yaratilmoqda..."
cat > backend/.env << 'EOF'
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

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
EOF

# 4. Frontend .env yaratish
echo "⚙️  Frontend .env yaratilmoqda..."
cat > frontend/.env << 'EOF'
VITE_API_BASE=http://localhost:4000/api
EOF

# 5. Dependencies o'rnatish
echo "📦 Dependencies o'rnatilmoqda..."
npm run build

# 6. PM2 bilan ishga tushirish
echo "🚀 PM2 bilan ishga tushirilmoqda..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# 7. Status
echo ""
echo "✅ Setup yakunlandi!"
echo ""
echo "📊 Status:"
pm2 status

echo ""
echo "📝 Keyingi qadamlar:"
echo "1. Backend .env faylida CORS_ORIGIN'ni VPS IP bilan yangilang"
echo "2. Frontend .env faylida VITE_API_BASE'ni VPS IP bilan yangilang"
echo "3. JWT_SECRET va ADMIN_PASSWORD'ni o'zgartiring"
echo ""
echo "Loglarni ko'rish: pm2 logs"
echo "Statusni ko'rish: pm2 status"
