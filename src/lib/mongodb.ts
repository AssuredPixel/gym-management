import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, 
      connectTimeoutMS: 5000,
    };

    console.log('--- DB CONNECTION DIAGNOSTICS ---');
    console.log(`URI Found: ${MONGODB_URI.substring(0, 20)}...`);
    console.log('Connecting to MongoDB Atlas Cluster...');
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('SUCCESS: MongoDB connected correctly');
      return mongoose;
    }).catch((err) => {
      console.error('ERROR: Database connection failed');
      if (err.message.includes('querySrv ETIMEOUT')) {
        console.error('DIAGNOSTIC: This is a DNS or IP Whitelist issue. Check your MongoDB Atlas Network Access.');
      } else if (err.message.includes('Authentication failed')) {
        console.error('DIAGNOSTIC: Review your MongoDB username or password in .env.local.');
      }
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
