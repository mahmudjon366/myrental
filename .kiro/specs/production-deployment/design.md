# Design Document

## Overview

Rentacloud ijara boshqaruv tizimini production muhitiga deploy qilish uchun to'liq texnik yechim. Loyiha React frontend, Node.js/Express backend va MongoDB'dan iborat bo'lib, VPS serverda Nginx reverse proxy orqali xizmat ko'rsatadi.

## Architecture

### High-Level Architecture

```
Internet → Nginx (Port 80/443) → Frontend (Static Files)
                                → Backend API (Port 4000) → MongoDB (Port 27017)
```

### Deployment Architecture

```
GitHub Repository → VPS Server → Production Environment
                                ├── Nginx (Reverse Proxy)
                                ├── PM2 (Process Manager)
                                ├── Frontend (Built Static Files)
                                ├── Backend (Node.js API)
                                └── MongoDB (Database)
```

### Security Layer

- SSL/TLS encryption (HTTPS)
- Firewall configuration (UFW)
- JWT token authentication
- CORS policy implementation
- Environment variables protection

## Components and Interfaces

### 1. Frontend Component (React/Vite)

**Purpose**: Foydalanuvchi interfeysi va static file serving

**Technologies**:
- React 18 with modern hooks
- Vite build tool for optimization
- React Router for navigation
- CSS modules for styling

**Build Process**:
- Development: `npm run dev` (port 5173)
- Production: `npm run build` → `dist/` folder
- Optimization: Code splitting, minification, asset compression

**Environment Configuration**:
```env
VITE_API_BASE=https://your-domain.com/api
VITE_APP_NAME=Rentacloud
```

### 2. Backend Component (Node.js/Express)

**Purpose**: API server va business logic

**Technologies**:
- Node.js 18+ with ES modules
- Express.js framework
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing

**API Endpoints**:
- `/api/products` - Mahsulot boshqaruvi
- `/api/rentals` - Ijara jarayonlari
- `/api/reports` - Hisobotlar (authenticated)
- `/api/auth` - Autentifikatsiya

**Environment Configuration**:
```env
MONGO_URL=mongodb://localhost:27017/rentacloudorg
PORT=4000
JWT_SECRET=secure-random-string
NODE_ENV=production
```

### 3. Database Component (MongoDB)

**Purpose**: Ma'lumotlar saqlash va boshqarish

**Collections**:
- `products` - Mahsulotlar ma'lumotlari
- `rentals` - Ijara yozuvlari
- `users` - Foydalanuvchi hisobotlari

**Configuration**:
- Local MongoDB instance
- Database name: `rentacloudorg`
- Connection pooling enabled
- Automatic reconnection

### 4. Process Manager (PM2)

**Purpose**: Backend jarayonlarini boshqarish va monitoring

**Configuration** (`ecosystem.config.js`):
```javascript
{
  name: 'rentacloud-backend',
  script: './backend/src/index.js',
  instances: 1,
  env: { NODE_ENV: 'production', PORT: 4000 },
  max_memory_restart: '1G',
  restart_delay: 4000,
  max_restarts: 10
}
```

**Features**:
- Automatic restart on crashes
- Log management
- Memory monitoring
- Startup script generation

### 5. Reverse Proxy (Nginx)

**Purpose**: Static file serving va API proxy

**Configuration**:
- Frontend files: `/frontend/dist/` → `/`
- API requests: `/api/` → `http://localhost:4000`
- SSL termination
- Gzip compression
- Static asset caching

## Data Models

### Product Model
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  available: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Rental Model
```javascript
{
  _id: ObjectId,
  productId: ObjectId,
  customerName: String,
  customerPhone: String,
  startDate: Date,
  endDate: Date,
  totalAmount: Number,
  status: String, // 'active', 'returned', 'overdue'
  createdAt: Date,
  returnedAt: Date
}
```

### User Model (for reports)
```javascript
{
  _id: ObjectId,
  username: String,
  password: String, // hashed with bcryptjs
  role: String, // 'admin'
  createdAt: Date
}
```

## Error Handling

### Frontend Error Handling
- API request error catching
- User-friendly error messages
- Loading states management
- Network error recovery

### Backend Error Handling
- Express error middleware
- Database connection error handling
- JWT token validation errors
- Input validation with express-validator

### System-Level Error Handling
- PM2 automatic restart on crashes
- Nginx error pages (404, 500)
- MongoDB connection retry logic
- Log file rotation

## Testing Strategy

### Pre-deployment Testing
1. **Local Development Testing**
   - Frontend: Component functionality
   - Backend: API endpoint testing
   - Database: Connection and queries

2. **Build Testing**
   - Frontend build success
   - Backend startup verification
   - Environment variables validation

3. **Integration Testing**
   - Frontend-Backend communication
   - Database operations
   - Authentication flow

### Production Testing
1. **Deployment Verification**
   - Service startup confirmation
   - Port accessibility testing
   - SSL certificate validation

2. **Performance Testing**
   - Page load speed
   - API response times
   - Database query performance

3. **Security Testing**
   - HTTPS enforcement
   - CORS policy verification
   - Authentication security

## Deployment Process

### Phase 1: Code Preparation
1. Clean up sensitive data
2. Update .gitignore
3. Create production environment files
4. Test local build process

### Phase 2: GitHub Upload
1. Initialize Git repository
2. Add all files with proper exclusions
3. Create meaningful commit messages
4. Push to GitHub repository

### Phase 3: VPS Deployment
1. Server preparation (Node.js, MongoDB, Nginx, PM2)
2. Repository cloning
3. Dependencies installation
4. Environment configuration
5. Build and service startup

### Phase 4: Production Configuration
1. Nginx reverse proxy setup
2. SSL certificate installation
3. Firewall configuration
4. Process monitoring setup

### Phase 5: Verification and Monitoring
1. Service health checks
2. Performance monitoring
3. Log analysis
4. Backup procedures

## Security Considerations

### Data Protection
- Environment variables for sensitive data
- JWT secret key security
- Database access restrictions
- HTTPS enforcement

### Network Security
- Firewall rules (ports 22, 80, 443, 4000)
- Nginx security headers
- CORS policy implementation
- Rate limiting (future enhancement)

### Application Security
- Input validation and sanitization
- SQL injection prevention (MongoDB)
- XSS protection headers
- Authentication token expiration

## Performance Optimization

### Frontend Optimization
- Code splitting and lazy loading
- Asset compression and minification
- Browser caching strategies
- CDN integration (future enhancement)

### Backend Optimization
- Database query optimization
- Connection pooling
- Response compression
- API response caching

### Infrastructure Optimization
- Nginx gzip compression
- Static asset caching
- Process memory management
- Database indexing

## Monitoring and Maintenance

### Log Management
- PM2 log files: error, output, combined
- Nginx access and error logs
- MongoDB logs
- System logs monitoring

### Health Monitoring
- PM2 process status
- Database connection health
- Disk space monitoring
- Memory usage tracking

### Backup Strategy
- Database backup procedures
- Code repository backup (GitHub)
- Configuration files backup
- Recovery procedures documentation

## Scalability Considerations

### Horizontal Scaling (Future)
- Load balancer implementation
- Multiple server instances
- Database clustering
- Session management

### Vertical Scaling
- Server resource monitoring
- Memory optimization
- CPU usage optimization
- Database performance tuning