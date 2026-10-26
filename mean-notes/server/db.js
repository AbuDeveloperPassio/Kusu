const mongoose = require("mongoose");

// Reuse the connection across serverless invocations.
const cache = global._meanNotesMongoose || (global._meanNotesMongoose = { conn: null, promise: null });

async function connect() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || "meannotes",
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    });
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}

module.exports = connect;
