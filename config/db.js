import mongoose from "mongoose";

const connectDB = async (req, res) => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.log(`Error  : ${error.message}`);
        process.exit(1);
    }
}
export default connectDB;