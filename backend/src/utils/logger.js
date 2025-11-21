import fs from 'fs';
import path from 'path';

/**
 * Enhanced logging utility for Rentacloud backend
 */
class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logDir = './logs';
    this.ensureLogDirectory();
    
    // Log levels (lower number = higher priority)
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Check if message should be logged based on current log level
   */
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const pid = process.pid;
    
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      pid,
      message,
      ...meta
    };

    return JSON.stringify(logEntry);
  }

  /**
   * Write log to file
   */
  writeToFile(level, formattedMessage) {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `${level}-${date}.log`);
    
    try {
      fs.appendFileSync(logFile, formattedMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Write to console with colors
   */
  writeToConsole(level, message, meta = {}) {
    const colors = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m',  // Yellow
      info: '\x1b[36m',  // Cyan
      debug: '\x1b[90m'  // Gray
    };
    
    const reset = '\x1b[0m';
    const timestamp = new Date().toISOString();
    
    const coloredLevel = `${colors[level]}${level.toUpperCase()}${reset}`;
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    
    console.log(`${timestamp} [${coloredLevel}] ${message}${metaStr}`);
  }

  /**
   * Generic log method
   */
  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Write to console
    this.writeToConsole(level, message, meta);
    
    // Write to file in production
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile(level, formattedMessage);
      
      // Also write to combined log
      this.writeToFile('combined', formattedMessage);
    }
  }

  /**
   * Error logging
   */
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  /**
   * Warning logging
   */
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Info logging
   */
  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  /**
   * Debug logging
   */
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  /**
   * HTTP request logging
   */
  request(req, res, responseTime) {
    const meta = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('Content-Length') || 0
    };

    const level = res.statusCode >= 400 ? 'warn' : 'info';
    this.log(level, `${req.method} ${req.originalUrl}`, meta);
  }

  /**
   * Database operation logging
   */
  database(operation, collection, meta = {}) {
    this.debug(`Database ${operation}`, {
      collection,
      ...meta
    });
  }

  /**
   * Authentication logging
   */
  auth(event, username, meta = {}) {
    this.info(`Auth ${event}`, {
      username,
      ...meta
    });
  }

  /**
   * Security event logging
   */
  security(event, details = {}) {
    this.warn(`Security event: ${event}`, details);
  }

  /**
   * Performance logging
   */
  performance(operation, duration, meta = {}) {
    const level = duration > 1000 ? 'warn' : 'info';
    this.log(level, `Performance: ${operation}`, {
      duration: `${duration}ms`,
      ...meta
    });
  }

  /**
   * Clean old log files (keep last 30 days)
   */
  cleanOldLogs() {
    const retentionDays = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const files = fs.readdirSync(this.logDir);
      
      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          this.info(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Failed to clean old logs', { error: error.message });
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Clean old logs on startup (in production)
if (process.env.NODE_ENV === 'production') {
  logger.cleanOldLogs();
}

export default logger;