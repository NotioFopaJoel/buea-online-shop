const mongoose = require('mongoose');
const env = require('./environment');

/**
 * Connects to MongoDB using Mongoose.
 * Exits the process on failure so the app never runs against a dead DB.
 */
async function connectDatabase() {
  try {
    mongoose.set('strictQuery', true);
    // Force the database name explicitly instead of relying on it being
    // present in MONGO_URI. If the connection string's path is missing or
    // wrong (e.g. "mongodb+srv://user:pass@cluster.mongodb.net/" with no
    // "/buea_online_shop" segment), MongoDB silently falls back to a "test"
    // database - which is exactly what happened here: the app was reading
    // and writing an empty "test" DB instead of the seeded one. dbName here
    // always wins over whatever (or nothing) is in the URI's path.
    const conn = await mongoose.connect(env.MONGO_URI, { dbName: 'buea_online_shop' });
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
