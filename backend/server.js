import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import auth_routes from './src/routes/auth_routes.js';

dotenv.config();

const app = express(); 

app.use(cors()); // communination between frontend and backend
app.use(express.json()); // json parsing
app.use('/api/auth', auth_routes);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Connection Error: ${error.message}`);
        process.exit(1);
    }
};


connectDB();

const PORT = process.env.PORT || 5000;

// start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});