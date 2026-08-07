# Architecture Overview

## Monorepo Structure
The Freshworks Ticket System utilizes a monorepo containing:
1. **Backend** (`/src`): Express.js REST API with TypeScript and Prisma ORM.
2. **Frontend** (`/web`): Next.js App Router application with Tailwind CSS and React Query.

## Backend Architecture
- **Layered Design**: The backend uses a Modular Monolith architecture consisting of Routers, Controllers, and Services.
- **Data Access**: Repository Pattern via `PrismaRepositories.ts` abstracting the Prisma Client logic.
- **Storage**: PostgreSQL handles relational data; Cloudinary handles media uploads.

## Frontend Architecture
- **State Management**: Server state is managed by `@tanstack/react-query`, ensuring caching and optimistic updates.
- **Routing**: Next.js App Router providing nested layouts (`/dashboard/tickets`).
- **UI System**: `shadcn/ui` components customized with Tailwind.
