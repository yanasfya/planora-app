// Simple MongoDB Connection Test Script
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Manually load .env.local file
const envPath = path.join(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    envVars[key.trim()] = values.join('=').trim();
  }
});

const uri = envVars.MONGODB_URI;

console.log('Testing MongoDB Connection...');
console.log('Connection string:', uri ? uri.replace(/:[^:@]+@/, ':****@') : 'NOT FOUND');

async function testConnection() {
  let client;

  try {
    console.log('\nAttempting to connect...');

    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000
    });

    await client.connect();

    console.log('Successfully connected to MongoDB Atlas!');

    // Test database access
    const db = client.db('planora');
    const collections = await db.listCollections().toArray();

    console.log(`Found ${collections.length} collections in 'planora' database`);
    if (collections.length > 0) {
      console.log('Collections:', collections.map(c => c.name).join(', '));
    }

    console.log('\nConnection test PASSED!');

  } catch (error) {
    console.error('\nConnection test FAILED!');
    console.error('Error:', error.message);

    if (error.message.includes('Server selection timed out')) {
      console.error('\nPossible causes:');
      console.error('   1. IP address not whitelisted (but yours shows as Active)');
      console.error('   2. Cluster is paused - check MongoDB Atlas dashboard');
      console.error('   3. Network/firewall blocking MongoDB connections');
      console.error('   4. Connection string is incorrect');
    } else if (error.message.includes('authentication failed')) {
      console.error('\nUsername or password is incorrect');
      console.error('   Check Database Access in MongoDB Atlas');
    }

  } finally {
    if (client) {
      await client.close();
      console.log('\nConnection closed');
    }
  }
}

testConnection();
