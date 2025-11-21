import logger from '../utils/logger.js';

/**
 * Enhanced request logging middleware
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();
  
  // Log request start
  logger.debug('Request started', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length')
  });

  // Override res.end to capture response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Log request completion
    logger.request(req, res, responseTime);
    
    // Log slow requests
    if (responseTime > 1000) {
      logger.performance('Slow request', responseTime, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode
      });
    }
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
}

/**
 * Error logging middleware
 */
export function errorLogger(err, req, res, next) {
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });

  next(err);
}

/**
 * Security event logging middleware
 */
export function securityLogger(event) {
  return (req, res, next) => {
    logger.security(event, {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method
    });
    
    next();
  };
}