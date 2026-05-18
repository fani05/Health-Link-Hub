import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import auth_routes from './src/routes/auth_routes.js';
import appointment_routes from './src/routes/appointment_routes.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';


dotenv.config();

const app = express(); 


const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: 'Too many attempts, please try again later',
});

// Security middleware
app.use(helmet());

app.use(cors()); // communication between frontend and backend
app.use(express.json({limit: '10kb'})); // json parsing

app.use('/api/auth', authLimiter);
app.use('/api/auth', auth_routes);
app.use('/api/appointments', appointment_routes);

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