#!/bin/bash

# Rentacloud VPS Deploy Script
# Bu script loyihani VPS da deploy qilish uchun

set -e  # Xato bo'lsa to'xtatish

echo "🚀 Rentacloud VPS Deploy boshlandi..."

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funksiyalar
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Dependencies tekshirish
echo "📦 Dependencies tekshirilmoqda..."

if ! command -v node &> /dev/null; then
    print_error "Node.js topilmadi! Iltimos Node.js o'rnating."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm topilmadi! Iltimos npm o'rnating."
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 topilmadi. O'rnatilmoqda..."
    sudo npm install -g pm2
fi

print_success "Dependencies tekshirildi"

# 2. Environment variables tekshirish
echo "🔧 Environment variables tekshirilmoqda..."

if [ ! -f "backend/.env" ]; then
    print_warning "Backend .env fayli topilmadi. Yaratilmoqda..."
    cp backend/.env.example backend/.env
    print_warning "Iltimos backend/.env faylini tahrirlang!"
fi

if [ ! -f "frontend/.env.local" ]; then
    print_warning "Frontend .env.local fayli topilmadi. Yaratilmoqda..."
    cp frontend/.env.example frontend/.env.local
    print_warning "Iltimos frontend/.env.local faylini tahrirlang!"
fi

print_success "Environment variables tekshirildi"

# 3. Dependencies o'rnatish
echo "📥 Dependencies o'rnatilmoqda..."
npm run install-all
print_success "Dependencies o'rnatildi"

# 4. Frontend build qilish
echo "🏗️  Frontend build qilinmoqda..."
cd frontend
npm run build
cd ..
print_success "Frontend build qilindi"

# 5. Logs papkasini yaratish
mkdir -p logs
print_success "Logs papkasi yaratildi"

# 6. PM2 bilan backend ishga tushirish
echo "🚀 Backend PM2 bilan ishga tushirilmoqda..."

# Eski jarayonni to'xtatish (agar mavjud bo'lsa)
pm2 delete rentacloud-backend 2>/dev/null || true

# Yangi jarayonni boshlash
pm2 start ecosystem.config.js
pm2 save

print_success "Backend PM2 bilan ishga tushirildi"

# 7. Status ko'rsatish
echo "📊 Joriy holat:"
pm2 status

echo ""
print_success "Deploy muvaffaqiyatli yakunlandi! 🎉"
echo ""
echo "📝 Keyingi qadamlar:"
echo "1. Nginx konfiguratsiyasini sozlang (nginx-config.conf faylidan foydalaning)"
echo "2. Domain yoki IP manzilini frontend/.env.local da yangilang"
echo "3. SSL sertifikat o'rnating (Let's Encrypt)"
echo "4. Firewall sozlamalarini tekshiring"
echo ""
echo "🔗 Foydali buyruqlar:"
echo "- Logs ko'rish: pm2 logs"
echo "- Status: pm2 status"
echo "- Restart: pm2 restart rentacloud-backend"
echo "- Stop: pm2 stop rentacloud-backend"