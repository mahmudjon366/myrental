import { Router } from 'express';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const router = Router();

/**
 * Basic health check endpoint
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'rentacloud-backend'
  });
});

/**
 * Detailed health check with system information
 */
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'rentacloud-backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      
      // System information
      system: {
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
        },
        cpu: {
          usage: process.cpuUsage()
        },
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      },
      
      // Database health
      database: await checkDatabaseHealth(),
      
      // Dependencies health
      dependencies: {
        mongoose: mongoose.version,
        node: process.version
      }
    };

    const responseTime = Date.now() - startTime;
    healthData.responseTime = `${responseTime}ms`;

    // Log health check
    logger.debug('Health check performed', {
      responseTime,
      databaseStatus: healthData.database.status
    });

    res.status(200).json(healthData);
    
  } catch (error) {
    logger.error('Health check failed', {
      error: error.message,
      stack: error.stack
    });

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      service: 'rentacloud-backend'
    });
  }
});

/**
 * Database-specific health check
 */
router.get('/database', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    if (dbHealth.status === 'healthy') {
      res.status(200).json(dbHealth);
    } else {
      res.status(503).json(dbHealth);
    }
    
  } catch (error) {
    logger.error('Database health check failed', {
      error: error.message
    });

    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Readiness probe (for Kubernetes/Docker)
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if database is ready
    const dbHealth = await checkDatabaseHealth();
    
    if (dbHealth.status === 'healthy') {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        reason: 'Database not available',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Liveness probe (for Kubernetes/Docker)
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Check database health
 */
async function checkDatabaseHealth() {
  const startTime = Date.now();
  
  try {
    // Check connection state
    const connectionState = mongoose.connection.readyState;
    const stateNames = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    if (connectionState !== 1) {
      return {
        status: 'unhealthy',
        state: stateNames[connectionState],
        timestamp: new Date().toISOString()
      };
    }

    // Perform a simple database operation
    await mongoose.connection.db.admin().ping();
    
    const responseTime = Date.now() - startTime;
    
    // Get database stats
    const stats = await mongoose.connection.db.stats();
    
    return {
      status: 'healthy',
      state: stateNames[connectionState],
      responseTime: `${responseTime}ms`,
      database: mongoose.connection.db.databaseName,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      stats: {
        collections: stats.collections,
        dataSize: Math.round(stats.dataSize / 1024 / 1024), // MB
        storageSize: Math.round(stats.storageSize / 1024 / 1024), // MB
        indexes: stats.indexes,
        indexSize: Math.round(stats.indexSize / 1024 / 1024) // MB
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };
  }
}

export default router;