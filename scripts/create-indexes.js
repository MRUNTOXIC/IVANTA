// Run this script once after deployment to create indexes
// Usage: node scripts/create-indexes.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ivanta-property';

async function createIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const propertiesCollection = db.collection('properties');
    const analyticsCollection = db.collection('analytics');

    console.log('\n📊 Creating indexes for properties collection...');
    
    // Single field indexes
    await propertiesCollection.createIndex({ propertyType: 1 });
    console.log('✓ Index created: propertyType');
    
    await propertiesCollection.createIndex({ subType: 1 });
    console.log('✓ Index created: subType');
    
    await propertiesCollection.createIndex({ area: 1 });
    console.log('✓ Index created: area');
    
    await propertiesCollection.createIndex({ city: 1 });
    console.log('✓ Index created: city');
    
    await propertiesCollection.createIndex({ isNewProject: 1 });
    console.log('✓ Index created: isNewProject');
    
    await propertiesCollection.createIndex({ status: 1 });
    console.log('✓ Index created: status');

    // Compound indexes
    await propertiesCollection.createIndex({ propertyType: 1, status: 1 });
    console.log('✓ Compound index created: propertyType + status');
    
    await propertiesCollection.createIndex({ status: 1, createdAt: -1 });
    console.log('✓ Compound index created: status + createdAt');
    
    await propertiesCollection.createIndex({ isNewProject: 1, propertyType: 1, status: 1 });
    console.log('✓ Compound index created: isNewProject + propertyType + status');

    console.log('\n📊 Creating indexes for analytics collection...');
    
    await analyticsCollection.createIndex({ sessionId: 1 });
    console.log('✓ Index created: sessionId');
    
    await analyticsCollection.createIndex({ visitorId: 1 });
    console.log('✓ Index created: visitorId');
    
    await analyticsCollection.createIndex({ createdAt: -1 });
    console.log('✓ Index created: createdAt');
    
    await analyticsCollection.createIndex({ sessionId: 1, page: 1 });
    console.log('✓ Compound index created: sessionId + page');

    console.log('\n✅ All indexes created successfully!');
    
    // List all indexes
    console.log('\n📋 Current indexes on properties:');
    const propertyIndexes = await propertiesCollection.indexes();
    propertyIndexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}`);
    });

    console.log('\n📋 Current indexes on analytics:');
    const analyticsIndexes = await analyticsCollection.indexes();
    analyticsIndexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}`);
    });

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

createIndexes();
