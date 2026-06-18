import mongoose from "mongoose";
import "dotenv/config";

const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI).then(() => {
      console.log("Connected to MongoDB");
    });
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectToMongo;
