import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

console.log('🔍 MongoDB Connection Test');
console.log('=' .repeat(50));

if (!MONGO_URL || MONGO_URL.includes('username') || MONGO_URL.includes('password')) {
  console.log('❌ XATO: MONGO_URL noto\'g\'ri sozlangan!');
  console.log('📝 Hozirgi qiymat:', MONGO_URL ? MONGO_URL.replace(/\/\/.*@/, '//***:***@') : 'BO\'SH');
  console.log('\n💡 Yechim:');
  console.log('1. MongoDB Atlas\'ga kiring: https://cloud.mongodb.com');
  console.log('2. Cluster\'ingizni tanlang');
  console.log('3. "Connect" tugmasini bosing');
  console.log('4. "Connect your application" ni tanlang');
  console.log('5. Connection string\'ni nusxalang');
  console.log('6. backend/.env faylida MONGO_URL\'ni yangilang');
  console.log('\nMisol:');
  console.log('MONGO_URL=mongodb+srv://myuser:mypassword123@cluster0.xxxxx.mongodb.net/rentacloudorg?retryWrites=true&w=majority');
  process.exit(1);
}

console.log('📡 Ulanish manzili:', MONGO_URL.replace(/\/\/.*@/, '//***:***@'));
console.log('⏳ Ulanishga urinilmoqda...\n');

async function testConnection() {
  try {
    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB\'ga muvaffaqiyatli ulandi!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // Test: mahsulotlar sonini tekshirish
    const Product = mongoose.model('Product', new mongoose.Schema({
      name: String,
      dailyPrice: Number,
      imageUrl: String
    }, { timestamps: true }));

    const count = await Product.countDocuments();
    console.log('\n📦 Mahsulotlar soni:', count);

    if (count === 0) {
      console.log('⚠️  Ma\'lumotlar bazasi bo\'sh!');
      console.log('💡 Mahsulotlarni qo\'shish uchun: npm run seed-products');
    } else {
      console.log('✅ Mahsulotlar mavjud!');
      const products = await Product.find().limit(5);
      console.log('\n📋 Birinchi 5 ta mahsulot:');
      products.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ${p.dailyPrice.toLocaleString()} so'm`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Test muvaffaqiyatli yakunlandi!');
    process.exit(0);

  } catch (error) {
    console.log('\n❌ XATO: MongoDB\'ga ulanib bo\'lmadi!');
    console.log('📝 Xato:', error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\n🔧 Mumkin bo\'lgan sabablar:');
      console.log('1. ❌ Internet aloqasi yo\'q');
      console.log('2. ❌ MongoDB Atlas IP whitelist\'da sizning IP manzilingiz yo\'q');
      console.log('3. ❌ Username yoki password noto\'g\'ri');
      console.log('4. ❌ Cluster manzili noto\'g\'ri');
      
      console.log('\n💡 Yechimlar:');
      console.log('1. Internet aloqasini tekshiring');
      console.log('2. MongoDB Atlas\'da Network Access bo\'limiga o\'ting');
      console.log('3. "Add IP Address" tugmasini bosing');
      console.log('4. "Allow Access from Anywhere" (0.0.0.0/0) ni tanlang');
      console.log('5. Yoki hozirgi IP manzilingizni qo\'shing');
    }
    
    await mongoose.disconnect();
    process.exit(1);
  }
}

testConnection();
