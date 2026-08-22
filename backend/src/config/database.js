const mongoose = require('mongoose');
const env = require('./environment');

/**
 * Connects to MongoDB using Mongoose.
 * Exits the process on failure so the app never runs against a dead DB.
 */
async function connectDatabase() {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`[database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('[database] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[database] MongoDB disconnected');
    });
  } catch (error) {
    console.error('[database] Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = connectDatabase;
