# Customer Support Ticket Management System (CSTMS)

An enterprise-grade, full-stack Customer Support Ticket Management System inspired by Freshworks. Built with a modern Next.js App Router architecture and powered by PostgreSQL and Prisma.

## Key Features

- **Role-Based Access Control (RBAC):** Distinct experiences and permissions for Admins, Agents, and Customers.
- **Customer Portal:** Customers can seamlessly create tickets, track statuses, and reply to conversations.
- **Agent Workspace:** Agents can manage assigned tickets, collaborate, and resolve issues efficiently.
- **Admin Dashboard:** Total visibility. Admins can assign tickets, manage agents, and oversee the entire system.
- **Real-Time Optimistic UI:** Replies and status changes update instantly using TanStack React Query.
- **Modern UI/UX:** Built with Tailwind CSS, Lucide Icons, and accessible Base UI components for a premium feel.

---

## Architecture

This project follows a strict **Backend-for-Frontend (BFF)** pattern.
- **Frontend:** Next.js App Router (React Server Components + Client Components).
- **Backend API:** Next.js Route Handlers (`/api/*`).
- **Service Layer:** Encapsulated business logic (`src/server/services`).
- **Data Layer:** Prisma ORM connecting to PostgreSQL.
- **Auth:** JWT-based stateless authentication (`jose`) stored in secure HTTP-only cookies.

---

## Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) (Running locally or via Docker)

### 1. Database Initialization
Create a PostgreSQL database. You can use the provided setup script or create it manually:

```sql
CREATE DATABASE cstms_db;
CREATE USER cstms_user WITH ENCRYPTED PASSWORD 'cstms_password';
GRANT ALL PRIVILEGES ON DATABASE cstms_db TO cstms_user;
\c cstms_db
GRANT ALL ON SCHEMA public TO cstms_user;
```

### 2. Environment Variables
Create a `.env` file in the `web/` directory containing:

```env
# Database Connection
DATABASE_URL="postgresql://cstms_user:cstms_password@localhost:5432/cstms_db"

# JWT Secret for Auth (Use a secure random string in production)
JWT_SECRET="your-super-secret-jwt-key"
```

### 3. Install Dependencies
```bash
cd web
npm install
```

### 4. Prisma Setup
Push the schema to your database to create the tables, and generate the Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing the Roles

To fully test the application, you will need users with different roles. You can easily create these users using Prisma Studio.

1. Start Prisma Studio in a new terminal window:
   ```bash
   npx prisma studio
   ```
2. Open `http://localhost:5555`.
3. Open the `User` model and click **Add record**.
4. Create three users with different roles. Example:
   - **Admin:** `admin@example.com` (Role: `ADMIN`)
   - **Agent:** `agent@example.com` (Role: `AGENT`)
   - **Customer:** `customer@example.com` (Role: `CUSTOMER`)
5. *Note: Passwords are automatically hashed upon registration via the UI, but if you create users directly in Prisma Studio, ensure you log in or use a pre-hashed password string if testing manual injection, or simply register them normally through the UI and then modify their roles in Prisma Studio!*

**Best Workflow for Testing:**
1. Register 3 new accounts using the `/register` page in the app. (By default, they will become `CUSTOMER`s).
2. Open Prisma Studio (`npx prisma studio`).
3. Change the role of the first user to `ADMIN` and the second to `AGENT`.
4. Log into different browser profiles or Incognito windows to test the multi-role interactions simultaneously!

---

## Scripts

- `npm run dev` - Starts the Next.js development server.
- `npm run build` - Builds the application for production.
- `npm run start` - Starts the production server.
- `npm run lint` - Runs ESLint.
