import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';

// Load environment variables
dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/rentacloudorg';

/**
 * Initialize database with indexes, admin user, and sample data
 */
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    // Create indexes for performance
    await createIndexes();
    
    // Create admin user if not exists
    await createAdminUser();
    
    // Create sample products if database is empty
    await createSampleData();
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

/**
 * Create database indexes for performance optimization
 */
async function createIndexes() {
  console.log('🔄 Creating database indexes...');
  
  try {
    // User indexes
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    
    // Product indexes
    await Product.collection.createIndex({ name: 1 });
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ available: 1 });
    await Product.collection.createIndex({ price: 1 });
    await Product.collection.createIndex({ createdAt: -1 });
    
    // Rental indexes (if Rental model exists)
    try {
      const { default: Rental } = await import('../models/Rental.js');
      await Rental.collection.createIndex({ productId: 1 });
      await Rental.collection.createIndex({ customerName: 1 });
      await Rental.collection.createIndex({ customerPhone: 1 });
      await Rental.collection.createIndex({ status: 1 });
      await Rental.collection.createIndex({ startDate: 1 });
      await Rental.collection.createIndex({ endDate: 1 });
      await Rental.collection.createIndex({ createdAt: -1 });
      
      // Compound indexes for common queries
      await Rental.collection.createIndex({ status: 1, endDate: 1 });
      await Rental.collection.createIndex({ productId: 1, status: 1 });
      
      console.log('✅ Rental indexes created');
    } catch (error) {
      console.log('ℹ️  Rental model not found, skipping rental indexes');
    }
    
    console.log('✅ Database indexes created successfully');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

/**
 * Create admin user if not exists
 */
async function createAdminUser() {
  console.log('🔄 Creating admin user...');
  
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: adminUsername });
    
    if (existingAdmin) {
      console.log(`ℹ️  Admin user '${adminUsername}' already exists`);
      
      // Update password if provided
      if (process.env.ADMIN_PASSWORD) {
        const passwordHash = await bcrypt.hash(adminPassword, 12);
        existingAdmin.passwordHash = passwordHash;
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`✅ Admin user '${adminUsername}' password updated`);
      }
      
      return;
    }
    
    // Create new admin user
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = new User({
      username: adminUsername,
      passwordHash,
      role: 'admin'
    });
    
    await adminUser.save();
    console.log(`✅ Admin user '${adminUsername}' created successfully`);
    console.log(`⚠️  Please change the default password: ${adminPassword}`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

/**
 * Create sample data if database is empty
 */
async function createSampleData() {
  console.log('🔄 Checking for sample data...');
  
  try {
    const productCount = await Product.countDocuments();
    
    if (productCount > 0) {
      console.log(`ℹ️  Database already has ${productCount} products, skipping sample data`);
      return;
    }
    
    console.log('🔄 Creating sample products...');
    
    const sampleProducts = [
      {
        name: 'Elektr Drill',
        description: 'Professional elektr drill, 18V batareya bilan',
        price: 50000,
        category: 'Elektr asboblari',
        available: true
      },
      {
        name: 'Benzin Generator',
        description: '3kW benzin generator, portativ',
        price: 150000,
        category: 'Generatorlar',
        available: true
      },
      {
        name: 'Welding Machine',
        description: 'Inverter payvandlash apparati, 200A',
        price: 80000,
        category: 'Payvandlash',
        available: true
      },
      {
        name: 'Kompressor',
        description: 'Havo kompressori, 50L tank',
        price: 120000,
        category: 'Kompressorlar',
        available: true
      },
      {
        name: 'Angle Grinder',
        description: 'Burchak tegirmoni, 125mm disk',
        price: 35000,
        category: 'Elektr asboblari',
        available: true
      }
    ];
    
    await Product.insertMany(sampleProducts);
    console.log(`✅ Created ${sampleProducts.length} sample products`);
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
}

/**
 * Create database backup
 */
export async function createBackup() {
  console.log('🔄 Creating database backup...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `rentacloud-backup-${timestamp}`;
    
    // This would typically use mongodump command
    console.log(`📦 Backup would be created as: ${backupName}`);
    console.log('ℹ️  Use mongodump command for actual backup:');
    console.log(`   mongodump --uri="${MONGO_URL}" --out=./backups/${backupName}`);
    
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  }
}

/**
 * Restore database from backup
 */
export async function restoreBackup(backupPath) {
  console.log(`🔄 Restoring database from: ${backupPath}`);
  
  try {
    console.log('ℹ️  Use mongorestore command for actual restore:');
    console.log(`   mongorestore --uri="${MONGO_URL}" --drop ${backupPath}`);
    
  } catch (error) {
    console.error('❌ Error restoring backup:', error);
    throw error;
  }
}

// Run initialization if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export default initializeDatabase;