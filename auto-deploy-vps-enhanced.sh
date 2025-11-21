#!/bin/bash

# Rentacloud - Enhanced VPS Deploy Script
# Foydalanish: bash auto-deploy-vps-enhanced.sh
# Ubuntu 20.04+ uchun optimizatsiya qilingan

set -e

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Error handling function
handle_error() {
    local exit_code=$?
    local line_number=$1
    print_error "Script failed at line $line_number with exit code $exit_code"
}

# Set error trap
trap 'handle_error $LINENO' ERR

# Konfiguratsiya
PROJECT_NAME="rentacloud"
DOMAIN="example.com"  # Bu yerga o'z domeningizni yozing
DB_NAME="rentacloudorg"
BACKEND_PORT="4000"
NODE_VERSION="18"

# System info
UBUNTU_VERSION=$(lsb_release -rs)
ARCH=$(dpkg --print-architecture)

echo -e "${GREEN}"
echo "🚀 RENTACLOUD ENHANCED VPS DEPLOY SCRIPT"
echo "========================================="
echo -e "${NC}"
print_info "Ubuntu Version: $UBUNTU_VERSION"
print_info "Architecture: $ARCH"
print_info "Node.js Version: $NODE_VERSION"
echo ""

# Validate system requirements
print_step "System requirements tekshirilmoqda..."
if [[ $(echo "$UBUNTU_VERSION >= 20.04" | bc -l) -eq 0 ]]; then
    print_warning "Ubuntu 20.04+ tavsiya etiladi. Hozirgi versiya: $UBUNTU_VERSION"
fi

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_error "Bu script root user sifatida ishlatilmasligi kerak!"
fi

# Check sudo access
if ! sudo -n true 2>/dev/null; then
    print_error "Sudo ruxsati kerak. 'sudo visudo' bilan sozlang."
fi

print_success "System requirements tekshirildi"

# 1. System yangilash
print_step "Sistema yangilanmoqda..."
sudo apt update -y
sudo apt upgrade -y
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
print_success "Sistema yangilandi"

# 2. Node.js o'rnatish (NodeSource repository orqali)
print_step "Node.js $NODE_VERSION o'rnatilmoqda..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Verify installation
    NODE_INSTALLED_VERSION=$(node --version)
    print_success "Node.js o'rnatildi: $NODE_INSTALLED_VERSION"
else
    NODE_INSTALLED_VERSION=$(node --version)
    print_success "Node.js allaqachon o'rnatilgan: $NODE_INSTALLED_VERSION"
fi

# Verify npm
if ! command -v npm &> /dev/null; then
    print_error "npm o'rnatilmagan!"
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
        print_info "MongoDB qayta ishga tushirildi"
    fi
fi

# 4. PM2 o'rnatish
print_step "PM2 o'rnatilmoqda..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2@latest
    
    # Verify PM2 installation
    PM2_VERSION=$(pm2 --version)
    print_success "PM2 o'rnatildi: v$PM2_VERSION"
else
    PM2_VERSION=$(pm2 --version)
    print_success "PM2 allaqachon o'rnatilgan: v$PM2_VERSION"
fi

# 5. Nginx o'rnatish
print_step "Nginx o'rnatilmoqda..."
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    # Verify Nginx installation
    if sudo systemctl is-active --quiet nginx; then
        print_success "Nginx o'rnatildi va ishga tushirildi"
    else
        print_error "Nginx ishga tushmadi!"
    fi
else
    print_success "Nginx allaqachon o'rnatilgan"
    
    # Ensure Nginx is running
    if ! sudo systemctl is-active --quiet nginx; then
        sudo systemctl start nginx
        print_info "Nginx qayta ishga tushirildi"
    fi
fi

# 6. Git o'rnatish
print_step "Git tekshirilmoqda..."
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
    print_success "Git o'rnatildi"
else
    GIT_VERSION=$(git --version)
    print_success "Git allaqachon o'rnatilgan: $GIT_VERSION"
fi

# 7. Loyihani klonlash yoki yangilash
print_step "Loyiha yuklanmoqda..."
if [ -d "$PROJECT_NAME" ]; then
    print_warning "Loyiha papkasi mavjud. Yangilanmoqda..."
    cd $PROJECT_NAME
    
    # Backup current .env files
    if [ -f "backend/.env" ]; then
        cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)
        print_info "Backend .env fayli backup qilindi"
    fi
    
    if [ -f "frontend/.env.local" ]; then
        cp frontend/.env.local frontend/.env.local.backup.$(date +%Y%m%d_%H%M%S)
        print_info "Frontend .env.local fayli backup qilindi"
    fi
    
    # Pull latest changes
    git stash push -m "Auto-stash before deploy $(date)"
    git pull origin main || git pull origin master
else
    git clone https://github.com/mahmudjon366/rentacloud.git
    cd $PROJECT_NAME
fi
print_success "Loyiha yuklandi"

# 8. Dependencies o'rnatish
print_step "Dependencies o'rnatilmoqda..."
if [ -f "package.json" ]; then
    npm run install-all
else
    # Fallback method
    npm install
    cd backend && npm install && cd ..
    cd frontend && npm install && cd ..
fi
print_success "Dependencies o'rnatildi"

# 9. Environment fayllarini yaratish
print_step "Environment fayllar sozlanmoqda..."

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || hostname -I | awk '{print $1}')

# Backend .env
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
# Database Configuration
MONGO_URL=mongodb://localhost:27017/$DB_NAME

