import logger from '../utils/logger.js';

/**
 * Simple in-memory cache for API responses
 */
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100; // Maximum number of cached items
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  }

  /**
   * Generate cache key from request
   */
  generateKey(req) {
    const { method, originalUrl, query, user } = req;
    const userId = user?.userId || 'anonymous';
    return `${method}:${originalUrl}:${JSON.stringify(query)}:${userId}`;
  }

  /**
   * Get cached response
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Set cached response
   */
  set(key, data, ttl = this.defaultTTL) {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
    };
  }
}

// Create cache instance
const cache = new MemoryCache();

/**
 * Cache middleware factory
 */
export function cacheMiddleware(options = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes
    skipCache = false,
    keyGenerator = null
  } = options;

  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET' || skipCache) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator ? keyGenerator(req) : cache.generateKey(req);
    
    // Try to get from cache
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      logger.debug('Cache hit', { key: cacheKey });
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    // Cache miss - intercept response
    logger.debug('Cache miss', { key: cacheKey });
    res.setHeader('X-Cache', 'MISS');

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        cache.set(cacheKey, data, ttl);
        logger.debug('Response cached', { key: cacheKey, ttl });
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * Cache for products (longer TTL since they don't change often)
 */
export const productCache = cacheMiddleware({
  ttl: 10 * 60 * 1000, // 10 minutes
  keyGenerator: (req) => `products:${req.originalUrl}:${JSON.stringify(req.query)}`
});

/**
 * Cache for reports (shorter TTL since data changes more frequently)
 */
export const reportCache = cacheMiddleware({
  ttl: 2 * 60 * 1000, // 2 minutes
  keyGenerator: (req) => `reports:${req.originalUrl}:${req.user?.userId}`
});

/**
 * Cache for rentals (very short TTL since they change frequently)
 */
export const rentalCache = cacheMiddleware({
  ttl: 30 * 1000, // 30 seconds
  keyGenerator: (req) => `rentals:${req.originalUrl}:${JSON.stringify(req.query)}`
});

/**
 * Clear cache endpoint (for admin use)
 */
export function clearCache(req, res) {
  cache.clear();
  logger.info('Cache cleared by admin', { user: req.user?.username });
  res.json({ message: 'Cache cleared successfully' });
}

/**
 * Get cache stats endpoint
 */
export function getCacheStats(req, res) {
  const stats = cache.getStats();
  res.json(stats);
}

export default cache;