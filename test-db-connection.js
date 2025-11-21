const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const MONGO_URL = process.env.MONGO_URL;

console.log('🔄 MongoDB-ga ulanish tekshirilmoqda...');
console.log('URL:', MONGO_URL ? 'Mavjud' : 'Topilmadi');

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('❌ Xatolik:', error.message);
  process.exit(1);
});

db.once('open', () => {
  console.log('✅ MongoDB-ga muvaffaqiyatli ulandi!');
  console.log(`📊 Bazaning nomi: ${db.db.databaseName}`);
  console.log(`🌐 Server: ${db.host}:${db.port}`);
  process.exit(0);
});

// 10 soniyadan keyin timeout
setTimeout(() => {
  console.error('❌ Ulanish vaqti tugadi. Iltimos, internet aloqasini tekshiring.');
  process.exit(1);
}, 10000);
