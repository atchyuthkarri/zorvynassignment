# Finance Dashboard Backend API

<p align="center">
  A production-ready Node.js + Express API backend for a Finance Dashboard system. <br/> Built with best-in-class architectural patterns, security controls, and PostgreSQL performance.
</p>

## 🚀 Overview
The Finance Dashboard Backend API provides the infrastructure to power a comprehensive financial tracking and management application. It handles user authentication, protects endpoints precisely via Role-Based Access Control (RBAC), manages the full lifecycle of financial income/expense records, and generates rapid, aggregated dashboard analytics.

## 🛠 Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon Serverless)
- **Authentication:** JWT (JSON Web Tokens) & `bcryptjs`
- **Testing:** Jest + Supertest

---

## 🔥 Features
- **Auth & Authorization:** Secure JWT authentication with strict `ADMIN`, `ANALYST`, and `VIEWER` roles.
- **Financial Records CRUD:** Full record management workflows with input validation.
- **Dashboard Analytics:** High-performance, parallelized SQL aggregations measuring Net Balance, category breakdowns, and income/expenses.
- **Pagination & Search:** `ILIKE` pattern-matched searching natively across records alongside offset/limit pagination payloads.
- **Soft Delete:** Guaranteed safety and historical retention. Deleting a record hides it (`is_deleted = TRUE`) without destroying analytics.
- **Rate Limiting:** Protects the endpoints via globally integrated IP tracking against brute force attacks.
- **Automated Testing:** Dedicated unit/integration suite testing core functionality autonomously.

---

## 🏛 Architecture

The project employs a clean **Controller-Service architecture** layer, abstracting business logic away from direct HTTP request handling, guaranteeing modularity and scalability:

```text
Client Request
      ↓  
 Express Routes
      ↓  
  Middleware (Auth Verification & RBAC Checks, Rate Limiter)
      ↓  
 Controllers (Request/Response formatting, Input Validation)
      ↓  
  Services (Business Logic, Parallel PG Pool Queries)
      ↓  
 PostgreSQL (Neon Cloud DB)
```

---

## 📡 API Endpoints

### AUTH
- `POST /auth/login` - Verify credentials and return JWT payload.

### RECORDS
- `GET /records` - Search, filter, and paginate financial transactions.
- `POST /records` - Create new record *(ADMIN only)*.
- `PUT /records/:id` - Update existing record *(ADMIN only)*.
- `DELETE /records/:id` - Soft-delete an existing record *(ADMIN only)*.

### DASHBOARD
- `GET /dashboard/summary` - Get aggregated analytical metrics *(ADMIN & ANALYST only)*.

---

## 🔐 Authentication Guide

For all protected routes (`/records`, `/dashboard/summary`), include your user token in the HTTP Headers using the Bearer schema:

```text
Authorization: Bearer <your_jwt_token_here>
```

---

## 📋 Sample Requests

### 1. Login Request
```bash
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"your_password"}'
```

### 2. Fetch Records (Paginated + Filtered)
```bash
curl -X GET "http://localhost:5001/records?search=salary&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 💻 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repo_url>
   cd backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Duplicate the provided example and add your PostgreSQL valid connection string inside the new `.env`.
   ```bash
   cp .env.example .env
   ```
4. **Initialize & Seed Sample Data:**
   *(Ensure you have an empty Postgres DB referenced in DATABASE_URL prior to executing)*
   ```bash
   npm run db:reset
   ```
5. **Start Application:**
   ```bash
   npm run dev
   ```

---

## 🧪 Testing

The codebase utilizes **Jest & Supertest** for continuous integration and QA checks. Executing the test block runs end-to-end simulated scenarios across Auth, Records, and Dashboard layers:

```bash
npm test
```

---

## 💡 Design Decisions
- **Soft Delete:** Financial data is usually highly critical to aggregate compliance. Removing hard deletion ensures mistakes are recoverable and dashboard math metrics don't mysteriously drift historically over time.
- **JWT (JSON Web Tokens):** Designed specifically for horizontal scaling in stateless infrastructure without dragging down databases verifying Sessions via lookup queries on every protected route.
- **Pagination:** Essential for production performance APIs to bypass massive payload transfers reducing massive `SELECT *` hits.

---

## 🔭 Future Improvements
- **Swagger Documentation:** Formalize end-to-end interface declarations via OpenAPI UI.
- **Deployment Implementation:** Containerization explicitly for Render/Railway/DigitalOcean deployments.
- **Advanced Analytics:** Deeper time-series trend tracking algorithms natively running through Postgres `GROUP BY time` variables.
