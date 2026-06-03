import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  slug: string;
  price: string;
  priceFrom?: string;
  priceTo?: string;
  propertyType: 'buy' | 'rent' | 'commercial' | 'plot' | 'pg';
  subType: string;
  rentalCategory?: string;
  isResiCom?: boolean;
  isOfficeCom?: boolean;
  street1: string;
  street2?: string;
  street3?: string;
  street4?: string;
  area: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  latitude: string;
  longitude: string;
  beds?: string[];
  baths?: string;
  sqft: string;
  description: string;
  badge?: string;
  category?: string;
  isNewProject?: boolean;
  amenities: string[];
  foodAvailable?: boolean;
  acAvailable?: boolean;
  images: string[];
  contactPhone?: string;
  whatsappNumber?: string;
  rera?: string;
  facing?: string;
  instagramLink?: string;
  facebookLink?: string;
  youtubeLink?: string;
  landmarks?: { name: string; distance: string }[];
  brochureUrl?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  possessionDate?: string;
  totalFloors?: number;
  flatsPerFloor?: number;
  totalWings?: number;
  parkingFourWheeler?: number;
  parkingTwoWheeler?: number;
  totalSoldFlats?: number;
  isSold?: boolean;
  soldDate?: Date;
  isVerified?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  submittedBy?: string;
  userEmail?: string;
  subdomain?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema(
  {
    title: { type: String },
    slug: { type: String, unique: true, index: true },
    price: { type: String },
    priceFrom: { type: String },
    priceTo: { type: String },
    propertyType: { 
      type: String,
      enum: ['buy', 'rent', 'commercial', 'plot', 'pg'],
      index: true // Add index for faster queries
    },
    subType: { type: String, index: true },
    rentalCategory: { type: String },
    isResiCom: { type: Boolean, default: false },
    isOfficeCom: { type: Boolean, default: false },
    street1: { type: String },
    street2: { type: String },
    street3: { type: String },
    street4: { type: String },
    area: { type: String, index: true },
    state: { type: String },
    district: { type: String },
    city: { type: String, index: true },
    pincode: { type: String },
    latitude: { type: String },
    longitude: { type: String },
    beds: [{ type: String }],
    baths: { type: String },
    sqft: { type: String },
    description: { type: String },
    badge: { type: String },
    category: { type: String, default: 'None' },
    isNewProject: { type: Boolean, default: false, index: true },
    amenities: [{ type: String }],
    foodAvailable: { type: Boolean, default: false },
    acAvailable: { type: Boolean, default: false },
    images: [{ type: String }],
    contactPhone: { type: String },
    whatsappNumber: { type: String },
    rera: { type: String },
    facing: { type: String },
    instagramLink: { type: String },
    facebookLink: { type: String },
    youtubeLink: { type: String },
    landmarks: [{ name: { type: String }, distance: { type: String } }],
    brochureUrl: { type: String },
    projectStartDate: { type: String },
    projectEndDate: { type: String },
    possessionDate: { type: String },
    totalFloors: { type: Number },
    flatsPerFloor: { type: Number },
    totalWings: { type: Number },
    parkingFourWheeler: { type: Number },
    parkingTwoWheeler: { type: Number },
    totalSoldFlats: { type: Number },
    isSold: { type: Boolean, default: false },
    soldDate: { type: Date },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved', index: true },
    submittedBy: { type: String },
    userEmail: { type: String },
    subdomain: { type: String, unique: true, sparse: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
PropertySchema.index({ propertyType: 1, status: 1 });
PropertySchema.index({ status: 1, createdAt: -1 });
PropertySchema.index({ isNewProject: 1, propertyType: 1, status: 1 });
PropertySchema.index({ category: 1, status: 1 }); // For homepage sections
PropertySchema.index({ status: 1, propertyType: 1, createdAt: -1 }); // Optimized for main query

// Delete the existing model to ensure schema updates are applied
if (mongoose.models.Property) {
  delete mongoose.models.Property;
}

export default mongoose.model<IProperty>('Property', PropertySchema);
