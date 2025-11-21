import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/rentacloudorg';

async function main() {
  await mongoose.connect(MONGO_URL);
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(password, 10);
  const role = 'admin'; // Admin role for this user
  
  const existing = await User.findOne({ username });
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.role = role;
    await existing.save();
    console.log(`Updated user '${username}' with role '${role}'`);
  } else {
    await User.create({ username, passwordHash, role });
    console.log(`Created user '${username}' with role '${role}'`);
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});