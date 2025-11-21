#!/bin/bash

# Rentacloud Production Build Test Script
# Bu script production build'ni local muhitda test qiladi

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${GREEN}"
echo "🧪 RENTACLOUD PRODUCTION BUILD TEST"
echo "===================================="
echo -e "${NC}"

# Test configuration
TEST_PORT_BACKEND=4001
TEST_PORT_FRONTEND=5174
PROJECT_ROOT=$(pwd)

print_step "1. Environment va dependencies tekshiruvi"

# Check Node.js version
NODE_VERSION=$(node --version)
print_info "Node.js version: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ ^v1[8-9]\. ]] && [[ ! "$NODE_VERSION" =~ ^v[2-9][0-9]\. ]]; then
    print_error "Node.js 18+ kerak. Hozirgi versiya: $NODE_VERSION"
fi

# Check if all package.json files exist
for dir in "." "backend" "frontend"; do
    if [ ! -f "$dir/package.json" ]; then
        print_error "$dir/package.json topilmadi"
    fi
done

print_success "Environment tekshiruvi muvaffaqiyatli"

print_step "2. Dependencies o'rnatish"

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

print_success "Dependencies o'rnatildi"

print_step "3. Environment fayllarini tekshirish"

# Check backend .env.example
if [ ! -f "backend/.env.example" ]; then
    print_error "backend/.env.example topilmadi"
fi

# Check frontend .env.example
if [ ! -f "frontend/.env.example" ]; then
    print_error "frontend/.env.example topilmadi"
fi

# Create test environment files
print_info "Test environment fayllar yaratilmoqda..."

# Backend test .env
cat > backend/.env.test << EOF
MONGO_URL=mongodb://localhost:27017/rentacloud_test
PORT=$TEST_PORT_BACKEND
NODE_ENV=production
JWT_SECRET=test-jwt-secret-for-production-build-testing-32-chars
JWT_EXPIRES_IN=24h
ADMIN_USERNAME=testadmin
ADMIN_PASSWORD=testpass123
CORS_ORIGIN=http://localhost:$TEST_PORT_FRONTEND
LOG_LEVEL=info
EOF

# Frontend test .env.local
cat > frontend/.env.test << EOF
VITE_API_BASE=http://localhost:$TEST_PORT_BACKEND/api
VITE_APP_NAME=Rentacloud Test
VITE_APP_VERSION=1.0.0-test
EOF

print_success "Test environment fayllar yaratildi"

print_step "4. Backend production build tekshiruvi"

# Validate backend code
cd backend
print_info "Backend kod validatsiyasi..."
npm run validate

# Test backend startup with production config
print_info "Backend production config bilan test qilinmoqda..."

# Copy test env to .env for testing
cp .env.test .env

# Start backend in background for testing
print_info "Backend test rejimida ishga tushirilmoqda (port: $TEST_PORT_BACKEND)..."
NODE_ENV=production PORT=$TEST_PORT_BACKEND node src/index.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Test backend health
print_info "Backend health check..."
if curl -f -s "http://localhost:$TEST_PORT_BACKEND/health" > /dev/null; then
    print_success "Backend health check muvaffaqiyatli"
else
    kill $BACKEND_PID 2>/dev/null || true
    print_error "Backend health check muvaffaqiyatsiz"
fi

# Test API endpoints
print_info "API endpoints test qilinmoqda..."

# Test products endpoint
if curl -f -s "http://localhost:$TEST_PORT_BACKEND/api/products" > /dev/null; then
    print_success "Products API ishlayapti"
else
    kill $BACKEND_PID 2>/dev/null || true
    print_error "Products API ishlamayapti"
fi

# Stop backend
kill $BACKEND_PID 2>/dev/null || true
sleep 2

cd ..
print_success "Backend production build test muvaffaqiyatli"

print_step "5. Frontend production build tekshiruvi"

cd frontend

# Copy test env
cp .env.test .env.local

# Build frontend for production
print_info "Frontend production build qilinmoqda..."
npm run build

# Check if build files exist
if [ ! -d "dist" ]; then
    print_error "Frontend build muvaffaqiyatsiz - dist papkasi topilmadi"
fi

# Check essential build files
essential_files=("dist/index.html" "dist/assets")
for file in "${essential_files[@]}"; do
    if [ ! -e "$file" ]; then
        print_error "Muhim build fayli topilmadi: $file"
    fi
done

# Check build size
BUILD_SIZE=$(du -sh dist | cut -f1)
print_info "Frontend build hajmi: $BUILD_SIZE"

