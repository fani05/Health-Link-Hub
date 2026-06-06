import './setup.js';
import User from '../src/models/User.js';
import Appointment from '../src/models/Appointment.js';

describe('Appointment Model', () => {
    let patient, doctor;

    beforeEach(async () => {
        patient = await User.create({
            name: 'patient',
            email: 'patient@test.com',
            password: '123456',
            role: 'patient',
            phone: '+40712345678',
            address: 'adresa',
        });

        doctor = await User.create({
            name: 'doctor',
            email: 'doctor@test.com',
            password: '123456',
            role: 'doctor',
            phone: '+40799999999',
            address: 'adresa',
            specialization: 'cardiologie',
        });
    });

    test('creates a valid appointment with default status pending', async () => {
        const appt = await Appointment.create({
            patient: patient._id,
            doctor: doctor._id,
            date: new Date('2026-12-15'),
            time: '10:00',
        });

        expect(appt._id).toBeDefined();
        expect(appt.status).toBe('pending');
        expect(appt.rejectionReason).toBe('');
    });

    test('fails without required fields', async () => {
        await expect(Appointment.create({})).rejects.toThrow();
    });

    test('fails with invalid time slot', async () => {
        await expect(Appointment.create({
            patient: patient._id,
            doctor: doctor._id,
            date: new Date('2026-12-15'),
            time: '10:01',
        })).rejects.toThrow();
    });

    test('fails with invalid status', async () => {
        await expect(Appointment.create({
            patient: patient._id,
            doctor: doctor._id,
            date: new Date('2026-12-15'),
            time: '10:00',
            status: 'approved',
        })).rejects.toThrow();
    });

    test('accepts all valid statuses', async () => {
        const appt = await Appointment.create({
            patient: patient._id,
            doctor: doctor._id,
            date: new Date('2026-12-15'),
            time: '10:00',
        });

        const validStatuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled', 'no-show'];
        for (const status of validStatuses) {
            appt.status = status;
            await appt.save();
            expect(appt.status).toBe(status);
        }
    });

    test('enforces maxlength on rejectionReason', async () => {
        await expect(Appointment.create({
            patient: patient._id,
            doctor: doctor._id,
            date: new Date('2026-12-15'),
            time: '10:00',
            rejectionReason: 'a'.repeat(201),
        })).rejects.toThrow();
    });
});