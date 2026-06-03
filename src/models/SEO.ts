import mongoose, { Schema, Document } from 'mongoose';

export interface ISEO extends Document {
  pageName: string;
  pageUrl: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robots?: string;
  structuredData?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SEOSchema: Schema = new Schema(
  {
    pageName: { type: String, required: true },
    pageUrl: { type: String, required: true, unique: true, index: true },
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    metaKeywords: [{ type: String }],
    ogTitle: { type: String },
    ogDescription: { type: String },
    ogImage: { type: String },
    twitterTitle: { type: String },
    twitterDescription: { type: String },
    twitterImage: { type: String },
    canonicalUrl: { type: String },
    robots: { type: String, default: 'index, follow' },
    structuredData: { type: String },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.SEO) {
  delete mongoose.models.SEO;
}

export default mongoose.model<ISEO>('SEO', SEOSchema);
