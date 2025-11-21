import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/rentacloudorg';

const products = [
  { name: 'Trambofka', dailyPrice: 300000 },
  { name: 'Vagner', dailyPrice: 280000 },
  { name: 'Adboynik', dailyPrice: 120000 },
  { name: 'Max perfarator', dailyPrice: 100000 },
  { name: 'Perfarator', dailyPrice: 50000 },
  { name: 'Benzapila', dailyPrice: 80000 },
  { name: 'Pilisos', dailyPrice: 100000 },
  { name: 'Drel', dailyPrice: 30000 },
  { name: 'Shurpavyor', dailyPrice: 50000 },
  { name: 'Lazer', dailyPrice: 60000 },
  { name: 'Beton mishalka', dailyPrice: 100000 },
  { name: 'Utuk', dailyPrice: 50000 }
];

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    // Clear existing products (optional)
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products:`);
    
    createdProducts.forEach(p => {
      console.log(`- ${p.name}: ${p.dailyPrice} so'm/kun`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
