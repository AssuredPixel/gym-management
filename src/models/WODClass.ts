import mongoose, { Schema, Document } from 'mongoose';

export interface IWODClass extends Document {
  gymId: mongoose.Types.ObjectId;
  title: string;
  coach: string;
  dateTime: Date;
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  classType: 'wod' | 'strength' | 'competition' | 'open';
  description?: string;
  status: 'scheduled' | 'cancelled';
  createdAt: Date;
}

const WODClassSchema: Schema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  title: { type: String, required: true },
  coach: { type: String, required: true },
  dateTime: { type: Date, required: true },
  durationMinutes: { type: Number, default: 60 },
  capacity: { type: Number, default: 20 },
  bookedCount: { type: Number, default: 0 },
  classType: { 
    type: String, 
    enum: ['wod', 'strength', 'competition', 'open'], 
    default: 'wod' 
  },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['scheduled', 'cancelled'], 
    default: 'scheduled' 
  },
}, {
  timestamps: true
});

// Cache clearing trick to avoid stale models during HMR in dev
if (mongoose.models.WODClass) {
  delete mongoose.models.WODClass;
}

export default mongoose.model<IWODClass>('WODClass', WODClassSchema);
