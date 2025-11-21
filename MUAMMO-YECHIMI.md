# Mahsulotlar Ko'rinmasligi Muammosini Yechish

## Muammo
Mahsulotlar sahifasida ma'lumotlar ko'rinmayapti.

## Sabablari
1. ❌ Frontend .env fayli yo'q edi
2. ❌ MongoDB connection noto'g'ri sozlangan
3. ❌ Ma'lumotlar bazasida mahsulotlar yo'q
4. ❌ Backend server to'g'ri ishlamayapti

## Yechim Qadamlari

### 1. Backend va Frontend dependencies o'rnatish
```bash
npm run build
```

### 2. Backend serverni ishga tushirish
```bash
# Yangi terminal oching va bajaring:
cd backend
npm run dev
```

### 3. Mahsulotlarni seed qilish (ma'lumotlar bazasiga qo'shish)
```bash
# Yana bir terminal oching va bajaring:
cd backend
npm run seed-products
```

### 4. Frontend serverni ishga tushirish
```bash
# Yana bir terminal oching va bajaring:
cd frontend
npm run dev
```

### 5. Brauzerda ochish
```
http://localhost:5173/products
```

## Tekshirish

### Backend ishlayotganini tekshirish:
```bash
# Brauzerda yoki Postman'da:
http://localhost:4000/api/products
```

Natija:
```json
{
  "data": [
    {
      "_id": "...",
      "name": "Trambofka",
      "dailyPrice": 300000,
      ...
    }
  ],
  "pagination": {...}
}
```

### Frontend ishlayotganini tekshirish:
1. Brauzerda `http://localhost:5173/products` oching
2. Developer Console'ni oching (F12)
3. Network tab'da API so'rovlarni ko'ring
4. Console'da xatolar bormi tekshiring

## Agar Muammo Davom Etsa

### Port 4000 band bo'lsa:
```bash
# Windows'da:
netstat -ano | findstr :4000
# Process ID'ni topib, to'xtating:
taskkill /PID <process_id> /F
```

### MongoDB muammosi bo'lsa:
Backend `.env` faylida `MONGO_URL` bo'sh bo'lishi kerak (in-memory database ishlatish uchun):
```
MONGO_URL=
```

### CORS xatosi bo'lsa:
Backend `.env` faylida:
```
CORS_ORIGIN=http://localhost:5173
```

## Qo'shimcha Ma'lumot

### Mahsulot qo'shish:
1. "Yangi mahsulot" tugmasini bosing
2. Ma'lumotlarni kiriting
3. "Saqlash" tugmasini bosing

### Mahsulotni tahrirlash:
1. Mahsulot qatorida "Tahrirlash" tugmasini bosing
2. Ma'lumotlarni o'zgartiring
3. "Saqlash" tugmasini bosing

### Mahsulotni o'chirish:
1. "O'chirish" tugmasini bosing
2. Tasdiqlang
