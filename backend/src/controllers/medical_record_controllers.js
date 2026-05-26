import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';

export const getPatients = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            doctor: req.user._id,
            status: { $in: ['accepted', 'completed', 'no-show'] },
        }).populate('patient', 'name phone').lean();

        const patientsMap = new Map();
        for (const appt of appointments) {
            if (appt.patient && !patientsMap.has(appt.patient._id.toString())) {
                patientsMap.set(appt.patient._id.toString(), appt.patient);
            }
        }

        res.json(Array.from(patientsMap.values()));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPatientData = async (req, res) => {
    try {
        const { patientId } = req.params;
        const now = new Date();

        const allAccepted = await Appointment.find({
            doctor: req.user._id,
            patient: patientId,
            status: 'accepted',
        }).lean();

        const pendingAppts = allAccepted
            .filter(appt => {
                const apptDate = new Date(appt.date);
                const [h, m] = appt.time.split(':').map(Number);
                apptDate.setHours(h, m, 0, 0);
                return apptDate < now;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const records = await MedicalRecord.find({
            doctor: req.user._id,
            patient: patientId,
        }).populate('appointment', 'date time').sort({ createdAt: -1 });

        res.json({ pendingAppts, records });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createRecord = async (req, res) => {
    try {
        const { appointmentId, procedure, cost, observations } = req.body;

        if (!appointmentId || !procedure || cost === undefined) {
            return res.status(400).json({ message: 'appointmentId, procedure and cost are required' });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.doctor.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });
        if (appointment.status !== 'accepted')
            return res.status(400).json({ message: 'Can only create records for accepted appointments' });

        const existing = await MedicalRecord.findOne({ appointment: appointmentId });
        if (existing) return res.status(409).json({ message: 'A record already exists for this appointment' });

        const record = await MedicalRecord.create({
            appointment: appointmentId,
            doctor: req.user._id,
            patient: appointment.patient,
            procedure: procedure.trim(),
            cost: Number(cost),
            observations: observations?.trim() || '',
        });

        appointment.status = 'completed';
        await appointment.save();

        const populated = await record.populate('appointment', 'date time');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateRecord = async (req, res) => {
    try {
        const { procedure, cost, observations } = req.body;
        const record = await MedicalRecord.findById(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        if (record.doctor.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        if (procedure !== undefined) record.procedure = procedure.trim();
        if (cost !== undefined) record.cost = Number(cost);
        if (observations !== undefined) record.observations = observations.trim();
        await record.save();

        const populated = await record.populate('appointment', 'date time');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        if (record.doctor.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        await Appointment.findByIdAndUpdate(record.appointment, { status: 'accepted' });
        await record.deleteOne();
        res.json({ message: 'Record deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const markNoShow = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.doctor.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });
        if (appointment.status !== 'accepted')
            return res.status(400).json({ message: `Cannot mark a ${appointment.status} appointment as no-show` });

        appointment.status = 'no-show';
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
