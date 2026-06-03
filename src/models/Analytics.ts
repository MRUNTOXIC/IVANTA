import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  sessionId: string;
  visitorId: string;
  page: string;
  entryTime: Date;
  exitTime?: Date;
  duration?: number; // in seconds
  userAgent: string;
  referrer?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  device: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  createdAt: Date;
}

const AnalyticsSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    visitorId: { type: String, required: true, index: true },
    page: { type: String, required: true },
    entryTime: { type: Date, required: true, default: Date.now },
    exitTime: { type: Date },
    duration: { type: Number }, // in seconds
    userAgent: { type: String },
    referrer: { type: String },
    ipAddress: { type: String },
    country: { type: String },
    city: { type: String },
    device: { type: String, enum: ['mobile', 'tablet', 'desktop'], default: 'desktop' },
    browser: { type: String },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
AnalyticsSchema.index({ createdAt: -1 });
AnalyticsSchema.index({ sessionId: 1, page: 1 });

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