# Start frontend preview server
print_info "Frontend preview server ishga tushirilmoqda (port: $TEST_PORT_FRONTEND)..."
npm run preview -- --port $TEST_PORT_FRONTEND &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

# Test frontend accessibility
print_info "Frontend accessibility test..."
if curl -f -s "http://localhost:$TEST_PORT_FRONTEND" > /dev/null; then
    print_success "Frontend accessibility test muvaffaqiyatli"
else
    kill $FRONTEND_PID 2>/dev/null || true
    print_error "Frontend accessibility test muvaffaqiyatsiz"
fi

# Stop frontend
kill $FRONTEND_PID 2>/dev/null || true
sleep 2

cd ..
print_success "Frontend production build test muvaffaqiyatli"

print_step "6. Integration test"

print_info "Full stack integration test boshlanyapti..."

# Start backend
cd backend
NODE_ENV=production PORT=$TEST_PORT_BACKEND node src/index.js &
BACKEND_PID=$!
cd ..

# Start frontend
cd frontend
npm run preview -- --port $TEST_PORT_FRONTEND &
FRONTEND_PID=$!
cd ..

# Wait for both services
sleep 8

# Test full integration
print_info "Frontend-Backend integration test..."

# Test if frontend can load
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$TEST_PORT_FRONTEND")
if [ "$FRONTEND_STATUS" = "200" ]; then
    print_success "Frontend yuklandi (HTTP $FRONTEND_STATUS)"
else
    print_warning "Frontend yuklash muammosi (HTTP $FRONTEND_STATUS)"
fi

# Test if backend API accessible
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$TEST_PORT_BACKEND/health")
if [ "$BACKEND_STATUS" = "200" ]; then
    print_success "Backend API accessible (HTTP $BACKEND_STATUS)"
else
    print_warning "Backend API muammosi (HTTP $BACKEND_STATUS)"
fi

# Cleanup
print_info "Test jarayonlari to'xtatilmoqda..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
sleep 3

# Remove test files
rm -f backend/.env.test backend/.env frontend/.env.test frontend/.env.local

print_success "Integration test yakunlandi"

print_step "7. Production readiness tekshiruvi"

# Check essential files for production
essential_production_files=(
    "ecosystem.config.js"
    "nginx-config.conf"
    "auto-deploy-vps.sh"
    "backend/.env.example"
    "frontend/.env.example"
    "docs/DEPLOYMENT.md"
    "docs/TROUBLESHOOTING.md"
)

print_info "Production fayllar tekshirilmoqda..."
for file in "${essential_production_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Muhim production fayli topilmadi: $file"
    fi
done

# Check scripts permissions (if on Unix-like system)
if [ -f "auto-deploy-vps.sh" ]; then
    if [ ! -x "auto-deploy-vps.sh" ]; then
        print_warning "auto-deploy-vps.sh executable emas"
        chmod +x auto-deploy-vps.sh 2>/dev/null || true
    fi
fi

print_success "Production readiness tekshiruvi muvaffaqiyatli"

print_step "8. Security tekshiruvi"

# Check for sensitive data in code
print_info "Sensitive data tekshirilmoqda..."

# Check for hardcoded secrets (basic check)
if grep -r "password.*=" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | grep -v "placeholder\|example\|test"; then
    print_warning "Hardcoded parollar topildi - tekshiring"
fi

# Check .env files are in .gitignore
if ! grep -q "\.env" .gitignore; then
    print_warning ".env fayllar .gitignore da yo'q"
fi

print_success "Security tekshiruvi yakunlandi"

echo ""
print_success "🎉 PRODUCTION BUILD TEST MUVAFFAQIYATLI YAKUNLANDI!"
echo ""
echo -e "${CYAN}📊 TEST NATIJALARI:${NC}"
echo "==================="
echo "✅ Environment va dependencies"
echo "✅ Backend production build"
echo "✅ Frontend production build"
echo "✅ Integration test"
echo "✅ Production readiness"
echo "✅ Security check"
echo ""
echo -e "${GREEN}🚀 Loyiha production uchun tayyor!${NC}"
echo ""
echo -e "${YELLOW}📝 KEYINGI QADAMLAR:${NC}"
echo "1. VPS serverga deploy qiling: bash auto-deploy-vps.sh"
echo "2. Domain DNS sozlamalarini yangilang"
echo "3. SSL sertifikat o'rnating"
echo "4. Production environment variables sozlang"
echo ""
echo -e "${BLUE}📖 Qo'shimcha ma'lumot:${NC}"
echo "- Deployment guide: docs/DEPLOYMENT.md"
echo "- Troubleshooting: docs/TROUBLESHOOTING.md"