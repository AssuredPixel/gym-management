import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  wodClassId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  status: 'booked' | 'cancelled' | 'attended' | 'no-show';
  createdAt: Date;
}

const BookingSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  wodClassId: { type: Schema.Types.ObjectId, ref: 'WODClass', required: true },
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  status: { 
    type: String, 
    enum: ['booked', 'cancelled', 'attended', 'no-show'], 
    default: 'booked' 
  },
}, {
  timestamps: true
});

// Cache clearing trick to avoid stale models during HMR in dev
if (mongoose.models.Booking) {
  delete mongoose.models.Booking;
}

export default mongoose.model<IBooking>('Booking', BookingSchema);
