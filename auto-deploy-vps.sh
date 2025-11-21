#!/bin/bash

# Rentacloud - To'liq avtomatik VPS deploy script
# Foydalanish: bash auto-deploy-vps.sh
# Ubuntu 20.04+ uchun optimizatsiya qilingan

set -e

# Error handling function
handle_error() {
    local exit_code=$?
    local line_number=$1
    echo -e "\033[0;31m❌ Script failed at line $line_number with exit code $exit_code\033[0m"
    exit $exit_code
}

# Set error trap
trap 'handle_error $LINENO' ERR

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funksiyalar
print_step() {
    echo -e "\n${BLUE}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Konfiguratsiya
PROJECT_NAME="rentacloud"
DOMAIN="example.com"  # Bu yerga o'z domeningizni yozing
DB_NAME="rentacloudorg"
BACKEND_PORT="4000"

echo -e "${GREEN}"
echo "🚀 RENTACLOUD VPS DEPLOY SCRIPT"
echo "================================="
echo -e "${NC}"

# 1. System yangilash
print_step "Sistema yangilanmoqda..."
sudo apt update && sudo apt upgrade -y
print_success "Sistema yangilandi"

# 2. Node.js o'rnatish
print_step "Node.js o'rnatilmoqda..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js o'rnatildi"
else
    print_success "Node.js allaqachon o'rnatilgan"
fi

# 3. MongoDB o'rnatish (zamonaviy usul)
print_step "MongoDB o'rnatilmoqda..."
if ! command -v mongod &> /dev/null; then
    # Import MongoDB public GPG key
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # Add MongoDB repository
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Update package list and install MongoDB
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    
    # Start and enable MongoDB
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    # Verify MongoDB installation
    if sudo systemctl is-active --quiet mongod; then
        print_success "MongoDB o'rnatildi va ishga tushirildi"
    else
        print_error "MongoDB ishga tushmadi!"
    fi
else
    print_success "MongoDB allaqachon o'rnatilgan"
    
    # Ensure MongoDB is running
    if ! sudo systemctl is-active --quiet mongod; then
        sudo systemctl start mongod
        print_warning "MongoDB qayta ishga tushirildi"
    fi
fi

# 4. PM2 o'rnatish
print_step "PM2 o'rnatilmoqda..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 o'rnatildi"
else
    print_success "PM2 allaqachon o'rnatilgan"
fi

# 5. Nginx o'rnatish
print_step "Nginx o'rnatilmoqda..."
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_success "Nginx o'rnatildi va ishga tushirildi"
else
    print_success "Nginx allaqachon o'rnatilgan"
fi

# 6. Git o'rnatish
print_step "Git tekshirilmoqda..."
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
    print_success "Git o'rnatildi"
else
    print_success "Git allaqachon o'rnatilgan"
fi

# 7. Loyihani klonlash yoki yangilash
print_step "Loyiha yuklanmoqda..."
if [ -d "$PROJECT_NAME" ]; then
    print_warning "Loyiha papkasi mavjud. Yangilanmoqda..."
    cd $PROJECT_NAME
    git pull origin main || git pull origin master
else
    git clone https://github.com/mahmudjon366/rentacloud.git
    cd $PROJECT_NAME
fi
print_success "Loyiha yuklandi"

# 8. Dependencies o'rnatish
print_step "Dependencies o'rnatilmoqda..."
npm run install-all
print_success "Dependencies o'rnatildi"

# 9. Environment fayllarini yaratish
print_step "Environment fayllar sozlanmoqda..."

# Backend .env
cat > backend/.env << EOF
MONGO_URL=mongodb://localhost:27017/$DB_NAME
PORT=$BACKEND_PORT
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF

# Frontend .env.local
SERVER_IP=$(curl -s ifconfig.me)
cat > frontend/.env.local << EOF
VITE_API_BASE=http://$SERVER_IP:$BACKEND_PORT/api
VITE_APP_NAME=Rentacloud
EOF

print_success "Environment fayllar yaratildi"

# 10. Frontend build qilish
print_step "Frontend build qilinmoqda..."
cd frontend
npm run build
cd ..
print_success "Frontend build qilindi"

# 11. Logs papkasini yaratish
mkdir -p logs

# 12. PM2 bilan backend ishga tushirish
print_step "Backend PM2 bilan ishga tushirilmoqda..."
pm2 delete $PROJECT_NAME-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup ubuntu -u $USER --hp $HOME
print_success "Backend ishga tushirildi"

# 13. Nginx konfiguratsiyasini sozlash
print_step "Nginx sozlanmoqda..."
PROJECT_PATH=$(pwd)

sudo tee /etc/nginx/sites-available/$PROJECT_NAME << EOF
server {
    listen 80;
    server_name $SERVER_IP $DOMAIN;
    
    # Frontend static files
    location / {
        root $PROJECT_PATH/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# Nginx saytni yoqish
sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

print_success "Nginx sozlandi"

# 14. Firewall sozlash
print_step "Firewall sozlanmoqda..."
sudo ufw --force enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow $BACKEND_PORT
print_success "Firewall sozlandi"

# 15. SSL sertifikat (ixtiyoriy)
print_step "SSL sertifikat uchun Certbot o'rnatilmoqda..."
sudo apt-get install -y certbot python3-certbot-nginx
print_warning "SSL sertifikat olish uchun: sudo certbot --nginx -d $DOMAIN"

# 16. Yakuniy tekshirish
print_step "Yakuniy tekshirish..."
echo ""
echo "📊 Xizmatlar holati:"
sudo systemctl status mongod --no-pager -l
sudo systemctl status nginx --no-pager -l
pm2 status

echo ""
print_success "🎉 DEPLOY MUVAFFAQIYATLI YAKUNLANDI!"
echo ""
echo "🌐 Saytingiz manzillari:"
echo "   Frontend: http://$SERVER_IP"
echo "   Backend API: http://$SERVER_IP:$BACKEND_PORT/api"
echo ""
echo "📝 Keyingi qadamlar:"
echo "   1. Domain sozlash (agar bor bo'lsa)"
echo "   2. SSL sertifikat: sudo certbot --nginx -d $DOMAIN"
echo "   3. DNS sozlamalarini yangilash"
echo ""
echo "🔧 Foydali buyruqlar:"
echo "   - Logs: pm2 logs"
echo "   - Restart: pm2 restart all"
echo "   - Status: pm2 status"
echo "   - Nginx test: sudo nginx -t"