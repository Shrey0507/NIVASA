# NIVASA Backend & Supabase Setup

Express.js REST API and Supabase PostgreSQL integration for the NIVASA Smart Hostel Management System.

## 🚀 Quick Start Commands

### 1. Install Dependencies
`ash
cd backend
npm install
`

### 2. Configure Environment Variables
Copy .env.example to .env if not already done:
`ash
cp .env.example .env
`
Open .env and fill in your Supabase credentials:
- SUPABASE_URL: Project URL from Supabase Settings -> API
- SUPABASE_ANON_KEY: Project Anon/Public Key from Supabase Settings -> API
- SUPABASE_SERVICE_ROLE_KEY: Service Role Secret (for backend administration)

### 3. Initialize Database Schema
1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** -> **New query**
3. Copy the entire contents of ackend/supabase/schema.sql and click **Run**
4. This creates all 7 tables (students, ooms, ees, movements, grievances, 
otices, mess_menu), indexes, triggers, and Row Level Security.

### 4. Test Supabase Connection
`ash
npm run test:db
`

### 5. Start Development Server
`ash
npm run dev
`
Server runs at: http://localhost:5000  
Health check: http://localhost:5000/api/health

---

## 📡 API Endpoints

- **Health Check**: GET /api/health
- **Students**:
  - GET /api/students?page=1&limit=20&search=...&hostel=boys
  - GET /api/students/:id
  - POST /api/students
  - PUT /api/students/:id
  - DELETE /api/students/:id
- **Rooms**:
  - GET /api/rooms?hostel=boys&status=available
  - POST /api/rooms
  - POST /api/rooms/:id/allocate
- **Fees**:
  - GET /api/fees?status=pending
  - POST /api/fees/:id/pay
- **Movements**:
  - GET /api/movements?status=out
  - POST /api/movements
  - POST /api/movements/:id/return
- **Grievances**:
  - GET /api/grievances?status=open
  - POST /api/grievances
  - PUT /api/grievances/:id
- **Notices**:
  - GET /api/notices
  - POST /api/notices
