import express from 'express';
import authRoutes from '../src/routes/auth_routes.js';
import appointmentRoutes from '../src/routes/appointment_routes.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

export default app;