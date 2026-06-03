import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  areas: string[];
  landmarks: string[];
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    areas: [{ type: String }],
    landmarks: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Delete the existing model to ensure schema updates are applied
if (mongoose.models.Settings) {
  delete mongoose.models.Settings;
}

export default mongoose.model<ISettings>('Settings', SettingsSchema);
