import mongoose from 'mongoose';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ivanta-property';
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');

const PropertySchema = new mongoose.Schema({ images: [String] }, { strict: false, timestamps: true });
const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);

async function saveBase64ToFile(base64: string, index: number, propertyId: string): Promise<string> {
  // Extract mime type and data
  const match = base64.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) throw new Error('Invalid base64 string');

  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const data = Buffer.from(match[2], 'base64');
  const filename = `${propertyId}-${index}-${Date.now()}.${ext}`;
  await writeFile(join(UPLOADS_DIR, filename), data);
  return `/uploads/${filename}`;
}

async function migrate() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const properties = await Property.find({});
  console.log(`📦 Found ${properties.length} properties`);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const property of properties) {
    const images: string[] = property.images || [];
    const hasBase64 = images.some((img: string) => img.startsWith('data:'));

    if (!hasBase64) {
      skippedCount++;
      continue;
    }

    const newImages: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.startsWith('data:')) {
        try {
          const url = await saveBase64ToFile(img, i, property._id.toString());
          newImages.push(url);
          process.stdout.write('.');
        } catch (err) {
          console.error(`\n❌ Failed image ${i} for property ${property._id}:`, err);
          newImages.push(img); // keep original on failure
          errorCount++;
        }
      } else {
        newImages.push(img); // already a URL, keep as-is
      }
    }

    await Property.updateOne({ _id: property._id }, { $set: { images: newImages } });
    migratedCount++;
  }

  console.log(`\n\n✅ Migration complete`);
  console.log(`   Migrated : ${migratedCount} properties`);
  console.log(`   Skipped  : ${skippedCount} properties (already using URLs)`);
  console.log(`   Errors   : ${errorCount} images failed`);

  await mongoose.connection.close();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
