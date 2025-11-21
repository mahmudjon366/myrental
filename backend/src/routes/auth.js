import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

// Use environment variable for JWT secret with fallback
const JWT_SECRET = process.env.JWT_SECRET || 'rentacloud_super_secret_jwt_key_2025_production_ready';

// Simple login endpoint for general access (no authentication required)
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Input validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  // Always return a success response (no actual authentication)
  res.json({ message: 'Login successful (no authentication required)' });
});

// Report login endpoint with proper authentication
router.post('/report-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find user in database
    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Check if user has permission for reports
    if (user.role !== 'admin' && user.role !== 'reporter') {
      return res.status(403).json({ error: 'Insufficient permissions for reports' });
    }
    
    // Generate JWT token with configurable expiration
    const tokenExpiration = process.env.JWT_EXPIRES_IN || '24h';
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        role: user.role,
        reportAccess: true,
        iat: Math.floor(Date.now() / 1000),
        iss: 'rentacloud-api'
      },
      JWT_SECRET,
      { 
        expiresIn: tokenExpiration,
        audience: 'rentacloud-frontend',
        issuer: 'rentacloud-api'
      }
    );
    
    res.json({ 
      success: true,
      token,
      user: {
        username: user.username,
        role: user.role
      },
      message: 'Report access granted'
    });
    
  } catch (error) {
    console.error('Report login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;