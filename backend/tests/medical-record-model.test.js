import './setup.js';
import mongoose from 'mongoose';
import MedicalRecord from '../src/models/MedicalRecord.js';
import User from '../src/models/User.js';
import Appointment from '../src/models/Appointment.js';

describe('MedicalRecord Model', () => {
    let patient, doctor, appointment;

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

        appointment = await Appointment.create({
            patient: patient._id,
            doctor: doctor._id,
            date: new Date('2026-12-15'),
            time: '10:00',
        });
    });

    test('creates a valid medical record with all required fields', async () => {
        const record = await MedicalRecord.create({
            appointment: appointment._id,
            doctor: doctor._id,
            patient: patient._id,
            procedure: 'Consultation',
            cost: 150,
        });

        expect(record._id).toBeDefined();
        expect(record.procedure).toBe('Consultation');
        expect(record.cost).toBe(150);
        expect(record.observations).toBe('');
    });

    test('fails without required fields', async () => {
        await expect(MedicalRecord.create({})).rejects.toThrow();
    });

    test('fails when cost is negative', async () => {
        await expect(MedicalRecord.create({
            appointment: appointment._id,
            doctor: doctor._id,
            patient: patient._id,
            procedure: 'Consultation',
            cost: -10,
        })).rejects.toThrow();
    });

    test('fails when procedure exceeds 200 characters', async () => {
        await expect(MedicalRecord.create({
            appointment: appointment._id,
            doctor: doctor._id,
            patient: patient._id,
            procedure: 'a'.repeat(201),
            cost: 100,
        })).rejects.toThrow();
    });

    test('fails when observations exceeds 1000 characters', async () => {
        await expect(MedicalRecord.create({
            appointment: appointment._id,
            doctor: doctor._id,
            patient: patient._id,
            procedure: 'Consultation',
            cost: 100,
            observations: 'a'.repeat(1001),
        })).rejects.toThrow();
    });

    test('fails when creating a duplicate record for the same appointment', async () => {
        await MedicalRecord.create({
            appointment: appointment._id,
            doctor: doctor._id,
            patient: patient._id,
            procedure: 'Consultation',
            cost: 150,
        });

        await expect(MedicalRecord.create({
            appointment: appointment._id,
            doctor: doctor._id,
            patient: patient._id,
            procedure: 'X-ray',
            cost: 200,
        })).rejects.toThrow();
    });
});
