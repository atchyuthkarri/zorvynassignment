# 💰 FinDash — Finance Dashboard

A full-stack finance dashboard application built with **Node.js + Express + PostgreSQL** backend and **React + Vite** frontend.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Role Permissions](#role-permissions)
- [Sample Requests](#sample-requests)
- [Deployment](#deployment)
- [Assumptions](#assumptions)

---

## 🛠 Tech Stack

| Layer     | Technology                              |
|-----------|----------------------------------------|
| Backend   | Node.js, Express.js, PostgreSQL (pg)   |
| Frontend  | React 18, Vite, Axios, React Router 6 |
| Auth      | JWT (jsonwebtoken), bcryptjs           |
| Database  | PostgreSQL with raw SQL queries        |

---

## 📁 Project Structure

```
zorvyn/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express server entry point
│   │   ├── controllers/           # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── recordController.js
│   │   │   └── dashboardController.js
│   │   ├── services/              # Business logic layer
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── recordService.js
│   │   │   └── dashboardService.js
│   │   ├── routes/                # Route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── recordRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── middleware/            # Auth, RBAC, error handler
│   │   │   ├── auth.js
│   │   │   ├── rbac.js
│   │   │   └── errorHandler.js
│   │   ├── db/                    # Database setup
│   │   │   ├── pool.js
│   │   │   ├── init.js
│   │   │   └── seed.js
│   │   └── utils/
│   │       └── validators.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Navbar.css
│   │   │   └── Layout.jsx
│   │   └── pages/
│   │       ├── Login.jsx / Login.css
│   │       ├── Dashboard.jsx / Dashboard.css
│   │       ├── Records.jsx / Records.css
│   │       ├── RecordForm.jsx / RecordForm.css
│   │       └── Users.jsx / Users.css
│   ├── .env
│   └── package.json
├── schema.sql
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 14+
- **npm** or **yarn**

### 1. Clone and Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE finance_dashboard;"

# Update backend/.env with your PostgreSQL credentials
# Then initialize tables and seed data:
cd backend
npm run db:init    # Creates tables
npm run db:seed    # Seeds sample data
# OR run both:
npm run db:reset
```

### 3. Configure Environment

Edit `backend/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=finance_dashboard
JWT_SECRET=your_secret_key
```

### 4. Run the Application

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

### 5. Default Login Credentials

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@example.com      | password123 |
| Analyst | analyst@example.com    | password123 |
| Viewer  | viewer@example.com     | password123 |

---

## 📡 API Endpoints

### Base URL
\`http://localhost:5001\`

### Authentication

**POST /auth/login**  
Body:
\`\`\`json
{
  "email": "admin@test.com",
  "password": "123456"
}
\`\`\`
Response:
\`\`\`json
{
  "message": "Login successful",
  "user": {
    "id": 5,
    "name": "Admin User",
    "email": "admin@test.com",
    "role": "ADMIN",
    "status": "ACTIVE"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
\`\`\`

### Protected Routes
For all endpoints below, include the JWT token in your headers:
\`Authorization: Bearer <token>\`

### Users (ADMIN only)
| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| POST   | /users           | Create new user      |
| GET    | /users           | List all users       |
| GET    | /users/:id       | Get user by ID       |
| PUT    | /users/:id       | Update user role/status |

### Financial Records

**GET /records**  
*Access: All roles*  
Query Parameters:
- \`search\` — search within category or notes (ILIKE)
- \`type\` — \`income\` or \`expense\`
- \`category\` — exact or partial string matching
- \`from\` — start date (YYYY-MM-DD)
- \`to\` — end date (YYYY-MM-DD)
- \`page\` — page number (default: 1)
- \`limit\` — items per page (default: 10)

Response (Paginated):
\`\`\`json
{
  "data": [
    {
      "id": 1,
      "amount": "1500.00",
      "type": "income",
      "category": "Salary",
      "date": "2026-04-02T00:00:00.000Z",
      "notes": "Test income"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 5
}
\`\`\`

**POST /records**  
*Access: ADMIN only*  
Body:
\`\`\`json
{
  "amount": 150.50,
  "type": "expense",
  "category": "Food",
  "date": "2026-04-02",
  "notes": "Groceries"
}
\`\`\`

**PUT /records/:id**  
*Access: ADMIN only*  
Update specific fields (partial update supported).

**DELETE /records/:id**  
*Access: ADMIN only*  
Performs a soft delete (sets \`is_deleted = TRUE\`).

### Dashboard 

**GET /dashboard/summary**  
*Access: ANALYST + ADMIN*  
Response:
\`\`\`json
{
  "totalIncome": 25000,
  "totalExpense": 5000,
  "netBalance": 20000,
  "categoryTotals": [
    { "category": "Salary", "type": "income", "total": 25000, "count": 1 }
  ],
  "recentTransactions": [...]
}
\`\`\`

---

## 🔐 Role Permissions

| Feature            | VIEWER | ANALYST | ADMIN |
|--------------------|--------|---------|-------|
| View records       | ✅     | ✅      | ✅    |
| View dashboard     | ❌     | ✅      | ✅    |
| Create records     | ❌     | ❌      | ✅    |
| Update records     | ❌     | ❌      | ✅    |
| Delete records     | ❌     | ❌      | ✅    |
| Manage users       | ❌     | ❌      | ✅    |

---

## 📋 Sample Requests

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Get Dashboard Summary (requires ANALYST/ADMIN token)
```bash
curl http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create a Record (requires ADMIN token)
```bash
curl -X POST http://localhost:5000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 1500.00,
    "type": "income",
    "category": "Freelance",
    "date": "2024-04-01",
    "notes": "Web development project"
  }'
```

### Get Records with Filters
```bash
curl "http://localhost:5000/api/records?type=expense&category=food&from=2024-01-01&to=2024-03-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create a User (requires ADMIN token)
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "New Analyst",
    "email": "newanalyst@example.com",
    "password": "securepass123",
    "role": "ANALYST"
  }'
```

### Update User Role
```bash
curl -X PUT http://localhost:5000/api/users/3 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"role": "ANALYST", "status": "ACTIVE"}'
```

---

## 🚢 Deployment

### Backend → Render / Railway

1. Push backend code to a Git repo
2. On Render/Railway, create a **Web Service**
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables:
   ```
   PORT=5000
   NODE_ENV=production
   DB_HOST=your_pg_host
   DB_PORT=5432
   DB_USER=your_pg_user
   DB_PASSWORD=your_pg_password
   DB_NAME=your_pg_database
   JWT_SECRET=your_production_secret
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
6. Run `npm run db:reset` (or run init + seed scripts) via the shell

### Frontend → Vercel / Netlify

1. Push frontend code to a Git repo
2. On Vercel/Netlify, import the project
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
6. Deploy

---

## 📝 Assumptions

1. **Single-tenant**: One organization using the dashboard
2. **Password hashing**: bcryptjs with 10 salt rounds
3. **JWT expiry**: 24 hours (configurable via .env)
4. **Currency**: USD formatting (easily changeable)
5. **No file uploads**: Records are text-only
6. **Seed data**: 4 sample users and 20 financial records
7. **Pagination**: Default 20 items per page on records, 15 on frontend
8. **Category matching**: Case-insensitive partial matching via ILIKE
9. **Cascade delete**: Deleting a user removes their records (FK constraint)
10. **No email verification**: Users are created directly by admin

---

## 🏗 Architecture Notes

- **Controller → Service → Database** pattern for clean separation
- Raw SQL queries (no ORM) for full control and performance
- JWT tokens stored in localStorage (use httpOnly cookies for production)
- Parallel SQL queries in dashboard service for faster aggregation
- Dynamic query building for filters and partial updates
- Global error handler catches all unhandled errors including PostgreSQL constraint violations

---

Built with ❤️ for clean, production-ready backend practices.
