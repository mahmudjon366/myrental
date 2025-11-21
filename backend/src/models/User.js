import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'reporter'], default: 'user' }, // Add role field
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);