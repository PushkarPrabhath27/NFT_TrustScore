/**
 * MongoDB Database Connection
 * Handles connection to MongoDB database for storing NFT analysis results
 */

import mongoose from 'mongoose';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nft_analysis';

// Enable debug mode for mongoose
mongoose.set('debug', process.env.NODE_ENV === 'development');

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');});

mongoose.connection.on('error', (error) => {
  console.error('Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed due to app termination');
  process.exit(0);
});

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
export const connectToDatabase = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', MONGODB_URI.replace(/:[^:]*@/, ':***@'));
    
    const connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased timeout to 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });
    
    console.log('MongoDB connected successfully');
    console.log(`MongoDB connected to: ${connection.connection.host}:${connection.connection.port}/${connection.connection.name}`);
    return connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.error('Please make sure MongoDB is running and accessible');
      console.error('If using a local MongoDB instance, you can start it with: mongod');
      console.error('If using MongoDB Atlas, please check your connection string and network access');
    }
    throw error;
  }
};

/**
 * Disconnect from MongoDB database
 * @returns {Promise<void>}
 */
export const disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB database');
  } catch (error) {
    console.error('Error disconnecting from MongoDB database:', error);
    throw error;
  }
};

/**
 * Check if connected to MongoDB database
 * @returns {boolean} Whether connected to database
 */
export const isConnectedToDatabase = () => {
  return mongoose.connection.readyState === 1;
};