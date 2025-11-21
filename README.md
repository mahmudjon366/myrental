# 🏢 Rentacloud - Ijara Boshqaruv Tizimi

Modern va professional ijara boshqaruv tizimi. Mahsulotlarni ijaraga berish, mijozlarni boshqarish va hisobotlarni ko'rish uchun mo'ljallangan production-ready web aplikatsiya.

## 🚀 Xususiyatlar

### Asosiy Funksiyalar
- ✅ Mahsulotlarni boshqarish (qo'shish, tahrirlash, o'chirish)
- ✅ Ijara jarayonini boshqarish
- ✅ Mijozlar ma'lumotlarini saqlash
- ✅ Moliyaviy hisobotlar va analytics
- ✅ Responsive dizayn (mobil va desktop)
- ✅ Xavfsiz autentifikatsiya va avtorizatsiya
- ✅ Real-time ma'lumotlar yangilanishi

### Production Xususiyatlari
- 🔒 **Xavfsizlik**: JWT authentication, CORS protection, input validation
- ⚡ **Performance**: Lazy loading, API caching, database optimization
- 📊 **Monitoring**: Health checks, logging, performance metrics
- 🔄 **Scalability**: PM2 process management, database indexing
- 📱 **PWA Ready**: Service worker support, offline capabilities
- 🛡️ **Security Headers**: XSS protection, CSRF prevention
- 📈 **Analytics**: Request tracking, error monitoring

## 🛠 Texnologiyalar

### Backend
- **Runtime**: Node.js 18+ + Express.js
- **Database**: MongoDB 7.0+ + Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Security**: CORS, Helmet, Rate limiting
- **Performance**: Compression, Caching, Query optimization
- **Monitoring**: Winston logging, Health checks
- **Process Management**: PM2

### Frontend  
- **Framework**: React 18 + TypeScript support
- **Routing**: React Router v6
- **Build Tool**: Vite 5+ (optimized for production)
- **Styling**: Modern CSS + CSS Grid + Flexbox
- **Icons**: React Icons + Lucide React
- **Performance**: Lazy loading, Code splitting, PWA
- **State Management**: React Hooks + Context API

### DevOps & Infrastructure
- **Web Server**: Nginx (reverse proxy + static files)
- **SSL**: Let's Encrypt (Certbot)
- **Database**: MongoDB (local/Atlas)
- **Deployment**: Ubuntu 20.04+, PM2, systemd
- **Monitoring**: Health endpoints, Log rotation
- **Backup**: Automated database backups

## 📦 Development Setup

### 1. Loyihani klonlash
```bash
git clone https://github.com/mahmudjon366/rentacloud.git
cd rentacloud
```

### 2. Dependencies o'rnatish
```bash
npm run install-all
```

### 3. Environment variables sozlash

Backend uchun `.env` fayl yarating:
```bash
cd backend
cp .env.example .env
nano .env
```

`.env` faylini tahrirlang:
```env
MONGO_URL=mongodb://localhost:27017/rentacloudorg
PORT=4000
JWT_SECRET=your-super-secret-jwt-key-here-32-chars-minimum
NODE_ENV=development
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Frontend uchun `.env.local` fayl yarating:
```bash
cd frontend
cp .env.example .env.local
nano .env.local
```

`.env.local` faylini tahrirlang:
```env
VITE_API_BASE=http://localhost:4000/api
VITE_APP_NAME=Rentacloud
VITE_DEBUG=true
```

### 4. Database initialization
```bash
# MongoDB ishga tushirish (local)
sudo systemctl start mongod

# Database va admin user yaratish
cd backend
npm run init-db
```

### 5. Development server ishga tushirish

Barcha xizmatlar:
```bash
npm run dev
```

Yoki alohida:
```bash
# Backend (Terminal 1)
cd backend && npm run dev

