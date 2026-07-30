# Freshworks Ticket Management System

An enterprise-grade, full-stack Customer Support Ticket Management System built for Freshworks by **Team 115**. Powered by Next.js App Router, PostgreSQL, and Prisma.

> **Team:** Om Jagtap (Backend) · Shruti Itkalkar (Frontend) · Aayushman Shukla (Middleware & Testing)

---

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

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Lucide Icons, Framer Motion
- **State Management:** TanStack React Query (optimistic updates)
- **Backend:** Next.js Route Handlers (BFF pattern)
- **Database:** PostgreSQL via Neon (serverless)
- **ORM:** Prisma
- **Auth:** JWT (`jose`) with secure HTTP-only cookies
- **Validation:** Zod, React Hook Form

---

## Architecture

This project follows a strict **Backend-for-Frontend (BFF)** pattern:

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

## Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- PostgreSQL (local or via [Neon](https://neon.tech))

### 1. Clone & Install

```bash
git clone <repo-url>
cd web
npm install
```

### 2. Environment Variables

Create a `.env` file in the `web/` directory:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"
```

### 3. Database Setup

```bash
npx prisma db push
npx prisma generate
```

Optionally seed test data:

```bash
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
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

## Git Workflow

| Branch prefix | Purpose |
|---|---|
| `main` | Stable, production-ready code |
| `feature/*` | New feature development |
| `fix/*` | Bug fixes |
| `docs/*` | Documentation updates |

### Creating a PR

```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
# Open a Pull Request on GitHub targeting main
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server at `localhost:3000` |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint checks |

---

## Team

| Member | Role |
|---|---|
| **Om Jagtap** | Backend Development — API routes, services, database models |
| **Shruti Itkalkar** | Frontend Development — UI components, pages, design system |
| **Aayushman Shukla** | Middleware, Auth, Testing & Deployment |
