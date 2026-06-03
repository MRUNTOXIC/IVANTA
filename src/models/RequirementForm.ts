import mongoose, { Schema, Document } from 'mongoose';

export interface IRequirementForm extends Document {
  lookingFor: string;
  propertyType: string;
  propertySubType: string;
  areas: string[];
  budgetFrom: string;
  budgetTo: string;
  bhk: string;
  sqft: string;
  contactNumber: string;
  timeframe: string;
  email: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const RequirementFormSchema: Schema = new Schema(
  {
    lookingFor: { type: String, required: true },
    propertyType: { type: String },
    propertySubType: { type: String },
    areas: [{ type: String }],
    budgetFrom: { type: String },
    budgetTo: { type: String },
    bhk: { type: String },
    sqft: { type: String },
    contactNumber: { type: String, required: true },
    timeframe: { type: String },
    email: { type: String, required: true },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.RequirementForm || mongoose.model<IRequirementForm>('RequirementForm', RequirementFormSchema);
