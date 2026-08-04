# Installation Guide

Follow these steps to set up the Freshworks Ticket System on your local machine.

## Prerequisites
- Node.js (v20+)
- npm or pnpm
- Docker Desktop (for Postgres & Redis)

## 1. Clone & Install
```bash
git clone <repository-url>
cd S115-0726-64bit-Full-Stack-With-NextjsAnd-PostgreSQL-ticket-system

# Install backend dependencies
npm install

# Install frontend dependencies
cd web
npm install
cd ..
```

## 2. Infrastructure Setup (Docker)
Start the PostgreSQL and Redis containers using Docker Compose:
```bash
docker compose up -d
```

## 3. Environment Configuration
Copy the `.env.example` to `.env` and fill in the required values. Refer to [ENVIRONMENT.md](./ENVIRONMENT.md) for details.

## 4. Database Seeding
Push the Prisma schema to the database and seed it with initial admin and agent accounts:
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

## 5. Start the Application
**Terminal 1 (Backend):**
```bash
npm run dev
```
The backend will run on `http://localhost:5001`.

**Terminal 2 (Frontend):**
```bash
cd web
npm run dev
```
The frontend will run on `http://localhost:3000`. Navigate to `http://localhost:3000` to access the application.
