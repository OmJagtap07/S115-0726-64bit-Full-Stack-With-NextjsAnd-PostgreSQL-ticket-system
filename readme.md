# Freshworks Ticket System

A full-stack ticket management application built with Next.js, TypeScript, Prisma, and PostgreSQL. The platform is designed to support a role-based workflow for support teams, allowing admins and agents to manage tickets, assign ownership, and track conversations efficiently.

## Overview

This project aims to simplify support operations by providing a structured system for:

- creating and tracking support tickets
- assigning tickets to specific agents
- managing ticket status through a clear workflow
- storing ticket conversations through message history
- supporting future expansion with a scalable backend structure

## Problem Statement

Freshworks requires a ticketing system where support agents can work within a controlled environment that supports secure role-based access. Tickets should be easy to assign, update, and monitor, while admins can manage workflow and reassignment effectively.

## Key Features

- Role-based access for Admin and Agent users
- Ticket assignment and status tracking
- Message-based conversation history for each ticket
- Prisma-powered database modeling for users, tickets, and messages
- Modern frontend foundation built with Next.js and React

## Tech Stack

- Frontend: Next.js, React, TypeScript
- Styling: Tailwind CSS
- Backend: Next.js server-side logic
- Database: PostgreSQL
- ORM: Prisma
- Authentication helpers: bcrypt and JSON Web Token

## Project Structure

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
prisma/
├── schema.prisma
public/
package.json
tsconfig.json
next.config.ts
postcss.config.mjs
prisma.config.ts
```

## Database Model

The current Prisma schema includes the following core models:

- User
- Ticket
- Message

These models support role-based user access, ticket assignment, and ticket conversation history.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository

   ```

   bash
   git clone <repository-url>
   cd S115-0726-64bit-Full-Stack-With-NextjsAnd-PostgreSQL-ticket-system
   ```

2. Install dependencies

   ```

   bash
   npm install
   ```

3. Create a environment file

   ```

   bash
   touch .env
   ```

4. Add your database connection string

   ```

   bash
   env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   ```

5. Generate Prisma client

   ```

   bash
   npx prisma generate
   ```

6. Run database migrations

   ```

   bash
   npx prisma migrate dev --name init
   ```

7. Start the development server

   ```

   bash
   npm run dev
   ```

### Useful Commands

```bash
npm run build
npm run lint
npx prisma studio
```

## Team

- Om Jagtap — Backend Development
- Aayushman Shukla — Middleware, Testing, and Deployment
- Shruti Itkalkar — Frontend Development

## Contribution Guidelines

1. Fork the repository and create a feature or fix branch.
2. Use clear branch names such as `feature/your-feature` or `fix/bug-name`.
3. Keep changes focused and documented.
4. Test your work before pushing.
5. Open a pull request with a concise summary of your changes.

## Git Workflow

- `main` — stable production-ready branch
- `feature/*` — new feature development
- `fix/*` — bug fixes and improvements
- `docs/*` — documentation updates

Example:

```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "Add your feature"
git push origin feature/your-feature-name
```
