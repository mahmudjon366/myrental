const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    // Add search functionality
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Filter by availability status
    if (status === 'available') {
      query.availableQuantity = { $gt: 0 };
    } else if (status === 'rented') {
      query.$expr = { $lt: ['$availableQuantity', '$totalQuantity'] };
    }

    const products = await Product.find(query).sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const { name, price, totalQuantity, description, category } = req.body;
    
    const product = new Product({
      name,
      price,
      totalQuantity,
      availableQuantity: totalQuantity,
      description,
      category
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, price, totalQuantity, description, category } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate the difference in quantity
    const quantityDifference = totalQuantity - product.totalQuantity;
    
    product.name = name;
    product.price = price;
    product.totalQuantity = totalQuantity;
    product.availableQuantity = Math.max(0, product.availableQuantity + quantityDifference);
    product.description = description;
    product.category = category;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product has active rentals
    if (product.availableQuantity < product.totalQuantity) {
      return res.status(400).json({ 
        message: 'Cannot delete product with active rentals' 
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const availableProducts = await Product.countDocuments({ availableQuantity: { $gt: 0 } });
    const rentedProducts = await Product.countDocuments({ 
      $expr: { $lt: ['$availableQuantity', '$totalQuantity'] }
    });

    const stats = {
      total: totalProducts,
      available: availableProducts,
      rented: rentedProducts,
      outOfStock: totalProducts - availableProducts
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;