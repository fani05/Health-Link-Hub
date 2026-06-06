import './setup.js';
import User from '../src/models/User.js';

describe('User Model', () => {

    test('creates a valid patient', async () => {
        const user = await User.create({
            name: 'test patient',
            email: 'patient@test.com',
            password: '123456',
            role: 'patient',
            phone: '+40712345678',
            address: 'adresa',
        });

        expect(user._id).toBeDefined();
        expect(user.email).toBe('patient@test.com');
        expect(user.role).toBe('patient');
    });

    test('creates a valid doctor with specialization', async () => {
        const user = await User.create({
            name: 'test doctor',
            email: 'doctor@test.com',
            password: '123456',
            role: 'doctor',
            phone: '+40712345678',
            address: 'adresa',
            specialization: 'cardiologie',
        });

        expect(user.role).toBe('doctor');
        expect(user.specialization).toBe('cardiologie');
    });

    test('fails without required fields', async () => {
        await expect(User.create({})).rejects.toThrow();
    });

    test('fails with invalid role', async () => {
        await expect(User.create({
            name: 'test',
            email: 'bad@test.com',
            password: '123456',
            role: 'admin',
            phone: '+40712345678',
            address: 'adresa',
        })).rejects.toThrow();
    });

    test('fails when doctor has no specialization', async () => {
        await expect(User.create({
            name: 'test',
            email: 'test@test.com',
            password: '123456',
            role: 'doctor',
            phone: '+40712345678',
            address: 'adresa',
        })).rejects.toThrow();
    });

    test('fails with password shorter than 6 characters', async () => {
        await expect(User.create({
            name: 'test',
            email: 'test@test.com',
            password: '123',
            role: 'patient',
            phone: '+40712345678',
            address: 'adresa',
        })).rejects.toThrow();
    });

    test('hashes password before save', async () => {
        const user = await User.create({
            name: 'test',
            email: 'test@test.com',
            password: '123456',
            role: 'patient',
            phone: '+40712345678',
            address: 'adresa',
        });

        const found = await User.findById(user._id).select('+password');
        expect(found.password).not.toBe('123456');
        expect(found.password).toMatch(/^\$2/);
    });

    test('does not rehash password when updating other fields', async () => {
        const user = await User.create({
            name: 'test',
            email: 'test@test.com',
            password: '123456',
            role: 'patient',
            phone: '+40712345678',
            address: 'adresa',
        });

        const found = await User.findById(user._id).select('+password');
        const originalHash = found.password;

        found.name = 'Updated Name';
        await found.save();

        const updated = await User.findById(user._id).select('+password');
        expect(updated.password).toBe(originalHash);
    });

    test('matchPassword returns true for correct password', async () => {
        const user = await User.create({
            name: 'test',
            email: 'test@test.com',
            password: '123456',
            role: 'patient',
            phone: '+40712345678',
            address: 'adresa',
        });

        const found = await User.findById(user._id).select('+password');
        expect(await found.matchPassword('123456')).toBe(true);
    });

    test('matchPassword returns false for wrong password', async () => {
        const user = await User.create({
            name: 'test',
            email: 'test@test.com',
            password: '123456',
            role: 'patient',
            phone: '+40712345678',
            address: 'adresa',
        });

        const found = await User.findById(user._id).select('+password');
        expect(await found.matchPassword('wrongpassword')).toBe(false);
    });
});