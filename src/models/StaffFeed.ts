import mongoose, { Schema, Document } from 'mongoose';

export interface IStaffFeed extends Document {
  gymId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const StaffFeedSchema: Schema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, {
  timestamps: true
});

// Avoid model recompilation during HMR
if (mongoose.models.StaffFeed) {
  delete mongoose.models.StaffFeed;
}

export default mongoose.model<IStaffFeed>('StaffFeed', StaffFeedSchema);
