const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const ExcelJS = require('exceljs');

// Get daily reports
router.get('/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Set date range for the day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get rentals created on this day
    const newRentals = await Rental.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).populate('product', 'name price').populate('customer', 'name');

    // Get rentals returned on this day
    const returnedRentals = await Rental.find({
      returnedDate: { $gte: startOfDay, $lte: endOfDay },
      status: 'returned'
    }).populate('product', 'name price').populate('customer', 'name');

    // Calculate revenue
    const dailyRevenue = returnedRentals.reduce((total, rental) => {
      return total + (rental.finalAmount || rental.totalAmount);
    }, 0);

    const report = {
      date: targetDate.toISOString().split('T')[0],
      newRentals: newRentals.length,
      returnedRentals: returnedRentals.length,
      dailyRevenue,
      newRentalsList: newRentals,
      returnedRentalsList: returnedRentals
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly reports
router.get('/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();

    // Set date range for the month
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    // Get rentals data for the month
    const monthlyRentals = await Rental.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$createdAt' },
            product: '$product'
          },
          count: { $sum: 1 },
          quantity: { $sum: '$quantity' },
          revenue: { $sum: '$totalAmount' },
          productName: { $first: { $arrayElemAt: ['$productInfo.name', 0] } }
        }
      },
      {
        $sort: { '_id.day': 1 }
      }
    ]);

    // Get returned rentals for actual revenue
    const returnedRevenue = await Rental.aggregate([
      {
        $match: {
          returnedDate: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'returned'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' }
        }
      }
    ]);

    // Get top products for the month
    const topProducts = await Rental.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
          rentalCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $project: {
          productName: { $arrayElemAt: ['$productInfo.name', 0] },
          totalQuantity: 1,
          totalRevenue: 1,
          rentalCount: 1
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const report = {
      year: targetYear,
      month: targetMonth + 1,
      monthName: new Date(targetYear, targetMonth).toLocaleString('default', { month: 'long' }),
      totalRentals: monthlyRentals.reduce((sum, item) => sum + item.count, 0),
      totalRevenue: returnedRevenue.length > 0 ? returnedRevenue[0].totalRevenue : 0,
      dailyBreakdown: monthlyRentals,
      topProducts
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chart data for dashboard
router.get('/charts/revenue', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    let startDate, groupBy;

    const now = new Date();
    
    if (period === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = {
        year: { $year: '$returnedDate' },
        month: { $month: '$returnedDate' },
        day: { $dayOfMonth: '$returnedDate' }
      };
    } else if (period === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = {
        year: { $year: '$returnedDate' },
        month: { $month: '$returnedDate' },
        day: { $dayOfMonth: '$returnedDate' }
      };
    } else if (period === '12m') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      groupBy = {
        year: { $year: '$returnedDate' },
        month: { $month: '$returnedDate' }
      };
    }

    const revenueData = await Rental.aggregate([
      {
        $match: {
          returnedDate: { $gte: startDate },
          status: 'returned'
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$finalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json(revenueData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export daily report to Excel
router.get('/export/daily/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const rentals = await Rental.find({
      $or: [
        { createdAt: { $gte: startOfDay, $lte: endOfDay } },
        { returnedDate: { $gte: startOfDay, $lte: endOfDay } }
      ]
    }).populate('product', 'name price').populate('customer', 'name phone');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Daily Report');

    // Add headers
    worksheet.columns = [
      { header: 'Rental ID', key: 'id', width: 15 },
      { header: 'Product', key: 'product', width: 20 },
      { header: 'Customer', key: 'customer', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Start Date', key: 'startDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Amount', key: 'amount', width: 15 }
    ];

    // Add data
    rentals.forEach(rental => {
      worksheet.addRow({
        id: rental._id.toString(),
        product: rental.product.name,
        customer: rental.customer.name,
        phone: rental.customer.phone,
        quantity: rental.quantity,
        startDate: rental.startDate.toISOString().split('T')[0],
        endDate: rental.endDate.toISOString().split('T')[0],
        status: rental.status,
        amount: rental.finalAmount || rental.totalAmount
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=daily_report_${date}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export monthly report to Excel
router.get('/export/monthly/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const targetYear = parseInt(year);
    const targetMonth = parseInt(month) - 1;

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const rentals = await Rental.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }).populate('product', 'name price').populate('customer', 'name phone');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Monthly Report');

    worksheet.columns = [
      { header: 'Rental ID', key: 'id', width: 15 },
      { header: 'Product', key: 'product', width: 20 },
      { header: 'Customer', key: 'customer', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Start Date', key: 'startDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Amount', key: 'amount', width: 15 }
    ];

    rentals.forEach(rental => {
      worksheet.addRow({
        id: rental._id.toString(),
        product: rental.product.name,
        customer: rental.customer.name,
        phone: rental.customer.phone,
        quantity: rental.quantity,
        startDate: rental.startDate.toISOString().split('T')[0],
        endDate: rental.endDate.toISOString().split('T')[0],
        status: rental.status,
        amount: rental.finalAmount || rental.totalAmount
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=monthly_report_${year}_${month}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;