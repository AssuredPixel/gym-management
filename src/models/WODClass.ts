import mongoose, { Schema, Document } from 'mongoose';

export interface IWODClass extends Document {
  gymId: mongoose.Types.ObjectId;
  name: string;
  instructor: string;
  dateTime: Date;
  capacity: number;
  attendees: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const WODClassSchema: Schema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  name: { type: String, required: true },
  instructor: { type: String, required: true },
  dateTime: { type: Date, required: true },
  capacity: { type: Number, required: true, default: 20 },
  attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true
});

export default mongoose.models.WODClass || mongoose.model<IWODClass>('WODClass', WODClassSchema);
