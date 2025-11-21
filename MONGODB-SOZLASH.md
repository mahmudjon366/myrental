# 🔧 MongoDB Ulanishini Sozlash

## Muammo
MongoDB'dagi mahsulotlar ko'rinmayapti, chunki backend MongoDB'ga ulanmagan.

## Yechim

### Variant 1: MongoDB Atlas (Cloud) - TAVSIYA ETILADI

#### 1. MongoDB Atlas'ga kiring
🔗 https://cloud.mongodb.com

#### 2. Cluster'ingizni tanlang
- Agar cluster yo'q bo'lsa, yangi cluster yarating (FREE tier mavjud)

#### 3. Connection String'ni oling
1. Cluster'da **"Connect"** tugmasini bosing
2. **"Connect your application"** ni tanlang
3. **Driver**: Node.js
4. **Version**: 5.5 or later
5. Connection string'ni **COPY** qiling

Misol:
```
mongodb+srv://myusername:mypassword@cluster0.xxxxx.mongodb.net/rentacloudorg?retryWrites=true&w=majority
```

#### 4. IP Address Whitelist qo'shing
1. MongoDB Atlas'da **"Network Access"** bo'limiga o'ting
2. **"Add IP Address"** tugmasini bosing
3. **"Allow Access from Anywhere"** (0.0.0.0/0) ni tanlang
   - Yoki hozirgi IP manzilingizni qo'shing
4. **"Confirm"** tugmasini bosing

#### 5. backend/.env faylini yangilang
```env
MONGO_URL=mongodb+srv://sizning-username:sizning-password@cluster0.xxxxx.mongodb.net/rentacloudorg?retryWrites=true&w=majority
```

⚠️ **MUHIM**: 
- `sizning-username` va `sizning-password` ni haqiqiy qiymatlar bilan almashtiring
- Password'da maxsus belgilar bo'lsa, URL encode qiling:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`

### Variant 2: Local MongoDB (Lokal kompyuter)

#### 1. MongoDB'ni o'rnating
🔗 https://www.mongodb.com/try/download/community

#### 2. MongoDB'ni ishga tushiring
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

#### 3. backend/.env faylini yangilang
```env
MONGO_URL=mongodb://localhost:27017/rentacloudorg
```

### Variant 3: In-Memory Database (Test uchun)

Agar MongoDB o'rnatishni xohlamasangiz, in-memory database ishlatishingiz mumkin:

#### backend/.env faylida:
```env
MONGO_URL=
```

⚠️ **Ogohlantirish**: In-memory database server to'xtaganda barcha ma'lumotlar yo'qoladi!

## Ulanishni Tekshirish

### 1. Test scriptni ishga tushiring:
```bash
node backend/test-mongodb-connection.js
```

### 2. Kutilgan natija:
```
✅ MongoDB'ga muvaffaqiyatli ulandi!
📊 Database: rentacloudorg
🌐 Host: cluster0.xxxxx.mongodb.net
📦 Mahsulotlar soni: 12
```

### 3. Agar mahsulotlar yo'q bo'lsa:
```bash
cd backend
npm run seed-products
```

## Tez-tez uchraydigan xatolar

### ❌ "MongooseServerSelectionError"
**Sabab**: MongoDB'ga ulanib bo'lmadi

**Yechim**:
1. Internet aloqasini tekshiring
2. IP whitelist'ni tekshiring
3. Username/password to'g'riligini tekshiring

### ❌ "Authentication failed"
**Sabab**: Username yoki password noto'g'ri

**Yechim**:
1. MongoDB Atlas'da Database Access bo'limiga o'ting
2. User'ni tekshiring yoki yangi user yarating
3. Password'ni reset qiling

### ❌ "ENOTFOUND cluster.mongodb.net"
**Sabab**: Cluster manzili noto'g'ri yoki internet yo'q

**Yechim**:
1. Internet aloqasini tekshiring
2. Connection string'ni qayta nusxalang

## Keyingi Qadamlar

1. ✅ MongoDB ulanishini sozlang
2. ✅ Test scriptni ishga tushiring
3. ✅ Mahsulotlarni seed qiling
4. ✅ Backend serverni ishga tushiring
5. ✅ Frontend'ni ishga tushiring

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Brauzerda: http://localhost:5173/products
