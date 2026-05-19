import express from 'express';
import { 
    createAppointment, 
    getMyAppointments,
    getDoctors,
    cancelAppointment,
    getOccupiedSlots
    
} from '../controllers/appointment_controllers.js';
import { protect } from '../middleware/auth_middleware.js';
import { doctorOnly, patientOnly } from '../middleware/role_middleware.js';

const router = express.Router();

router.post('/', protect, patientOnly, createAppointment);
router.get('/mine', protect, patientOnly, getMyAppointments);
router.get('/doctors', protect, getDoctors);
router.get('/slots', protect, patientOnly, getOccupiedSlots);
router.patch('/:id/cancel', protect, patientOnly, cancelAppointment);


export default router;