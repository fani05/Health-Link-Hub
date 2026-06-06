import './setup.js';
import request from 'supertest';
import app from './app.js';

describe('Auth Controllers', () => {

    test('registers a new patient', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'test p',
                email: 'patient@test.com',
                password: '123456',
                role: 'patient',
                phone: '+40712345678',
                address: 'adresa',
            });

        expect(res.status).toBe(201);
        expect(res.body.role).toBe('patient');
        expect(res.body.email).toBe('patient@test.com');
    });

    test('registers a new doctor', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'test d',
                email: 'doctor@test.com',
                password: '123456',
                role: 'doctor',
                phone: '+40799999999',
                address: 'adresa',
                specialization: 'cardiologie',
            });

        expect(res.status).toBe(201);
        expect(res.body.role).toBe('doctor');
    });

    test('fails to register with duplicate email', async () => {
        await request(app).post('/api/auth/register').send({
            name: 'first',
            email: 'same@test.com',
            password: '123456',
            role: 'patient',
            phone: '+40712345678',
            address: 'adresa',
        });

        const res = await request(app).post('/api/auth/register').send({
            name: 'second',
            email: 'same@test.com',
            password: '123456',
            role: 'patient',
            phone: '+40799999999',
            address: 'adresa',
        });

        expect(res.status).toBe(400);
    });

    test('fails to register without required fields', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'test' });

        expect(res.status).toBe(400);
    });


    test('logs in with valid credentials', async () => {
        await request(app).post('/api/auth/register').send({
            name: 'test',
            email: 'login@test.com',
            password: '123456',
            role: 'patient',
            phone: '+40712345678',
            address: 'adresa',
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'login@test.com', password: '123456' });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test('fails to login with wrong password', async () => {
        await request(app).post('/api/auth/register').send({
            name: 'test',
            email: 'wrong@test.com',
            password: '123456',
            role: 'patient',
            phone: '+40712345678',
            address: 'adresa',
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'wrong@test.com', password: 'parola' });

        expect(res.status).toBe(401);
    });

    test('fails to login with non-existent email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'noemail@test.com', password: '123456' });

        expect(res.status).toBe(401);
    });


    test('returns user data with valid token', async () => {
        await request(app).post('/api/auth/register').send({
            name: 'test',
            email: 'test@test.com',
            password: '123456',
            role: 'patient',
            phone: '+40712345678',
            address: 'adresa',
        });

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@test.com', password: '123456' });

        const token = loginRes.body.token;

        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe('test@test.com');
    });

    test('fails without token', async () => {
        const res = await request(app).get('/api/auth/me');

        expect(res.status).toBe(401);
    });

    test('fails with invalid token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer invalidtoken');

        expect(res.status).toBe(401);
    });
});