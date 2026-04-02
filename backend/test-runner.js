const http = require('http');

async function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const start = process.hrtime();
        const time = process.hrtime(start);
        resolve({
          status: res.statusCode,
          data: body ? JSON.parse(body) : null,
          time: (time[0] * 1000) + (time[1] / 1000000)
        });
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING QA TESTS ===");

  // 1. TEST AUTHENTICATION FLOW
  console.log("\n1. Testing Auth Flow");
  
  // Valid login
  let res = await request('POST', '/auth/login', { email: 'admin@test.com', password: '123456' });
  console.log(`[POST /auth/login] Valid: ${res.status} (expect 200)`);
  if (!res.data || !res.data.token) {
    console.log("Failed to retrieve token. Body:", res.data);
    return;
  }
  const adminToken = res.data.token;
  
  // Missing email
  res = await request('POST', '/auth/login', { password: '123456' });
  console.log(`[POST /auth/login] Missing email: ${res.status} (expect 400)`);
  
  // Missing password
  res = await request('POST', '/auth/login', { email: 'admin@test.com' });
  console.log(`[POST /auth/login] Missing pass: ${res.status} (expect 400)`);
  
  // Invalid creds
  res = await request('POST', '/auth/login', { email: 'admin@test.com', password: 'wrong' });
  console.log(`[POST /auth/login] Invalid pass: ${res.status} (expect 401)`);
  
  // Get other role tokens from seeded data (viewer@example.com / password123, analyst@example.com / password123)
  const viewerRes = await request('POST', '/auth/login', { email: 'viewer@example.com', password: 'password123' });
  const viewerToken = viewerRes.data.token;
  const analystRes = await request('POST', '/auth/login', { email: 'analyst@example.com', password: 'password123' });
  const analystToken = analystRes.data.token;

  // 2. TEST TOKEN USAGE
  console.log("\n2. Testing Token Usage");
  res = await request('GET', '/records');
  console.log(`[GET /records] No token: ${res.status} (expect 401)`);
  
  res = await request('GET', '/records', null, 'invalid_token_here');
  console.log(`[GET /records] Invalid token: ${res.status} (expect 401)`);

  // 3 & 4. TEST ROLES & RECORDS API
  console.log("\n3. Testing Role Access & Records API");
  
  // Viewer: Read records (Allowed)
  res = await request('GET', '/records', null, viewerToken);
  console.log(`[GET /records] Viewer read: ${res.status} (expect 200), Records count: ${res.data.records ? res.data.records.length : 'none'}`);
  
  // Viewer: Create record (Forbidden)
  res = await request('POST', '/records', { amount: 100, type: 'expense', category: 'Food', date: '2026-04-02', notes: 'x' }, viewerToken);
  console.log(`[POST /records] Viewer create: ${res.status} (expect 403)`);
  
  // Analyst: Read dashboard (Allowed)
  res = await request('GET', '/dashboard/summary', null, analystToken);
  console.log(`[GET /dashboard] Analyst read: ${res.status} (expect 200)`);
  
  // Analyst: Update record (Forbidden)
  res = await request('PUT', '/records/1', { amount: 200 }, analystToken);
  console.log(`[PUT /records/1] Analyst update: ${res.status} (expect 403)`); 
  
  // Admin: Create record (Allowed - Validation success)
  res = await request('POST', '/records', { amount: 550, type: 'income', category: 'Bonus', date: '2026-04-01', notes: 'Test bonus' }, adminToken);
  console.log(`[POST /records] Admin valid create: ${res.status} (expect 201)`);
  
  const createdRecordId = res.data.record ? res.data.record.id : null;
  
  // Admin: Create record (Invalid input)
  res = await request('POST', '/records', { amount: -50, type: 'income', category: 'Bonus', date: 'invalid-date' }, adminToken);
  console.log(`[POST /records] Admin invalid create: ${res.status} (expect 400)`);

  // Admin: Update record
  if (createdRecordId) {
    res = await request('PUT', `/records/${createdRecordId}`, { amount: 600 }, adminToken);
    console.log(`[PUT /records/:id] Admin valid update: ${res.status} (expect 200)`);
    
    // Admin: Delete record
    res = await request('DELETE', `/records/${createdRecordId}`, null, adminToken);
    console.log(`[DELETE /records/:id] Admin valid delete: ${res.status} (expect 200)`);
  } else {
    console.log(`Skipping Update/Delete tests... creation failed`);
  }

  // Filters
  res = await request('GET', '/records?type=income', null, adminToken);
  console.log(`[GET /records?type=income] Filter response status: ${res.status}`);
  if(res.data && res.data.records) console.log(`   Returned only income? ${res.data.records.every(r => r.type === 'income')}`);

  // 5. TEST DASHBOARD API Logic
  console.log("\n5. Testing Dashboard API Logic");
  res = await request('GET', '/dashboard/summary', null, adminToken);
  console.log(`[GET /dashboard/summary] Status: ${res.status}`);
  if (res.data && res.data.summary) {
    const sum = res.data.summary;
    const net = sum.totalIncome - sum.totalExpense;
    console.log(`   Total Income: ${sum.totalIncome}`);
    console.log(`   Total Expense: ${sum.totalExpense}`);
    console.log(`   Net Balance: ${sum.netBalance}`);
    console.log(`   Math matches? ${sum.netBalance === net}`);
    console.log(`   Recent txt count: ${sum.recentTransactions.length}`);
  }

  // 6. TEST ERROR HANDLING
  console.log("\n6. Testing Error Handling");
  res = await request('GET', '/non-existent-route');
  console.log(`[GET /non-existent-route] Status: ${res.status} (expect 404)`);
}

runTests();
