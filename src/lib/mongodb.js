import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// کش کردن اتصال بین hot-reloadها و بین درخواست‌های serverless
let cached = global.__amorzMongoose;
if (!cached) {
  cached = global.__amorzMongoose = { conn: null, promise: null };
}

export function hasDatabase() {
  return Boolean(MONGODB_URI);
}

export async function dbConnect() {
  if (!MONGODB_URI) return null;
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: process.env.MONGODB_DB || 'amorz',
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error('[mongodb] اتصال برقرار نشد — سایت با داده داخلی سرو می‌شود:', err.message);
    return null;
  }

  return cached.conn;
}
