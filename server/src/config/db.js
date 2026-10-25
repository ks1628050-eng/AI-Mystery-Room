import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to remote/local MongoDB (${error.message}).`);
    console.warn(`[Database Info] Operating with Mongoose offline buffering or fallback storage.`);
  }
}

export function getDBStatus() {
  return {
    isConnected: mongoose.connection.readyState === 1,
    state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
  };
}
