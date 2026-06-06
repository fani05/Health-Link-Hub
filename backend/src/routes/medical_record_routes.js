import express from 'express';
import {
    getPatients,
    getPatientData,
    getStats,
    createRecord,
    updateRecord,
    deleteRecord,
    markNoShow,
    getMyInterventions,
} from '../controllers/medical_record_controllers.js';
import { protect } from '../middleware/auth_middleware.js';
import { doctorOnly, patientOnly } from '../middleware/role_middleware.js';

const router = express.Router();

router.get('/mine', protect, patientOnly, getMyInterventions);

router.get('/stats', protect, doctorOnly, getStats);
router.get('/patients', protect, doctorOnly, getPatients);
router.get('/patients/:patientId', protect, doctorOnly, getPatientData);
router.post('/', protect, doctorOnly, createRecord);
router.put('/:id', protect, doctorOnly, updateRecord);
router.delete('/:id', protect, doctorOnly, deleteRecord);
router.patch('/appointment/:appointmentId/no-show', protect, doctorOnly, markNoShow);

export default router;