# Frontend (Terminal 2)  
cd frontend && npm run dev
```

## 🚀 Production Deployment

### Tez Deployment (Tavsiya etiladi)
```bash
# Avtomatik deployment script
bash auto-deploy-vps.sh
```

### Manual Deployment
To'liq qo'llanma uchun: **[📖 Deployment Guide](docs/DEPLOYMENT.md)**

### Server Talablari
- **OS**: Ubuntu 20.04+
- **RAM**: 2GB+ (4GB tavsiya etiladi)
- **CPU**: 2+ cores
- **Disk**: 20GB+ bo'sh joy
- **Network**: Internet aloqasi

### Production Environment
```bash
# Environment setup
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Build va deploy
npm run build
pm2 start ecosystem.config.js --env production
```

## 🌐 Foydalanish

### Development URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/health

### Production URLs
- **Frontend**: https://your-domain.com
- **Backend API**: https://your-domain.com/api
- **Health Check**: https://your-domain.com/health

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Muhim**: Production'da admin parolini darhol o'zgartiring!

### API Endpoints
- `GET /api/products` - Mahsulotlar ro'yxati
- `POST /api/products` - Yangi mahsulot
- `GET /api/rentals` - Ijaralar ro'yxati
- `POST /api/rentals` - Yangi ijara
- `GET /api/reports/*` - Hisobotlar (auth kerak)
- `GET /health` - System health check

## 📁 Loyiha Strukturasi

```
rentacloud/
├── 📁 backend/                    # Backend API server
│   ├── 📁 src/
│   │   ├── 📁 models/            # MongoDB Mongoose models
│   │   ├── 📁 routes/            # Express API routes
│   │   ├── 📁 middleware/        # Custom middleware (auth, cache, etc.)
│   │   ├── 📁 utils/             # Utility functions (logger, etc.)
│   │   ├── 📁 scripts/           # Database scripts (seed, init)
│   │   └── 📄 index.js           # Main server entry point
│   ├── 📄 .env.example          # Environment variables template
│   └── 📄 package.json          # Backend dependencies
├── 📁 frontend/                   # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable React components
│   │   ├── 📁 pages/            # Page components (routes)
│   │   ├── 📁 hooks/            # Custom React hooks
│   │   ├── 📁 lib/              # Utility functions and configs
│   │   ├── 📁 types/            # TypeScript type definitions
│   │   └── 📄 App.jsx           # Main App component
│   ├── 📁 dist/                 # Built production files
│   ├── 📄 .env.example          # Frontend environment template
│   ├── 📄 vite.config.js        # Vite build configuration
│   └── 📄 package.json          # Frontend dependencies
├── 📁 docs/                      # Documentation
│   ├── 📄 DEPLOYMENT.md         # Production deployment guide
│   └── 📄 TROUBLESHOOTING.md    # Troubleshooting guide
├── 📁 scripts/                   # Deployment and utility scripts
│   ├── 📄 backup-database.sh    # Database backup script
│   └── 📄 restore-database.sh   # Database restore script
├── 📁 logs/                      # Application logs (created at runtime)
├── 📄 ecosystem.config.js       # PM2 process configuration
├── 📄 nginx-config.conf         # Nginx server configuration
├── 📄 auto-deploy-vps.sh        # Automated deployment script
├── 📄 .gitignore               # Git ignore rules
└── 📄 package.json             # Root package.json (scripts)
```

### Key Files
- **`ecosystem.config.js`**: PM2 process management configuration
- **`nginx-config.conf`**: Nginx reverse proxy configuration
- **`auto-deploy-vps.sh`**: One-click deployment script
- **`docs/DEPLOYMENT.md`**: Complete production deployment guide
- **`docs/TROUBLESHOOTING.md`**: Problem-solving guide

## 🔧 API Documentation

### Products API
```bash
# Get all products (with pagination, search, filtering)
GET /api/products?page=1&limit=20&search=drill&sort=name

# Get single product
GET /api/products/:id

# Create new product
POST /api/products
{
  "name": "Electric Drill",
  "dailyPrice": 50000,
  "imageUrl": "https://example.com/image.jpg"
}

# Update product
PUT /api/products/:id

# Delete product
DELETE /api/products/:id
```

### Rentals API
```bash
# Get all rentals
GET /api/rentals

# Create new rental
POST /api/rentals
{
  "productId": "product_id",
  "customerName": "John Doe",
  "customerPhone": "+998901234567",
  "startDate": "2025-01-01",
  "endDate": "2025-01-07"
}

# Return rental
PUT /api/rentals/:id/return
```

### Reports API (Authentication Required)
```bash
# Login for reports
POST /api/auth/report-login
{
  "username": "admin",
  "password": "admin123"
}

# Get rental reports
GET /api/reports/rentals
Authorization: Bearer <token>

# Get income reports
GET /api/reports/income/total
GET /api/reports/income/monthly/2025-01
```

### Health Check API
```bash
# Basic health
GET /health

# Detailed health with system info
GET /health/detailed

# Database health
GET /health/database

# Readiness probe (for Kubernetes)
GET /health/ready

# Liveness probe (for Kubernetes)
GET /health/live
```

## 📊 Monitoring va Maintenance

### Health Monitoring
```bash
# System health check
curl https://your-domain.com/health

# Detailed health info
curl https://your-domain.com/health/detailed

# Database health
curl https://your-domain.com/health/database
```

### Logs
```bash
# PM2 logs
pm2 logs rentacloud-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log

# Application logs
tail -f logs/backend-combined.log
```

### Backup
```bash
# Manual backup
npm run backup --prefix backend

# Restore backup
npm run restore --prefix backend backup-name
```

### Performance Monitoring
- **Frontend**: Performance monitor (development mode)
- **Backend**: Request/response logging
- **Database**: Query performance profiling
- **System**: PM2 monitoring, health checks

## 🔧 Maintenance

### Updates
```bash
# Code update
git pull origin main
npm run install-all
npm run build --prefix frontend
pm2 restart rentacloud-backend
```

### Database Migration
```bash
# Backup before migration
npm run backup --prefix backend

# Run initialization (creates indexes, admin user)
npm run init-db --prefix backend
```

### SSL Certificate Renewal
```bash
# Auto-renewal test
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew
sudo systemctl reload nginx
```

## 🤝 Hissa qo'shish

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. Commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## 📄 Litsenziya

Bu loyiha ISC litsenziyasi ostida tarqatiladi.

## 👨‍💻 Muallif

**ProX Development Team**
- 📞 Telefon: +998 91 975 27 57
- 📧 Email: [email]
- 🌐 Website: [website]

## 🚨 Troubleshooting

Muammolar yuzaga kelganda:

1. **[📖 Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Umumiy muammolar va yechimlar
2. **[📖 Deployment Guide](docs/DEPLOYMENT.md)** - To'liq deployment qo'llanmasi
3. **Health Check**: `curl https://your-domain.com/health/detailed`
4. **Logs**: `pm2 logs` yoki `tail -f logs/backend-combined.log`

### Tez Yechimlar
```bash
# Barcha xizmatlarni restart qilish
pm2 restart all
sudo systemctl restart nginx mongod

# Health check
curl http://localhost:4000/health

# Database connection test
mongo --eval "db.adminCommand('ping')"
```

## 🐛 Xatolar haqida xabar berish

- **GitHub Issues**: [Issues](https://github.com/mahmudjon366/rentacloud/issues)
- **Email**: support@rentacloud.uz
- **Telefon**: +998 91 975 27 57

### Bug Report Template
```
**Environment**: Production/Development
**OS**: Ubuntu 20.04
**Node Version**: 18.x
**Error**: [Error message]
**Steps to Reproduce**: [Steps]
**Expected**: [Expected behavior]
**Actual**: [Actual behavior]
```

## 📈 Performance

### Benchmarks
- **API Response Time**: < 200ms (average)
- **Frontend Load Time**: < 2s (first load)
- **Database Queries**: < 100ms (indexed)
- **Memory Usage**: < 512MB (backend)

### Optimization Features
- ⚡ Lazy loading components
- 🗜️ Gzip compression
- 💾 API response caching
- 📊 Database query optimization
- 🔄 Connection pooling

## 🔒 Security

### Security Features
- 🛡️ JWT authentication with expiration
- 🔐 Password hashing (bcrypt)
- 🚫 CORS protection
- 🛑 Rate limiting
- 🔍 Input validation and sanitization
- 📋 Security headers (XSS, CSRF protection)
- 🔒 HTTPS enforcement (production)

### Security Best Practices
- Regular security updates
- Environment variables for secrets
- Database access restrictions
- Firewall configuration
- SSL certificate management

---

## 🌟 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

⭐ **Agar loyiha foydali bo'lsa, star bosishni unutmang!**

**Made with ❤️ by ProX Development Team**