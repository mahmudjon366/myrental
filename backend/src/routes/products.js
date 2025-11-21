import { Router } from 'express';
import Product from '../models/Product.js';

// Add input sanitization
import { body, validationResult } from 'express-validator';

// Performance middleware
import { productCache } from '../middleware/cache.js';
import { 
  queryOptimizer, 
  queryPerformanceMonitor, 
  paginationHelper,
  fieldValidator,
  sortValidator 
} from '../middleware/queryOptimizer.js';
import logger from '../utils/logger.js';

const router = Router();

// Validation middleware for product creation
const validateProduct = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('dailyPrice').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('imageUrl').optional({ nullable: true }).custom((value) => {
    // Allow empty strings, null, or undefined
    if (!value) return true;
    // For non-empty values, validate as URL
    try {
      new URL(value);
      return true;
    } catch {
      throw new Error('Image URL must be valid');
    }
  }),
];

// Create
router.post('/', validateProduct, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        errors: errors.array()
      });
    }
    
    console.log('POST /api/products called with:', req.body);
    
    // 1. Validate required fields
    const { name, dailyPrice, imageUrl } = req.body;
    
    // 2. Create product
    const product = await Product.create({ 
      name: name.trim(), 
      dailyPrice: Number(dailyPrice), 
      imageUrl: imageUrl || '' 
    });
    
    console.log('Created product:', product);
    res.status(201).json({ 
      success: true, 
      data: product 
    });
    
  } catch (err) {
    console.error('Error creating product:', err);
    
    // Handle duplicate key error (if name is unique)
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product with this name already exists',
        field: 'name'
      });
    }
    
    // Handle other mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = {};
      Object.keys(err.errors).forEach(key => {
        errors[key] = err.errors[key].message;
      });
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        errors 
      });
    }
    
    // For any other errors
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Read all with performance optimizations
router.get('/', 
  queryOptimizer,
  paginationHelper,
  fieldValidator(['name', 'dailyPrice', 'imageUrl', 'createdAt', 'updatedAt']),
  sortValidator(['name', 'dailyPrice', 'createdAt', 'updatedAt']),
  queryPerformanceMonitor('Product'),
  productCache,
  async (req, res) => {
    try {
      logger.debug('GET /api/products called', { 
        query: req.query,
        pagination: req.pagination 
      });

      // Build query
      let query = {};
      
      // Add search if provided
      if (req.searchQuery) {
        query = { ...query, ...req.searchQuery };
      }

      // Add date filter if provided
      if (req.dateFilter) {
        query.createdAt = req.dateFilter;
      }

      // Get total count for pagination
      const total = await Product.countDocuments(query);

      // Execute optimized query
      let productQuery = Product.find(query);

      // Apply sorting
      if (req.queryOptions.sort) {
        productQuery = productQuery.sort(req.queryOptions.sort);
      }

      // Apply pagination
      productQuery = productQuery
        .skip(req.pagination.skip)
        .limit(req.pagination.limit);

      // Apply field selection if specified
      if (req.queryOptions.select) {
        productQuery = productQuery.select(req.queryOptions.select);
      }

      // Execute query
      const products = await productQuery.lean(); // Use lean() for better performance

      logger.debug('Products fetched successfully', { 
        count: products.length,
        total,
        page: req.pagination.page
      });

      // Return paginated response
      res.json(req.pagination.createResponse(products, total));

    } catch (err) {
      logger.error('Error fetching products', { 
        error: err.message,
        stack: err.stack,
        query: req.query
      });
      res.status(500).json({ 
        error: 'Failed to fetch products',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

// Read one with caching
router.get('/:id', 
  queryPerformanceMonitor('Product'),
  productCache,
  async (req, res) => {
    try {
      // Validate ID format
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
      
      logger.debug('GET /api/products/:id called', { id: req.params.id });

      // Use lean() for better performance since we're not modifying
      const product = await Product.findById(req.params.id).lean();
      
      if (!product) {
        logger.warn('Product not found', { id: req.params.id });
        return res.status(404).json({ error: 'Product not found' });
      }

      logger.debug('Product fetched successfully', { id: req.params.id });
      res.json(product);

    } catch (err) {
      logger.error('Error fetching product', { 
        error: err.message,
        id: req.params.id
      });
      res.status(500).json({ 
        error: 'Failed to fetch product',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

// Validation middleware for product update
const validateProductUpdate = [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
  body('dailyPrice').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('imageUrl').optional({ nullable: true }).custom((value) => {
    // Allow empty strings, null, or undefined
    if (!value) return true;
    // For non-empty values, validate as URL
    try {
      new URL(value);
      return true;
    } catch {
      throw new Error('Image URL must be valid');
    }
  }),
];

// Update
router.put('/:id', validateProductUpdate, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        errors: errors.array()
      });
    }
    
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const { name, dailyPrice, imageUrl } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, dailyPrice, imageUrl },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  // Validate ID format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }
  
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;