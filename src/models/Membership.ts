import mongoose, { Schema, Document } from 'mongoose';

export interface IMembership extends Document {
  userId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  plan: 'monthly' | 'quarterly' | 'annual';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expiring' | 'expired';
  stripeSubscriptionId?: string;
  paystackSubscriptionCode?: string;
  paystackCustomerCode?: string;
  autoRenew: boolean;
  createdAt: Date;
}

const MembershipSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  plan: { type: String, enum: ['monthly', 'quarterly', 'annual'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expiring', 'expired'], required: true },
  stripeSubscriptionId: { type: String },
  paystackSubscriptionCode: { type: String },
  paystackCustomerCode: { type: String },
  autoRenew: { type: Boolean, default: true },
}, {
  timestamps: true
});

export default mongoose.models.Membership || mongoose.model<IMembership>('Membership', MembershipSchema);
