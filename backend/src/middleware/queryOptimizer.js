import logger from '../utils/logger.js';

/**
 * Query optimization middleware for MongoDB operations
 */
export function queryOptimizer(req, res, next) {
  // Add query optimization hints
  req.queryOptions = {
    // Default pagination
    limit: Math.min(parseInt(req.query.limit) || 50, 100), // Max 100 items
    skip: parseInt(req.query.skip) || 0,
    
    // Sorting
    sort: req.query.sort || { createdAt: -1 },
    
    // Field selection (projection)
    select: req.query.fields ? req.query.fields.split(',').join(' ') : null,
    
    // Population options
    populate: req.query.populate ? req.query.populate.split(',') : null
  };

  // Add search optimization
  if (req.query.search) {
    req.searchQuery = {
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]
    };
  }

  // Add date range filtering
  if (req.query.startDate || req.query.endDate) {
    req.dateFilter = {};
    if (req.query.startDate) {
      req.dateFilter.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      req.dateFilter.$lte = new Date(req.query.endDate);
    }
  }

  next();
}

/**
 * Performance monitoring for database queries
 */
export function queryPerformanceMonitor(modelName) {
  return function(req, res, next) {
    const startTime = Date.now();
    
    // Override res.json to measure query time
    const originalJson = res.json;
    res.json = function(data) {
      const queryTime = Date.now() - startTime;
      
      // Log slow queries
      if (queryTime > 1000) {
        logger.warn('Slow database query detected', {
          model: modelName,
          queryTime: `${queryTime}ms`,
          url: req.originalUrl,
          method: req.method,
          query: req.query
        });
      }
      
      // Add performance headers
      res.setHeader('X-Query-Time', `${queryTime}ms`);
      res.setHeader('X-Model', modelName);
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Pagination helper
 */
export function paginationHelper(req, res, next) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    skip,
    
    // Helper function to create paginated response
    createResponse: (data, total) => ({
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  };

  next();
}

/**
 * Field validation middleware
 */
export function fieldValidator(allowedFields) {
  return (req, res, next) => {
    if (req.query.fields) {
      const requestedFields = req.query.fields.split(',');
      const invalidFields = requestedFields.filter(field => !allowedFields.includes(field));
      
      if (invalidFields.length > 0) {
        return res.status(400).json({
          error: 'Invalid fields requested',
          invalidFields,
          allowedFields
        });
      }
    }
    
    next();
  };
}

/**
 * Sort validation middleware
 */
export function sortValidator(allowedSortFields) {
  return (req, res, next) => {
    if (req.query.sort) {
      const sortField = req.query.sort.replace(/^-/, ''); // Remove - prefix
      
      if (!allowedSortFields.includes(sortField)) {
        return res.status(400).json({
          error: 'Invalid sort field',
          field: sortField,
          allowedFields: allowedSortFields
        });
      }
    }
    
    next();
  };
}