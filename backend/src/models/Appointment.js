import mongoose from 'mongoose';


const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
        enum: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
           '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
           '16:00', '16:30', '17:00'],
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending',
    },
    rejectionReason: {
        type: String,
        default: '',
    },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;