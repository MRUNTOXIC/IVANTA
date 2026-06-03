import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ivanta-property";

const properties: any[] = [];

const PropertySchema = new mongoose.Schema({
  title: String,
  price: String,
  location: String,
  image: String,
  beds: Number,
  baths: Number,
  sqft: String,
  badge: String,
  type: String,
  status: { type: String, default: "active" },
  featured: Boolean,
}, { timestamps: true });

const Property = mongoose.models.Property || mongoose.model("Property", PropertySchema);

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await Property.deleteMany({});
    console.log("🗑️  Cleared existing properties");

    const seededProperties = await Property.insertMany(
      properties.map(p => ({
        ...p,
        featured: !!p.badge,
        status: "active"
      }))
    );

    console.log(`✅ Seeded ${seededProperties.length} properties`);
    
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
