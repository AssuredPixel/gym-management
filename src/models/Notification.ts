import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  gymId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // recipient
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'warning', 'alert', 'success'], 
    default: 'info' 
  },
  isRead: { type: Boolean, default: false },
  link: { type: String },
}, {
  timestamps: true
});

// Cache clearing trick to avoid stale models during HMR in dev
if (mongoose.models.Notification) {
  delete mongoose.models.Notification;
}

export default mongoose.model<INotification>('Notification', NotificationSchema);
