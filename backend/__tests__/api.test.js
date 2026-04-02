const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');

let adminToken;
let viewerToken;

beforeAll(async () => {
  // Login to get tokens before tests
  const adminRes = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@test.com', password: '123456' });
  adminToken = adminRes.body.token;

  const viewerRes = await request(app)
    .post('/auth/login')
    .send({ email: 'viewer@example.com', password: 'password123' });
  viewerToken = viewerRes.body.token;
});

afterAll(async () => {
  await pool.end();
});

describe('AUTH TESTS', () => {
  it('Valid login should return 200 and token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: '123456' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('Missing fields should return 400', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com' });
    expect(res.statusCode).toEqual(400);
  });

  it('Invalid credentials should return 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'wrongpassword' });
    expect(res.statusCode).toEqual(401);
  });
});

describe('RECORD TESTS', () => {
  it('GET /records (with token) should return 200 and pagination data', async () => {
    const res = await request(app)
      .get('/records')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
  });

  it('POST /records (ADMIN) should return 201', async () => {
    const res = await request(app)
      .post('/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amount: 1500,
        type: 'income',
        category: 'Salary',
        date: '2026-04-02',
        notes: 'Test income'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('record');
  });

  it('POST /records (VIEWER) should return 403', async () => {
    const res = await request(app)
      .post('/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        amount: 200,
        type: 'expense',
        category: 'Food',
        date: '2026-04-02'
      });
    expect(res.statusCode).toEqual(403);
  });
});

describe('DASHBOARD TESTS', () => {
  it('GET /dashboard/summary should return 200 and totals', async () => {
    const res = await request(app)
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('totalIncome');
    expect(res.body).toHaveProperty('totalExpense');
    expect(res.body).toHaveProperty('netBalance');
    expect(res.body).toHaveProperty('categoryTotals');
  });
});
