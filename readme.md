# Freshworks Ticket Management System

[![CI](https://github.com/kalviumcommunity/S115-0726-64bit-Full-Stack-With-NextjsAnd-PostgreSQL-ticket-system/actions/workflows/ci.yml/badge.svg)](https://github.com/kalviumcommunity/S115-0726-64bit-Full-Stack-With-NextjsAnd-PostgreSQL-ticket-system/actions/workflows/ci.yml)

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

An enterprise-grade, full-stack Customer Support Ticket Management System built for Freshworks. Developed as part of the Kalvium Software Product Engineering program by **Team 64bit**. Powered by Next.js App Router, PostgreSQL, and Prisma.

> **Team:** Om Jagtap (Backend) · Shruti Itkalkar (Frontend) · Aayushman Shukla (Middleware & Testing)

## Problem Statement

Support teams require a centralized, secure, and structured environment to track, prioritize, and resolve customer inquiries. Generic communication tools lack the necessary workflows, such as issue status tracking, agent assignment, internal team notes, and structured role separation. This project solves that by providing a dedicated ticketing platform with tailored interfaces for Admins, Agents, and Customers, ensuring that no customer issue falls through the cracks and support performance can be monitored.

## Key Features

| Feature | Description |
|---|---|
| **Role-Based Access Control** | Distinct dashboards and permissions for Admin, Agent, and Customer roles |
| **Ticket Lifecycle** | Full ticket workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED |
| **Optimistic UI** | Replies appear instantly; status updates confirmed without page reload |
| **Conversation Threads** | Rich message history with timestamps and sender info per ticket |
| **Assignment Modal** | Admins can assign/reassign tickets to agents via a polished UI |
| **Admin Panel** | Dedicated agent management page only accessible by Admins |
| **Error Boundaries** | Global `error.tsx` and `not-found.tsx` for graceful failure handling |
| **Toast Notifications** | Inline feedback for status changes and assignment actions |
| **Protected Routes** | Next.js middleware guards all private routes with JWT verification |
| **Unauthorized Page** | Custom access-denied page for role-based route violations |

- Role-based access for Admin, Agent, and Customer users
- Ticket lifecycle management with statuses such as Open, In Progress, Resolved, and Closed
- Priority-based ticket handling
- Conversation history through ticket replies
- Activity tracking for ticket changes and assignment history
- Secure authentication and session management using JWT
- Rate limiting, logging, and structured error handling
- Clean UI for managing tickets and support workflows

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Lucide Icons, Framer Motion
- **State Management:** TanStack React Query (optimistic updates)
- **Backend:** Node.js + Express, Next.js Route Handlers (BFF pattern)
- **Database:** PostgreSQL via Neon (serverless) / Docker
- **ORM:** Prisma
- **Auth:** JWT (`jose`) with secure HTTP-only cookies
- **Validation:** Zod, React Hook Form
- **Developer Tools:** Docker Compose, Prisma Studio, Vitest

---

## 📖 Documentation Directory

We have comprehensive guides available for all aspects of the system. Please refer to the following documents for detailed insights:

| Document | Description |
|---|---|
| [**Project Overview**](./docs/project-overview.md) | High-level summary of objectives, features, and final project capabilities. |
| [**Architecture**](./docs/architecture.md) | Monorepo structure, BFF pattern, and technology decoupling details. |
| [**Ticket Module**](./docs/ticket-module.md) | Core logic and REST APIs for the ticket system. |
| [**Ticket Lifecycle**](./docs/ticket-lifecycle.md) | Detailed workflows for ticket statuses and assignments. |
| [**Replies & Chat**](./docs/replies-chat.md) | Threaded conversations and internal agent notes. |
| [**Authentication**](./docs/authentication.md) | JWT implementation and secure session management. |
| [**Authorization**](./docs/authorization.md) | Strict Role-Based Access Control (RBAC) details. |
| [**Database Schema**](./docs/database.md) | Explanation of the Prisma ORM models and relationships. |
| [**API Guide**](./docs/api-guide.md) | Comprehensive backend API endpoints documentation. |

---

## Architecture

This project follows a strict **Backend-for-Frontend (BFF)** pattern:

```text
.
├── prisma/                  # Prisma schema, migrations, and seed data
├── src/                     # Backend application source
│   ├── modules/             # Auth, user, and ticket modules
│   ├── core/                # Shared infrastructure and middleware
│   └── server.ts            # Application entry point
├── web/                     # Next.js frontend application
├── docker-compose.yml       # PostgreSQL container configuration
├── package.json             # Backend scripts and dependencies
└── readme.md                # Project documentation
```

```
web/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login & Register pages
│   │   ├── (dashboard)/      # Protected dashboard layout
│   │   │   └── dashboard/
│   │   │       ├── tickets/  # Ticket list & detail pages
│   │   │       └── agents/   # Admin-only agent management
│   │   ├── unauthorized/     # RBAC access-denied page
│   │   ├── error.tsx         # Global error boundary
│   │   └── not-found.tsx     # Global 404 page
│   ├── components/
│   │   ├── layout/           # Header, Sidebar
│   │   ├── tickets/          # TicketCard, MessageBubble, ReplyBox
│   │   └── ui/               # Shared design system components
│   ├── lib/
│   │   └── api.ts            # Typed API client
│   ├── middleware.ts          # JWT auth + RBAC route protection
│   └── server/               # Server-side services & validators
└── prisma/
    └── schema.prisma          # Full data model
```

---

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

> Note: Ensure PORT is set to 5001, as the Next.js frontend proxy (next.config.mjs) routes /api requests to http://127.0.0.1:5001/api/v1/.

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

### 5. Database Setup

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

In a separate terminal, start the frontend:

```bash
cd web && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## User Guide

### As a Customer
1. **Register** at `/register` and log in.
2. On the **Dashboard**, view your open tickets.
3. **Click a ticket** to open the conversation thread.
4. Use the **Reply Box** at the bottom to respond — replies appear instantly (optimistic UI).

### As an Agent
1. Log in with an Agent account (role must be set by an Admin).
2. Your dashboard shows only **tickets assigned to you**.
3. Open a ticket to **change its status** (Open → In Progress → Resolved → Closed) using the dropdown at the top.
4. You can **reply** to any conversation in your queue.

### As an Admin
1. Log in with an Admin account.
2. Your dashboard shows **all tickets** in the system.
3. Use the **Assign** button on any ticket card to assign it to an agent.
4. Navigate to **Dashboard → Agents** to view all registered agents in the system.
5. You have full access to all ticket conversations and status controls.

---

## Testing Roles

The easiest way to test all three roles:

1. **Register 3 accounts** via `/register` (all default to `CUSTOMER`).
2. Open Prisma Studio:
   ```bash
   cd web
   npx prisma studio
   ```
3. At [http://localhost:5555](http://localhost:5555), set one user's role to `ADMIN` and another to `AGENT`.
4. Open **3 browser profiles** (or Incognito windows) and log in with each account simultaneously.

---

## Contributing

Please read the [CONTRIBUTING.md](./CONTRIBUTING.md) file for details on our code of conduct, and the process for submitting pull requests to us.

---

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

---

## Team

| Member | Role |
|---|---|
| **Om Jagtap** | Backend Development — API routes, services, database models |
| **Shruti Itkalkar** | Frontend Development — UI components, pages, design system |
| **Aayushman Shukla** | Middleware, Auth, Testing & Deployment |

## License

This project is licensed under the ISC License.
