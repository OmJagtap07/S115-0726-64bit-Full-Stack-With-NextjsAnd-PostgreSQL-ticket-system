# Freshworks Ticket System

A modern full-stack ticketing platform for support teams, built with Node.js, Express, TypeScript, Prisma, PostgreSQL, and Next.js. The system is designed to support role-based workflows for customer support operations, including ticket creation, assignment, status tracking, replies, and activity history.

## Overview

This repository contains a monorepo-style implementation with:

- a backend API for ticket and user management
- a responsive frontend dashboard for agents and admins
- a Prisma-based data model for tickets, users, sessions, replies, and activity logs
- PostgreSQL-backed persistence with Docker support for local development

## Key Features

- Role-based access for Admin, Agent, and Customer users
- Ticket lifecycle management with statuses such as Open, In Progress, Resolved, and Closed
- Priority-based ticket handling
- Conversation history through ticket replies
- Activity tracking for ticket changes and assignment history
- Secure authentication and session management using JWT
- Rate limiting, logging, and structured error handling
- Clean UI for managing tickets and support workflows

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis-backed caching support
- JWT-based authentication
- Zod for validation

### Frontend
- Next.js
- React
- Tailwind CSS
- shadcn/ui components

### Developer Tools
- Docker Compose
- Prisma Studio / Prisma Migrate
- Vitest for backend testing

## Project Structure

```text
.
├── prisma/                  # Prisma schema, migrations, and seed data
├── src/                     # Backend application source
│   ├── modules/             # Auth, user, and ticket modules
│   ├── core/               # Shared infrastructure and middleware
│   └── server.ts           # Application entry point
├── web/                     # Next.js frontend application
├── docker-compose.yml      # PostgreSQL container configuration
├── package.json             # Backend scripts and dependencies
└── readme.md                # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Docker Desktop

### 1. Clone the repository

```bash
git clone <repository-url>
cd S115-0726-64bit-Full-Stack-With-NextjsAnd-PostgreSQL-ticket-system
```

### 2. Configure environment variables

Create a `.env` file in the project root. This configuration will be utilized by the backend server. The Next.js frontend does not require a separate `.env` file for local development.

```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://cstms_user:cstms_password@localhost:5432/cstms_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your_refresh_secret"
JWT_REFRESH_EXPIRES_IN="7d"
```
Note: Ensure PORT is set to 5001, as the Next.js frontend proxy (next.config.mjs) routes /api requests to http://127.0.0.1:5001/api/v1/.

### 3. Start the database

Start the PostgreSQL and Redis containers using Docker:

```bash
docker compose up -d
```

### 4. Install dependencies (node_modules)

You must install dependencies for both the backend and frontend directories to create the respective node_modules folders.

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd web
npm install
cd ..
```

### 5. Run Prisma setup

Generate the Prisma Client types for TypeScript and initialize the database.

```bash
# Push schema state to the database and generate Prisma Client in root
npx prisma db push

# Generate Prisma Client for the web frontend
cd web
npx prisma generate --schema=../prisma/schema.prisma
cd ..

# Seed the database with initial users and tickets
npx prisma db seed
```

### 6. Start the applications

Run the backend from the project root:

```bash
npm run dev
```

Run the frontend in a separate terminal:

```bash
cd web
npm run dev
```

The backend API will run on `http://localhost:5001` and the frontend UI on `http://localhost:3000`.

## Database Model

The Prisma schema includes the following core models:

- `User` for authentication and role management
- `Session` for refresh token handling
- `Ticket` for support requests and lifecycle state
- `TicketReply` for threaded communication
- `TicketActivity` for audit/history tracking
- `Attachment` for file support

## Available Scripts

### Backend
- `npm run dev` — start the backend in development mode
- `npm run build` — build the server for production
- `npm run start` — start the compiled server
- `npm test` — run backend tests

### Frontend
- `cd web && npm run dev` — start the Next.js app
- `cd web && npm run build` — create a production build
- `cd web && npm run lint` — run ESLint checks

## Contribution Guidelines

1. Fork the repository and create a feature branch.
2. Use descriptive branch names such as `feature/your-feature` or `fix/bug-name`.
3. Keep changes focused and document significant updates.
4. Test your changes locally before opening a pull request.
5. Submit a pull request with a clear summary of the change.

## Team

- Om Jagtap — Backend Development
- Aayushman Shukla — Middleware, Testing, and Deployment
- Shruti Itkalkar — Frontend Development

## License

This project is licensed under the ISC License.

