import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  hashedPassword?: string;
  role: 'owner' | 'member' | 'instructor';
  gymId: mongoose.Types.ObjectId;
  phone?: string;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String },
  role: { type: String, enum: ['owner', 'member', 'instructor'], required: true },
  gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
