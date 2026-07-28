# Freshworks Ticket System

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

A modern, enterprise-grade ticketing platform for support teams, built to handle role-based workflows, ticket lifecycle management, and real-time collaboration.

## 📖 Documentation Directory

We have comprehensive guides available for all aspects of the system:

- 🚀 **[Installation Guide](./docs/INSTALLATION.md)** - Step-by-step instructions for setting up the project locally using Docker and Node.
- ⚙️ **[Environment Variables](./docs/ENVIRONMENT.md)** - Detailed explanation of all configuration options.
- 🧪 **[Testing Guide](./docs/TESTING.md)** - How to run and contribute to the Vitest test suites.
- 🚢 **[Deployment Guide](./docs/DEPLOYMENT.md)** - Strategies for taking the application to production.

## 🔌 Interactive API Documentation (Swagger)

The backend features an automatically generated, interactive OpenAPI UI powered by Swagger.

To access the API Docs:
1. Ensure the backend is running (`npm run dev`).
2. Navigate to **[http://localhost:5001/api-docs](http://localhost:5001/api-docs)** in your browser.

Here, you can test endpoints (like `/auth/login` and `/auth/register-admin`) directly from the UI without needing Postman.

---

## Key Features

- **Role-Based Workflows:** Distinct permissions and views for Admins, Agents, and Customers.
- **Ticket Lifecycle:** Manage tickets through statuses (Open, In Progress, Resolved, Closed) with priorities.
- **Audit Trails:** Immutable activity tracking for ticket changes and assignments.
- **Secure Authentication:** JWT-based stateless auth backed by HTTP-only refresh tokens.
- **Clean Architecture:** Modular monolith backend design paired with a responsive Next.js frontend.

## Project Structure

```text
.
├── docs/                    # Detailed technical guides
├── prisma/                  # Database schema, migrations, and seed data
├── src/                     # Backend API application
│   ├── modules/             # Business logic (Auth, Users, Tickets)
│   ├── core/                # Infrastructure (Middlewares, Logger, Swagger)
│   └── server.ts            # Entry point
├── web/                     # Next.js Frontend
└── docker-compose.yml       # Infrastructure orchestration
```

## Team

- **Om Jagtap** — Backend Architecture & Refactoring
- **Aayushman Shukla** — Middleware, Testing, and Deployment
- **Shruti Itkalkar** — Frontend Development

## License

This project is licensed under the ISC License.
