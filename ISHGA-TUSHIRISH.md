# 🚀 Loyihani Ishga Tushirish

## Birinchi marta ishga tushirish

### 1. Dependencies o'rnatish va build qilish
```bash
npm run build
```

Bu quyidagilarni bajaradi:
- ✅ Backend dependencies o'rnatadi
- ✅ Frontend dependencies o'rnatadi  
- ✅ Frontend'ni production uchun build qiladi

### 2. Backend ishga tushirish
Yangi terminal oching:
```bash
cd backend
npm run dev
```

Kutilgan natija:
```
✅ MongoDB'ga muvaffaqiyatli ulandi!
📊 Database: rentacloudorg
🚀 Server is running on http://localhost:4000
```

### 3. Frontend ishga tushirish
Yana bir terminal oching:
```bash
cd frontend
npm run dev
```

Kutilgan natija:
```
VITE v5.4.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 4. Brauzerda ochish
```
http://localhost:5173/products
```

## Keyingi safar ishga tushirish

Agar dependencies allaqachon o'rnatilgan bo'lsa, to'g'ridan-to'g'ri:

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## Muammolar yuzaga kelsa

### Backend ishlamasa:
```bash
# Port 4000 band bo'lsa:
# Windows'da:
netstat -ano | findstr :4000
taskkill /PID <process_id> /F
```

### Frontend ishlamasa:
```bash
# Port 5173 band bo'lsa, boshqa port ishlatadi
# Yoki:
cd frontend
npm run dev -- --port 3000
```

### MongoDB ulanmasa:
```bash
node test-connection-direct.js
```

## Tezkor Buyruqlar

| Buyruq | Vazifa |
|--------|--------|
| `npm run build` | Hamma narsani o'rnatish va build qilish |
| `npm run dev` | Backend va frontend'ni birga ishga tushirish |
| `cd backend && npm run dev` | Faqat backend |
| `cd frontend && npm run dev` | Faqat frontend |
| `cd backend && npm run seed-products` | Mahsulotlar qo'shish |
| `node test-connection-direct.js` | MongoDB ulanishini test qilish |
| `node check-system.js` | Tizimni diagnostika qilish |

## Xavfsizlik

⚠️ **MUHIM**: `.env` fayllarini git'ga commit qilmang!

`.gitignore` faylida quyidagilar bo'lishi kerak:
```
.env
*.env
.env.local
```

## Production'ga deploy qilish

Production uchun:
```bash
npm run build:prod
```

Batafsil: `docs/DEPLOYMENT.md`
