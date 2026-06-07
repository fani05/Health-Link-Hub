import './setup.js';
import request from 'supertest';
import app from './app.js';

const getValidDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    while (date.getDay() === 0 || date.getDay() === 6) {
        date.setDate(date.getDate() + 1);
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

describe('Medical Record Controllers', () => {
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

        await request(app)
            .patch(`/api/appointments/${appointmentId}/accept`)
            .set('Authorization', `Bearer ${doctorToken}`);
    });

    const createRecord = (token, apptId) =>
        request(app)
            .post('/api/medical-records')
            .set('Authorization', `Bearer ${token}`)
            .send({ appointmentId: apptId, procedure: 'Consultation', cost: 150, observations: 'Test obs' });

    test('creates a medical record for an accepted appointment', async () => {
        const res = await createRecord(doctorToken, appointmentId);

        expect(res.status).toBe(201);
        expect(res.body.procedure).toBe('Consultation');
        expect(res.body.cost).toBe(150);
    });

    test('fails to create record when requester is not a doctor', async () => {
        const res = await createRecord(patientToken, appointmentId);

        expect(res.status).toBe(403);
    });

    test('updates procedure and cost of a medical record', async () => {
        const created = await createRecord(doctorToken, appointmentId);
        const recordId = created.body._id;

        const res = await request(app)
            .put(`/api/medical-records/${recordId}`)
            .set('Authorization', `Bearer ${doctorToken}`)
            .send({ procedure: 'MRI Scan', cost: 500 });

        expect(res.status).toBe(200);
        expect(res.body.procedure).toBe('MRI Scan');
        expect(res.body.cost).toBe(500);
    });

    test('fails to update record when not the owning doctor', async () => {
        const created = await createRecord(doctorToken, appointmentId);
        const recordId = created.body._id;

        await request(app).post('/api/auth/register').send({
            name: 'other d',
            email: 'other@test.com',
            password: '123456',
            role: 'doctor',
            phone: '+40711111111',
            address: 'adresa',
            specialization: 'neurologie',
        });
        const otherLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'other@test.com', password: '123456' });

        const res = await request(app)
            .put(`/api/medical-records/${recordId}`)
            .set('Authorization', `Bearer ${otherLogin.body.token}`)
            .send({ procedure: 'Other', cost: 100 });

        expect(res.status).toBe(403);
    });

    test('deletes a medical record', async () => {
        const created = await createRecord(doctorToken, appointmentId);
        const recordId = created.body._id;

        const res = await request(app)
            .delete(`/api/medical-records/${recordId}`)
            .set('Authorization', `Bearer ${doctorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Record deleted');
    });

    test('fails to delete record when not the owning doctor', async () => {
        const created = await createRecord(doctorToken, appointmentId);
        const recordId = created.body._id;

        await request(app).post('/api/auth/register').send({
            name: 'other d',
            email: 'other@test.com',
            password: '123456',
            role: 'doctor',
            phone: '+40711111111',
            address: 'adresa',
            specialization: 'neurologie',
        });
        const otherLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'other@test.com', password: '123456' });

        const res = await request(app)
            .delete(`/api/medical-records/${recordId}`)
            .set('Authorization', `Bearer ${otherLogin.body.token}`);

        expect(res.status).toBe(403);
    });

    test('marks an accepted appointment as no-show', async () => {
        const res = await request(app)
            .patch(`/api/medical-records/appointment/${appointmentId}/no-show`)
            .set('Authorization', `Bearer ${doctorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('no-show');
    });

    test('fails to mark as no-show when appointment is already no-show', async () => {
        await request(app)
            .patch(`/api/medical-records/appointment/${appointmentId}/no-show`)
            .set('Authorization', `Bearer ${doctorToken}`);

        const res = await request(app)
            .patch(`/api/medical-records/appointment/${appointmentId}/no-show`)
            .set('Authorization', `Bearer ${doctorToken}`);

        expect(res.status).toBe(400);
    });

    test('returns the list of patients for the doctor', async () => {
        await createRecord(doctorToken, appointmentId);

        const res = await request(app)
            .get('/api/medical-records/patients')
            .set('Authorization', `Bearer ${doctorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('test p');
    });

    test('returns patient records and pending appointments', async () => {
        await createRecord(doctorToken, appointmentId);

        const patientsRes = await request(app)
            .get('/api/medical-records/patients')
            .set('Authorization', `Bearer ${doctorToken}`);
        const patientId = patientsRes.body[0]._id;

        const res = await request(app)
            .get(`/api/medical-records/patients/${patientId}`)
            .set('Authorization', `Bearer ${doctorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.records.length).toBe(1);
        expect(res.body.records[0].procedure).toBe('Consultation');
    });

    test('returns correct statistics after creating a record', async () => {
        await createRecord(doctorToken, appointmentId);

        const res = await request(app)
            .get('/api/medical-records/stats')
            .set('Authorization', `Bearer ${doctorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.totalPatients).toBe(1);
        expect(res.body.totalRevenue).toBe(150);
        expect(res.body.completedAppointments).toBe(1);
    });

    test('returns patient own intervention history', async () => {
        await createRecord(doctorToken, appointmentId);

        const res = await request(app)
            .get('/api/medical-records/mine')
            .set('Authorization', `Bearer ${patientToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].procedure).toBe('Consultation');
    });

    test('fails with 403 when a doctor tries to access patient-only route', async () => {
        const res = await request(app)
            .get('/api/medical-records/mine')
            .set('Authorization', `Bearer ${doctorToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Access allowed only for patients');
    });
});
