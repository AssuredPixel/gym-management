import mongoose, { Schema, Document } from 'mongoose';

export interface IGym extends Document {
  name: string;
  ownerName: string;
  email: string;
  phone?: string;
  address?: string;
  size: 'small' | 'medium' | 'large';
  stripeCustomerId?: string;
  plan: 'starter' | 'pro' | 'elite';
  businessHours?: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
  createdAt: Date;
}

const GymSchema: Schema = new Schema({
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  size: { type: String, enum: ['small', 'medium', 'large'], required: true },
  stripeCustomerId: { type: String },
  plan: { type: String, enum: ['starter', 'pro', 'elite'], required: true },
  businessHours: [{
    day: { type: String, required: true },
    open: { type: String, default: '06:00' },
    close: { type: String, default: '21:00' },
    isClosed: { type: Boolean, default: false }
  }],
}, {
  timestamps: true
});

export default mongoose.models.Gym || mongoose.model<IGym>('Gym', GymSchema);
