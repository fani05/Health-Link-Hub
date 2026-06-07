import './setup.js';
import request from 'supertest';
import app from './app.js';

// Helper: returns a valid future date string (YYYY-MM-DD) that is not on a weekend
const getValidDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // one week in the future
    // if it's on a weekend, move to the next Monday
    while (date.getDay() === 0 || date.getDay() === 6) {
        date.setDate(date.getDate() + 1);
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

describe('Appointment Controllers (Patient)', () => {
    let patientToken, doctorId;
    const validDate = getValidDate();

    beforeEach(async () => {
        await request(app).post('/api/auth/register').send({
            name: 'test p',
            email: 'patient@test.com',
            password: '123456',
            role: 'patient',
            phone: '+40712345678',
            address: 'adresa',
        });
        const patientLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'patient@test.com', password: '123456' });
        patientToken = patientLogin.body.token;

        await request(app).post('/api/auth/register').send({
            name: 'test d',
            email: 'doctor@test.com',
            password: '123456',
            role: 'doctor',
            phone: '+40799999999',
            address: 'adresa',
            specialization: 'cardiologie',
        });
        const doctorLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'doctor@test.com', password: '123456' });
        doctorId = doctorLogin.body._id;
    });

    test('returns list of doctors', async () => {
        const res = await request(app)
            .get('/api/appointments/doctors')
            .set('Authorization', `Bearer ${patientToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('test d');
    });

    test('creates appointment successfully', async () => {
        const res = await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ doctor: doctorId, date: validDate, time: '10:00' });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('pending');
    });

    test('fails with invalid time slot', async () => {
        const res = await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ doctor: doctorId, date: validDate, time: '10:01' });

        expect(res.status).toBe(400);
    });

    test('fails when slot is already taken', async () => {
        await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ doctor: doctorId, date: validDate, time: '10:00' });

        const res = await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ doctor: doctorId, date: validDate, time: '10:00' });

        expect(res.status).toBe(409);
    });

    test('returns patient appointments', async () => {
        await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ doctor: doctorId, date: validDate, time: '10:00' });

        const res = await request(app)
            .get('/api/appointments/mine')
            .set('Authorization', `Bearer ${patientToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].doctor.name).toBe('test d');
    });

    test('returns occupied slots', async () => {
        await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ doctor: doctorId, date: validDate, time: '10:00' });

        const res = await request(app)
            .get('/api/appointments/slots')
            .set('Authorization', `Bearer ${patientToken}`)
            .query({ doctor: doctorId, date: validDate });

        expect(res.status).toBe(200);
        expect(res.body).toContain('10:00');
    });

    test('cancels own appointment', async () => {
        const createRes = await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ doctor: doctorId, date: validDate, time: '10:00' });

        const res = await request(app)
            .patch(`/api/appointments/${createRes.body._id}/cancel`)
            .set('Authorization', `Bearer ${patientToken}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('cancelled');
    });
});

describe('Appointment Controllers (Doctor)', () => {
    let patientToken, doctorToken, doctorId, appointmentId;
    const validDate = getValidDate();

    beforeEach(async () => {
        await request(app).post('/api/auth/register').send({
            name: 'test p',
            email: 'patient@test.com',
            password: '123456',
            role: 'patient',
            phone: '+40712345678',
            address: 'adresa',
        });
        const patientLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'patient@test.com', password: '123456' });
        patientToken = patientLogin.body.token;

        await request(app).post('/api/auth/register').send({
            name: 'test d',
            email: 'doctor@test.com',
            password: '123456',
            role: 'doctor',
            phone: '+40799999999',
            address: 'adresa',
            specialization: 'cardiologie',
        });
        const doctorLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'doctor@test.com', password: '123456' });
        doctorToken = doctorLogin.body.token;
        doctorId = doctorLogin.body._id;

        const apptRes = await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ doctor: doctorId, date: validDate, time: '10:00' });
        appointmentId = apptRes.body._id;
    });

    test('returns doctor appointments', async () => {
        const res = await request(app)
            .get('/api/appointments/my')
            .set('Authorization', `Bearer ${doctorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
    });

    test('accepts a pending appointment', async () => {
        const res = await request(app)
            .patch(`/api/appointments/${appointmentId}/accept`)
            .set('Authorization', `Bearer ${doctorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('accepted');
    });

    test('fails to accept an already accepted appointment', async () => {
        await request(app)
            .patch(`/api/appointments/${appointmentId}/accept`)
            .set('Authorization', `Bearer ${doctorToken}`);

        const res = await request(app)
            .patch(`/api/appointments/${appointmentId}/accept`)
            .set('Authorization', `Bearer ${doctorToken}`);

        expect(res.status).toBe(400);
    });

    test('rejects a pending appointment with a reason', async () => {
        const res = await request(app)
            .patch(`/api/appointments/${appointmentId}/reject`)
            .set('Authorization', `Bearer ${doctorToken}`)
            .send({ reason: 'Schedule conflict' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('rejected');
        expect(res.body.rejectionReason).toBe('Schedule conflict');
    });

    test('cancels an accepted appointment', async () => {
        await request(app)
            .patch(`/api/appointments/${appointmentId}/accept`)
            .set('Authorization', `Bearer ${doctorToken}`);

        const res = await request(app)
            .patch(`/api/appointments/${appointmentId}/doctor-cancel`)
            .set('Authorization', `Bearer ${doctorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('cancelled');
    });

    test('fails to cancel a non-accepted appointment', async () => {
        const res = await request(app)
            .patch(`/api/appointments/${appointmentId}/doctor-cancel`)
            .set('Authorization', `Bearer ${doctorToken}`);

        expect(res.status).toBe(400);
    });
});