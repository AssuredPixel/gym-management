import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  gymId: mongoose.Types.ObjectId;
  type: 'member_added' | 'payment_received' | 'class_created';
  description: string;
  createdAt: Date;
}

const ActivityLogSchema: Schema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  type: { 
    type: String, 
    enum: ['member_added', 'payment_received', 'class_created'], 
    required: true 
  },
  description: { type: String, required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
