import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

const VALID_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                     '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
                     '16:00', '16:30'];


// This function is called before fetching appointments for a user to ensure that any past 
// appointments whith no response are marked rejected
const markExpiredAppointments = async (filter) => {
    const now = new Date();
    const appointments = await Appointment.find({
        ...filter,
        status: { $in: ['accepted', 'pending'] },
    });

    for (const appt of appointments) {
        const apptDate = new Date(appt.date);
        const [hours, minutes] = appt.time.split(':').map(Number);
        apptDate.setHours(hours, minutes, 0, 0);

        if (apptDate < now) {
            appt.status = 'rejected';
            appt.rejectionReason = '[System] Doctor did not respond in time';
            await appt.save();
        }
    }
};

export const createAppointment = async (req, res) => {
    try {
        const { doctor, date, time } = req.body;

        if (!doctor || !date || !time) {
            return res.status(400).json({ message: 'Doctor, date and time are required' });
        }

        // doctor existance check
        const doctorUser = await User.findById(doctor);
        if (!doctorUser || doctorUser.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // valid slot check
        if (!VALID_SLOTS.includes(time)) {
            return res.status(400).json({ message: 'Invalid time slot' });
        }

        
        const appointmentDate = new Date(date);

        // valid date check
        if (isNaN(appointmentDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date' });
        }

        // weekend check
        const day = appointmentDate.getDay();
        if (day === 0 || day === 6) {
            return res.status(400).json({ message: 'Clinic is closed on weekends' });
        }

        // past date check
        if (appointmentDate < new Date()) {
            return res.status(400).json({ message: 'Cannot book an appointment in the past' });
        }

        // max advance booking check (3 months)
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        if (appointmentDate > maxDate) {
            return res.status(400).json({ message: 'Cannot book more than 3 months in advance' });
        }

        // slot availability check
        const existing = await Appointment.findOne({
            doctor,
            date,
            time,
            status: { $in: ['pending', 'accepted'] },
        });
        if (existing) {
            return res.status(409).json({ message: 'This time slot is already taken' });
        }

        // same day request check
        const sameDayRequest = await Appointment.findOne({
            patient: req.user._id,
            doctor,
            date: appointmentDate,
            status: { $in: ['pending', 'accepted'] },
        });
        if (sameDayRequest) {
            return res.status(409).json({ message: 'You already have a request with this doctor on this day' });
        }

        const appointment = await Appointment.create({
            patient: req.user._id,
            doctor,
            date,
            time,
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.patient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!['pending', 'accepted'].includes(appointment.status)) {
            return res.status(400).json({ message: `Cannot cancel a ${appointment.status} appointment` });
        }

        appointment.status = 'cancelled';
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getMyAppointments = async (req, res) => {
    try {
        // Mark expired appointments before fetching
        await markExpiredAppointments({ patient: req.user._id });

        const appointments = await Appointment.find({ patient: req.user._id })
            .populate('doctor', 'name specialization')
            .sort({ date: -1, time: -1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' })
            .sort({ specialization: 1, name: 1 })
            .collation({ locale: 'en', strength: 1 }) // case-insensitive sorting
            .select('name specialization');

        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getOccupiedSlots = async (req, res) => {
    try {
        const { doctor, date } = req.query;

        if (!doctor || !date) {
            return res.status(400).json({ message: 'Doctor and date are required' });
        }

        const appointments = await Appointment.find({
            doctor,
            date: new Date(date),
            status: { $in: ['pending', 'accepted'] },
        })  .select('time');

        const occupiedSlots = appointments.map(a => a.time);
        res.json(occupiedSlots);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};