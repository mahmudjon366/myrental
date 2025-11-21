const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Rental = require('../models/Rental');

// Backup all data
router.get('/export', async (req, res) => {
  try {
    const products = await Product.find({});
    const customers = await Customer.find({});
    const rentals = await Rental.find({}).populate('product customer');

    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        products,
        customers,
        rentals
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=rental_backup_${new Date().toISOString().split('T')[0]}.json`);
    res.json(backupData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Import/Restore data
router.post('/import', async (req, res) => {
  try {
    const { data, clearExisting = false } = req.body;

    if (!data || !data.products || !data.customers || !data.rentals) {
      return res.status(400).json({ message: 'Invalid backup data format' });
    }

    let result = {
      products: { imported: 0, skipped: 0, errors: 0 },
      customers: { imported: 0, skipped: 0, errors: 0 },
      rentals: { imported: 0, skipped: 0, errors: 0 }
    };

    // Clear existing data if requested
    if (clearExisting) {
      await Rental.deleteMany({});
      await Product.deleteMany({});
      await Customer.deleteMany({});
    }

    // Import products
    for (const productData of data.products) {
      try {
        const existingProduct = await Product.findById(productData._id);
        if (existingProduct && !clearExisting) {
          result.products.skipped++;
          continue;
        }

        const product = new Product({
          _id: productData._id,
          name: productData.name,
          price: productData.price,
          totalQuantity: productData.totalQuantity,
          availableQuantity: productData.availableQuantity,
          description: productData.description,
          category: productData.category,
          isActive: productData.isActive
        });

        await product.save();
        result.products.imported++;
      } catch (error) {
        result.products.errors++;
        console.error('Product import error:', error);
      }
    }

    // Import customers
    for (const customerData of data.customers) {
      try {
        const existingCustomer = await Customer.findById(customerData._id);
        if (existingCustomer && !clearExisting) {
          result.customers.skipped++;
          continue;
        }

        const customer = new Customer({
          _id: customerData._id,
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          address: customerData.address,
          isActive: customerData.isActive,
          totalRentals: customerData.totalRentals,
          totalSpent: customerData.totalSpent
        });

        await customer.save();
        result.customers.imported++;
      } catch (error) {
        result.customers.errors++;
        console.error('Customer import error:', error);
      }
    }

    // Import rentals
    for (const rentalData of data.rentals) {
      try {
        const existingRental = await Rental.findById(rentalData._id);
        if (existingRental && !clearExisting) {
          result.rentals.skipped++;
          continue;
        }

        const rental = new Rental({
          _id: rentalData._id,
          product: rentalData.product._id || rentalData.product,
          customer: rentalData.customer._id || rentalData.customer,
          quantity: rentalData.quantity,
          startDate: rentalData.startDate,
          endDate: rentalData.endDate,
          dailyRate: rentalData.dailyRate,
          totalAmount: rentalData.totalAmount,
          status: rentalData.status,
          returnedDate: rentalData.returnedDate,
          actualDays: rentalData.actualDays,
          finalAmount: rentalData.finalAmount,
          notes: rentalData.notes
        });

        await rental.save();
        result.rentals.imported++;
      } catch (error) {
        result.rentals.errors++;
        console.error('Rental import error:', error);
      }
    }

    res.json({
      message: 'Data import completed',
      result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get backup info
router.get('/info', async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    const customerCount = await Customer.countDocuments();
    const rentalCount = await Rental.countDocuments();

    const info = {
      totalRecords: productCount + customerCount + rentalCount,
      breakdown: {
        products: productCount,
        customers: customerCount,
        rentals: rentalCount
      },
      lastBackup: null // Could store this in a separate collection if needed
    };

    res.json(info);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;