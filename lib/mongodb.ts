import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

type Cached = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

const globalWithMongoose = global as typeof global & {
  _mongoose?: Cached;
};

let cached = globalWithMongoose._mongoose;

if (!cached) {
  cached = globalWithMongoose._mongoose = { conn: null, promise: null };
}

export async function dbConnect(): Promise<Mongoose> {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 450000,
    };

    cached!.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}
