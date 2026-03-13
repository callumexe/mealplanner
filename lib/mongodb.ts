import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

declare global {
  var mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null };
}

let cached = global.mongoose || { conn: null, promise: null };

export async function connectDB(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  cached.promise = cached.promise || mongoose.connect(MONGODB_URI).then((m) => m);
  cached.conn = await cached.promise;
  return cached.conn;
}