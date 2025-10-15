import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('connectDB success')
    } catch (error) {
        console.error('MongoDB connect error: ', error.message);
        process.exit(1);
    }
}