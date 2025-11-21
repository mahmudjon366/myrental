import jwt from 'jsonwebtoken';

// Use environment variable for JWT secret with fallback
const JWT_SECRET = process.env.JWT_SECRET || 'rentacloud_super_secret_jwt_key_2025_production_ready';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Unauthorized: Missing token',
      code: 'MISSING_TOKEN'
    });
  }
  
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      audience: 'rentacloud-frontend',
      issuer: 'rentacloud-api'
    });
    
    // Check token age (additional security)
    const tokenAge = Date.now() / 1000 - payload.iat;
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    
    if (tokenAge > maxAge) {
      return res.status(401).json({ 
        error: 'Unauthorized: Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    req.user = payload;
    next();
  } catch (err) {
    let errorCode = 'INVALID_TOKEN';
    let errorMessage = 'Unauthorized: Invalid token';
    
    if (err.name === 'TokenExpiredError') {
      errorCode = 'TOKEN_EXPIRED';
      errorMessage = 'Unauthorized: Token expired';
    } else if (err.name === 'JsonWebTokenError') {
      errorCode = 'MALFORMED_TOKEN';
      errorMessage = 'Unauthorized: Malformed token';
    }
    
    return res.status(401).json({ 
      error: errorMessage,
      code: errorCode
    });
  }
}

// Special middleware for report access - checks for specific user
export function requireReportAccess(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Unauthorized: Missing token',
      code: 'MISSING_TOKEN'
    });
  }
  
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      audience: 'rentacloud-frontend',
      issuer: 'rentacloud-api'
    });
    
    // Check if user has admin or reporter role
    if (payload.role !== 'admin' && payload.role !== 'reporter') {
      console.warn(`🚫 Report access denied for user ${payload.username} with role ${payload.role}`);
      return res.status(403).json({ 
        error: 'Forbidden: Insufficient permissions for reports',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    // Additional check for report access flag
    if (!payload.reportAccess) {
      return res.status(403).json({ 
        error: 'Forbidden: Report access not granted',
        code: 'REPORT_ACCESS_DENIED'
      });
    }
    
    req.user = payload;
    next();
  } catch (err) {
    let errorCode = 'INVALID_TOKEN';
    let errorMessage = 'Unauthorized: Invalid token';
    
    if (err.name === 'TokenExpiredError') {
      errorCode = 'TOKEN_EXPIRED';
      errorMessage = 'Unauthorized: Token expired';
    } else if (err.name === 'JsonWebTokenError') {
      errorCode = 'MALFORMED_TOKEN';
      errorMessage = 'Unauthorized: Malformed token';
    }
    
    return res.status(401).json({ 
      error: errorMessage,
      code: errorCode
    });
  }
}