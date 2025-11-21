import { Router } from 'express';
import Rental from '../models/Rental.js';
import { requireReportAccess } from '../middleware/auth.js';

const router = Router();

// Error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// All rentals - protected route
router.get('/rentals', requireReportAccess, asyncHandler(async (req, res) => {
  const rentals = await Rental.find().populate('product').sort({ createdAt: -1 });
  res.json(rentals);
}));

// Total income - protected route
router.get('/income/total', requireReportAccess, asyncHandler(async (req, res) => {
  const agg = await Rental.aggregate([
    { $match: { totalPrice: { $ne: null } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);
  res.json({ total: agg[0]?.total || 0 });
}));

// Monthly income (YYYY-MM) - protected route
router.get('/income/monthly/:ym', requireReportAccess, asyncHandler(async (req, res) => {
  const [yearStr, monthStr] = req.params.ym.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (!year || !month || month < 1 || month > 12) {
    return res.status(400).json({ error: 'Invalid ym format, expected YYYY-MM' });
  }
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const agg = await Rental.aggregate([
    { $match: { returnDate: { $gte: start, $lt: end }, totalPrice: { $ne: null } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);
  res.json({ ym: req.params.ym, total: agg[0]?.total || 0 });
}));

export default router;