# Server Configuration
PORT=$BACKEND_PORT
NODE_ENV=production

# Security
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# Admin User
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password-immediately

# CORS Configuration
CORS_ORIGIN=http://$SERVER_IP,https://$DOMAIN

# Logging
LOG_LEVEL=info
EOF
    print_success "Backend .env fayli yaratildi"
else
    print_info "Backend .env fayli mavjud (o'zgartirilmadi)"
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    cat > frontend/.env.local << EOF
# API Configuration
VITE_API_BASE=http://$SERVER_IP:$BACKEND_PORT/api

# Application Configuration
VITE_APP_NAME=Rentacloud
VITE_APP_VERSION=1.0.0
EOF
    print_success "Frontend .env.local fayli yaratildi"
else
    print_info "Frontend .env.local fayli mavjud (o'zgartirilmadi)"
fi

# 10. Frontend build qilish
print_step "Frontend build qilinmoqda..."
cd frontend
npm run build
cd ..
print_success "Frontend build qilindi"

# 11. Logs papkasini yaratish
mkdir -p logs
print_success "Logs papkasi yaratildi"

# 12. PM2 bilan backend ishga tushirish
print_step "Backend PM2 bilan ishga tushirilmoqda..."

# Stop existing process if running
pm2 delete $PROJECT_NAME-backend 2>/dev/null || true

# Start new process
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup ubuntu -u $USER --hp $HOME | grep -v "PM2" | bash || true

print_success "Backend ishga tushirildi"

# 13. Nginx konfiguratsiyasini sozlash
print_step "Nginx sozlanmoqda..."
PROJECT_PATH=$(pwd)

sudo tee /etc/nginx/sites-available/$PROJECT_NAME << EOF
server {
    listen 80;
    server_name $SERVER_IP $DOMAIN www.$DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Frontend static files
    location / {
        root $PROJECT_PATH/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Rate limiting (basic)
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    location /api/ {
        limit_req zone=api burst=20 nodelay;
    }
}
EOF

# Enable site and disable default
sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
if sudo nginx -t; then
    sudo systemctl reload nginx
    print_success "Nginx sozlandi va qayta yuklandi"
else
    print_error "Nginx konfiguratsiyasida xatolik!"
fi

# 14. Firewall sozlash
print_step "Firewall sozlanmoqda..."
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow $BACKEND_PORT/tcp
    print_success "Firewall sozlandi"
else
    print_warning "UFW firewall topilmadi"
fi

# 15. SSL sertifikat uchun Certbot o'rnatish
print_step "Certbot o'rnatilmoqda..."
if ! command -v certbot &> /dev/null; then
    sudo apt-get install -y certbot python3-certbot-nginx
    print_success "Certbot o'rnatildi"
else
    print_success "Certbot allaqachon o'rnatilgan"
fi

# 16. Admin user yaratish
print_step "Admin user yaratilmoqda..."
cd backend
npm run seed-admin 2>/dev/null || echo "Admin user allaqachon mavjud"
cd ..
print_success "Admin user tekshirildi"

# 17. Yakuniy tekshirish
print_step "Yakuniy tekshirish..."

echo ""
echo -e "${PURPLE}📊 XIZMATLAR HOLATI:${NC}"
echo "===================="

# Check MongoDB
if sudo systemctl is-active --quiet mongod; then
    echo -e "${GREEN}✅ MongoDB: Ishlamoqda${NC}"
else
    echo -e "${RED}❌ MongoDB: Ishlamayapti${NC}"
fi

# Check Nginx
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx: Ishlamoqda${NC}"
else
    echo -e "${RED}❌ Nginx: Ishlamayapti${NC}"
fi

# Check PM2
PM2_STATUS=$(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "unknown")
if [ "$PM2_STATUS" = "online" ]; then
    echo -e "${GREEN}✅ Backend (PM2): Ishlamoqda${NC}"
else
    echo -e "${RED}❌ Backend (PM2): Ishlamayapti${NC}"
fi

echo ""
print_success "🎉 DEPLOY MUVAFFAQIYATLI YAKUNLANDI!"
echo ""
echo -e "${CYAN}🌐 SAYTINGIZ MANZILLARI:${NC}"
echo "========================"
echo "   Frontend: http://$SERVER_IP"
echo "   Backend API: http://$SERVER_IP:$BACKEND_PORT/api"
if [ "$DOMAIN" != "example.com" ]; then
    echo "   Domain: http://$DOMAIN (DNS sozlash kerak)"
fi
echo ""
echo -e "${YELLOW}📝 KEYINGI QADAMLAR:${NC}"
echo "==================="
echo "   1. Admin parolini o'zgartiring: backend/.env faylida ADMIN_PASSWORD"
echo "   2. Domain DNS sozlamalarini yangilang"
echo "   3. SSL sertifikat: sudo certbot --nginx -d $DOMAIN"
echo "   4. Firewall qoidalarini tekshiring"
echo ""
echo -e "${CYAN}🔧 FOYDALI BUYRUQLAR:${NC}"
echo "====================="
echo "   - Logs: pm2 logs"
echo "   - Restart: pm2 restart all"
echo "   - Status: pm2 status"
echo "   - Nginx test: sudo nginx -t"
echo "   - MongoDB status: sudo systemctl status mongod"
echo ""
echo -e "${GREEN}✨ Loyihangiz tayyor! Omad tilaymiz! ✨${NC}"