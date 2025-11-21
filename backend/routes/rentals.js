const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// Get all rentals
router.get('/', async (req, res) => {
  try {
    const { status, customer, product, page = 1, limit = 10 } = req.query;
    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by customer
    if (customer) {
      query.customer = customer;
    }

    // Filter by product
    if (product) {
      query.product = product;
    }

    const rentals = await Rental.find(query)
      .populate('product', 'name price category')
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Rental.countDocuments(query);

    res.json({
      rentals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single rental
router.get('/:id', async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('product')
      .populate('customer');
    
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    
    res.json(rental);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new rental
router.post('/', async (req, res) => {
  try {
    const { productId, customerId, quantity, startDate, endDate, notes } = req.body;

    // Validate product and customer exist
    const product = await Product.findById(productId);
    const customer = await Customer.findById(customerId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if enough quantity is available
    if (product.availableQuantity < quantity) {
      return res.status(400).json({ 
        message: `Only ${product.availableQuantity} units available` 
      });
    }

    // Calculate total amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalAmount = diffDays * product.price * quantity;

    // Create rental
    const rental = new Rental({
      product: productId,
      customer: customerId,
      quantity,
      startDate: start,
      endDate: end,
      dailyRate: product.price,
      totalAmount,
      notes
    });

    const savedRental = await rental.save();

    // Update product available quantity
    product.availableQuantity -= quantity;
    await product.save();

    // Update customer statistics
    customer.totalRentals += 1;
    customer.totalSpent += totalAmount;
    await customer.save();

    // Populate the saved rental before returning
    const populatedRental = await Rental.findById(savedRental._id)
      .populate('product', 'name price category')
      .populate('customer', 'name phone');

    res.status(201).json(populatedRental);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Return rental
router.patch('/:id/return', async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('product')
      .populate('customer');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (rental.status !== 'active') {
      return res.status(400).json({ message: 'Rental is not active' });
    }

    const returnDate = new Date();
    const actualDays = Math.ceil((returnDate - rental.startDate) / (1000 * 60 * 60 * 24));
    const finalAmount = actualDays * rental.dailyRate * rental.quantity;

    // Update rental
    rental.status = 'returned';
    rental.returnedDate = returnDate;
    rental.actualDays = actualDays;
    rental.finalAmount = finalAmount;

    await rental.save();

    // Update product available quantity
    const product = await Product.findById(rental.product._id);
    product.availableQuantity += rental.quantity;
    await product.save();

    // Update customer total spent if final amount is different
    if (finalAmount !== rental.totalAmount) {
      const customer = await Customer.findById(rental.customer._id);
      customer.totalSpent = customer.totalSpent - rental.totalAmount + finalAmount;
      await customer.save();
    }

    res.json(rental);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update rental
router.put('/:id', async (req, res) => {
  try {
    const { quantity, startDate, endDate, notes } = req.body;
    
    const rental = await Rental.findById(req.params.id)
      .populate('product')
      .populate('customer');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (rental.status !== 'active') {
      return res.status(400).json({ message: 'Can only update active rentals' });
    }

    // If quantity is changing, check availability
    if (quantity !== rental.quantity) {
      const quantityDifference = quantity - rental.quantity;
      if (quantityDifference > 0 && rental.product.availableQuantity < quantityDifference) {
        return res.status(400).json({ 
          message: `Only ${rental.product.availableQuantity} additional units available` 
        });
      }

      // Update product availability
      const product = await Product.findById(rental.product._id);
      product.availableQuantity -= quantityDifference;
      await product.save();
    }

    // Update rental details
    rental.quantity = quantity;
    rental.startDate = new Date(startDate);
    rental.endDate = new Date(endDate);
    rental.notes = notes;

    // Recalculate total amount
    const diffTime = Math.abs(rental.endDate - rental.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const oldAmount = rental.totalAmount;
    rental.totalAmount = diffDays * rental.dailyRate * rental.quantity;

    await rental.save();

    // Update customer total spent
    const customer = await Customer.findById(rental.customer._id);
    customer.totalSpent = customer.totalSpent - oldAmount + rental.totalAmount;
    await customer.save();

    res.json(rental);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete rental (cancel)
router.delete('/:id', async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // If rental is active, return the quantity to product
    if (rental.status === 'active') {
      const product = await Product.findById(rental.product);
      product.availableQuantity += rental.quantity;
      await product.save();

      // Update customer statistics
      const customer = await Customer.findById(rental.customer);
      customer.totalRentals -= 1;
      customer.totalSpent -= rental.totalAmount;
      await customer.save();
    }

    await Rental.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rental cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get rental statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const activeRentals = await Rental.countDocuments({ status: 'active' });
    const totalRentals = await Rental.countDocuments();
    const overdueRentals = await Rental.countDocuments({ 
      status: 'active',
      endDate: { $lt: new Date() }
    });

    // Calculate total revenue
    const revenueResult = await Rental.aggregate([
      {
        $match: { status: 'returned' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const stats = {
      active: activeRentals,
      total: totalRentals,
      overdue: overdueRentals,
      returned: totalRentals - activeRentals,
      totalRevenue
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;