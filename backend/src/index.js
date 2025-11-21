import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import productsRouter from './routes/products.js';
import rentalsRouter from './routes/rentals.js';
import authRouter from './routes/auth.js';
import reportsRouter from './routes/reports.js';
import healthRouter from './routes/health.js';
import { requestLogger, errorLogger } from './middleware/requestLogger.js';

const app = express();

// Import logger early
import logger from './utils/logger.js';

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason.toString(),
    promise: promise.toString()
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1); // Exit gracefully
});

// CORS configuration with enhanced security
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'production' 
    ? ['https://rentacloudorg.netlify.app']
    : [
        'http://localhost:5173', 
        'http://127.0.0.1:5173', 
        'http://localhost:3000',
        'http://localhost:4000',
        'http://127.0.0.1:4000'
      ];

// Enhanced CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow localhost with any port
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Reject other origins
    const msg = `CORS policy violation: Origin ${origin} not allowed`;
    console.warn(`🚫 ${msg}`);
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200 // For legacy browser support
}));
// Security middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Basic JSON validation
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Response compression
app.use(compression({
  filter: (req, res) => {
    // Don't compress responses if the client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  },
  level: 6, // Compression level (1-9, 6 is good balance)
  threshold: 1024, // Only compress responses larger than 1KB
  memLevel: 8 // Memory usage level (1-9)
}));

// Security headers middleware
app.use((req, res, next) => {
  // Remove server signature
  res.removeHeader('X-Powered-By');
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // API rate limiting headers
  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Window', '60');
  
  next();
});

// Enhanced request logging
app.use(requestLogger);

// Morgan for additional HTTP logging (in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Basic request validation
app.use((req, res, next) => {
  // Block requests with suspicious patterns
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JavaScript protocol
    /vbscript:/i,  // VBScript protocol
  ];
  
  const fullUrl = req.originalUrl;
  const userAgent = req.get('User-Agent') || '';
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl) || pattern.test(userAgent)) {
      console.warn(`🚫 Suspicious request blocked: ${req.method} ${fullUrl} from ${req.ip}`);
      return res.status(400).json({ error: 'Bad Request' });
    }
  }
  
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'rentals-backend' });
});

app.use('/api/products', productsRouter);
app.use('/api/rentals', rentalsRouter);
app.use('/api/auth', authRouter);
app.use('/api/reports', reportsRouter);
app.use('/health', healthRouter);

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
// Use environment MONGO_URL or fallback to in-memory
const MONGO_URL = process.env.MONGO_URL;

// MongoDB connection event handlers
mongoose.connection.on('connecting', () => {
  console.log('⏳ MongoDB: Connecting to database...');  
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB: Successfully connected to database!');
  console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
  // Provide specific guidance for common connection issues
  if (err.name === 'MongooseServerSelectionError') {
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Check if your MongoDB Atlas IP is whitelisted');
    console.error('2. Verify your MongoDB connection string in .env file');
    console.error('3. Ensure you have internet connectivity');
    console.error('4. For local development, consider using MongoDB locally');
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('ℹ️  MongoDB: Disconnected from database');
  
  // Attempt to reconnect in production
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Attempting to reconnect to MongoDB...');
    setTimeout(() => {
      mongoose.connect(MONGO_URL).catch(err => {
        console.error('❌ Reconnection failed:', err.message);
      });
    }, 5000); // Wait 5 seconds before reconnecting
  }
});

// Handle reconnection
mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB: Reconnected to database');
});

// Handle connection timeout
mongoose.connection.on('timeout', () => {
  console.warn('⏰ MongoDB: Connection timeout');
});

// Handle connection close
mongoose.connection.on('close', () => {
  console.log('📤 MongoDB: Connection closed');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 SIGINT received, shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

async function start() {
  try {
    const mongoUri = MONGO_URL;
    
    if (!mongoUri) {
      throw new Error('MONGO_URL environment variable is not set!');
    }
    
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log(`🔗 Connection string: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
    
    await mongoose.connect(mongoUri, {
          // Connection timeout settings
          serverSelectionTimeoutMS: 10000, // 10 seconds
          socketTimeoutMS: 45000, // 45 seconds
          connectTimeoutMS: 10000, // 10 seconds
          
          // Connection pool settings
          maxPoolSize: 10, // Maximum number of connections
          minPoolSize: 2,  // Minimum number of connections
          maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
          
          // Buffering settings (handled by Mongoose, not MongoDB driver)
          // bufferMaxEntries: 0, // Removed - not supported by MongoDB driver
          // bufferCommands: false, // Removed - not supported by MongoDB driver
          
          // Retry settings
          retryWrites: true,
          retryReads: true,
          
          // Heartbeat settings
          heartbeatFrequencyMS: 10000, // 10 seconds
          
          // Compression
          compressors: ['zlib'],
          
          // Read/Write concerns
          readPreference: 'primary',
          writeConcern: {
            w: 'majority',
            j: true,
            wtimeout: 10000
          }
        });
    console.log('✅ Successfully connected to MongoDB!');
    
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      console.log('📡 API endpoints are available at:');
      console.log(`   - http://localhost:${PORT}/api/products`);
      console.log(`   - http://localhost:${PORT}/api/rentals`);
      console.log(`   - http://localhost:${PORT}/api/auth`);
      console.log(`   - http://localhost:${PORT}/api/reports\n`);
    });

    // Handle server errors
    server.on('error', (err) => {
      console.error('❌ Server error:', err.message);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please close the application using this port or use a different port.`);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('\n❌ Failed to start server:', err.message);
    console.error('Error details:', err);
    
    // Provide specific guidance based on error type
    if (err.name === 'MongooseServerSelectionError') {
      console.error('\n🔧 MongoDB Connection Troubleshooting:');
      console.error('1. If using MongoDB Atlas, whitelist your current IP address at:');
      console.error('   https://cloud.mongodb.com/v2#/orgs/YOUR_ORG_ID/access/whitelist');
      console.error('2. For local development, install MongoDB locally or use Docker');
      console.error('3. Alternatively, temporarily allow access from anywhere (0.0.0.0/0)');
      console.error('   in your Atlas IP whitelist (not recommended for production)');
    }
    
    process.exit(1);
  }
}

start();