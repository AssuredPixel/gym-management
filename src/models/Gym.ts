import mongoose, { Schema, Document } from 'mongoose';

export interface IGym extends Document {
  name: string;
  ownerName: string;
  email: string;
  size: 'small' | 'medium' | 'large';
  stripeCustomerId?: string;
  plan: 'starter' | 'pro' | 'elite';
  createdAt: Date;
}

const GymSchema: Schema = new Schema({
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  size: { type: String, enum: ['small', 'medium', 'large'], required: true },
  stripeCustomerId: { type: String },
  plan: { type: String, enum: ['starter', 'pro', 'elite'], required: true },
}, {
  timestamps: true
});

export default mongoose.models.Gym || mongoose.model<IGym>('Gym', GymSchema);
