// Run this script to create optimized indexes in MongoDB
// Execute: node scripts/createIndexes.js

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ivanta-property';

async function createIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('properties');

    console.log('Creating indexes...');

    // Create compound indexes for common queries
    await collection.createIndex({ status: 1, createdAt: -1 });
    await collection.createIndex({ propertyType: 1, status: 1 });
    await collection.createIndex({ isNewProject: 1, propertyType: 1, status: 1 });
    await collection.createIndex({ status: 1, propertyType: 1, createdAt: -1 });
    await collection.createIndex({ category: 1, status: 1 });
    
    // Single field indexes
    await collection.createIndex({ area: 1 });
    await collection.createIndex({ city: 1 });
    await collection.createIndex({ subType: 1 });

    console.log('✅ All indexes created successfully');
    
    // List all indexes
    const indexes = await collection.indexes();
    console.log('\nCurrent indexes:');
    indexes.forEach(index => {
      console.log(`- ${JSON.stringify(index.key)}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();
