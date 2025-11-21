const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue'],
    default: 'active'
  },
  returnedDate: {
    type: Date
  },
  actualDays: {
    type: Number
  },
  finalAmount: {
    type: Number
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate rental duration and total amount before saving
rentalSchema.pre('save', function(next) {
  if (this.isNew || this.isModified(['startDate', 'endDate', 'dailyRate'])) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.totalAmount = diffDays * this.dailyRate * this.quantity;
  }
  next();
});

// Index for efficient querying
rentalSchema.index({ product: 1, status: 1 });
rentalSchema.index({ customer: 1, status: 1 });
rentalSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Rental', rentalSchema);