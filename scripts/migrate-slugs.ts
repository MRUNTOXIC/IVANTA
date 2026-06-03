import mongoose from 'mongoose';
import Property from '../src/models/Property';
import { generateSlug, generateUniqueSlug } from '../src/lib/slugify';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ivanta-property';

async function migratePropertySlugs() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all properties (including those without slug field)
    const properties = await Property.find({}).lean();
    
    console.log(`Found ${properties.length} total properties`);

    if (properties.length === 0) {
      console.log('⚠️ No properties found in database!');
      await mongoose.disconnect();
      return;
    }

    // Filter properties that need slugs
    const propertiesNeedingSlugs = properties.filter((p: any) => !p.slug || p.slug === '');
    
    console.log(`${propertiesNeedingSlugs.length} properties need slugs`);

    if (propertiesNeedingSlugs.length === 0) {
      console.log('✅ All properties already have slugs!');
      await mongoose.disconnect();
      return;
    }

    const existingSlugs: string[] = properties
      .filter((p: any) => p.slug && p.slug !== '')
      .map((p: any) => p.slug);

    for (const property of propertiesNeedingSlugs) {
      const baseSlug = generateSlug(property.title);
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
      
      existingSlugs.push(uniqueSlug);
      
      await Property.findByIdAndUpdate(property._id, { slug: uniqueSlug });
      
      console.log(`✅ Generated slug for "${property.title}": ${uniqueSlug}`);
    }

    console.log(`\n✅ Successfully generated slugs for ${propertiesNeedingSlugs.length} properties`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migratePropertySlugs();
