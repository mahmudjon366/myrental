import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    clientName: { type: String, required: true, trim: true },
    clientPhone: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    returnDate: { type: Date },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    totalDays: { type: Number },
    totalPrice: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model('Rental', rentalSchema);



