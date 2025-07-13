const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

async function checkAndConnectDB() {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose
        .connect(MONGO_URI)
        .then(() => console.log('MongoDB connected'))
        .catch((err) => console.log('Error connecting to MongoDB:', err));
      console.log('MongoDB connected');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      throw new Error('Database connection failed');
    }
  }
}

module.exports = { checkAndConnectDB };
