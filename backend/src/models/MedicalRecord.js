import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
        unique: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    procedure: {
        type: String,
        required: [true, 'Procedure name is required'],
        maxlength: [200, 'Procedure cannot exceed 200 characters'],
        trim: true,
    },
    cost: {
        type: Number,
        required: [true, 'Cost is required'],
        min: [0, 'Cost cannot be negative'],
    },
    observations: {
        type: String,
        maxlength: [1000, 'Observations cannot exceed 1000 characters'],
        trim: true,
        default: '',
    },
}, { timestamps: true });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
