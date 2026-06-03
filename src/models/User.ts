import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  role: 'User' | 'Broker' | 'Builder' | 'Employee' | 'Admin';
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    role: { 
      type: String, 
      required: true,
      enum: ['User', 'Broker', 'Builder', 'Employee', 'Admin'],
      default: 'User'
    },
    status: { 
      type: String, 
      required: true,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
