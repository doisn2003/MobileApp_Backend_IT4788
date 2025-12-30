const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const mongoURI = process.env.MONGO_URI;
const connectDB = async () => {
  console.log('Attempting to connect to MongoDB with URI:', mongoURI);
  try {
    await mongoose.connect(mongoURI, {
      //useNewUrlParser: true,
      //useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;