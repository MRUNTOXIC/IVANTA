import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: string;
  propertyId: string;
  createdAt: Date;
}

const FavoriteSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    propertyId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure a user can only favorite a property once
FavoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

export default mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);
