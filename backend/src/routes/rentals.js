import { Router } from 'express';
import Rental from '../models/Rental.js';
import Product from '../models/Product.js';

const router = Router();

// Create a rental (start)
router.post('/', async (req, res) => {
  try {
    const { productId, clientName, clientPhone, startDate, quantity = 1 } = req.body;
    
    // Validation
    if (!productId || !clientName || !clientPhone) {
      return res.status(400).json({ 
        error: 'Product ID, client name, and phone are required' 
      });
    }
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }
    
    // Validate phone format (basic)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
    if (!phoneRegex.test(clientPhone.trim())) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const rental = await Rental.create({
      product: product._id,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      startDate: startDate ? new Date(startDate) : new Date(),
      quantity: Math.max(1, parseInt(quantity) || 1),
    });
    
    console.log(`✅ New rental created: ${rental._id} for ${clientName}`);
    res.status(201).json(await rental.populate('product'));
  } catch (err) {
    console.error('❌ Error creating rental:', err);
    res.status(400).json({ error: err.message });
  }
});

// Set return date and auto-calc totals
router.put('/:id/return', async (req, res) => {
  try {
    const { returnDate } = req.body; // optional; defaults to now
    const rental = await Rental.findById(req.params.id).populate('product');
    if (!rental) return res.status(404).json({ error: 'Not found' });

    // Prevent double-returns
    if (rental.returnDate) {
      return res.status(400).json({ error: 'Already returned' });
    }

    const actualReturn = returnDate ? new Date(returnDate) : new Date();
    rental.returnDate = actualReturn;

    const start = new Date(rental.startDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.max(1, Math.ceil((actualReturn - start) / msPerDay));
    rental.totalDays = days;
    rental.totalPrice = days * rental.product.dailyPrice * rental.quantity;

    await rental.save();

    // Log and return populated rental for UI consistency
    try { console.log(`[rental:return] id=${rental._id} days=${days} total=${rental.totalPrice}`); } catch {}
    await rental.populate('product');
    res.json(rental);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List rentals (history)
router.get('/', async (_req, res) => {
  const rentals = await Rental.find().populate('product').sort({ createdAt: -1 });
  res.json(rentals);
});

// Read single rental
router.get('/:id', async (req, res) => {
  const rental = await Rental.findById(req.params.id).populate('product');
  if (!rental) return res.status(404).json({ error: 'Not found' });
  res.json(rental);
});

export default router;



