import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/rentacloudorg';

async function main() {
  await mongoose.connect(MONGO_URL);
  const [name, priceStr, imageUrl] = process.argv.slice(2);
  const dailyPrice = Number(priceStr) || 25;
  const payload = {
    name: name || 'Perforator Bosch GBH 2-26',
    dailyPrice,
    imageUrl:
      imageUrl ||
      'https://images.unsplash.com/photo-1581094839251-6ad36a91fbc2?q=80&w=1200&auto=format&fit=crop',
  };
  const p = await Product.create(payload);
  console.log('Created product:', p.name, p.dailyPrice);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
