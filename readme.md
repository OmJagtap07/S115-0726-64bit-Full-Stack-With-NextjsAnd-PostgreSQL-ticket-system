# Ticket System for Freshworks

## Backend Folder Structure

```text
app/
└── api/
    ├── auth/
    ├── tickets/
    ├── users/
    ├── messages/
    └── admin/

lib/
├── prisma.ts
├── auth.ts
├── db.ts
└── utils.ts

prisma/
├── schema.prisma
├── migrations/
└── seed.ts

services/
├── auth.service.ts
├── ticket.service.ts
├── user.service.ts
├── message.service.ts
└── admin.service.ts

repositories/
├── ticket.repository.ts
├── user.repository.ts
└── message.repository.ts

validators/
├── auth.validator.ts
├── ticket.validator.ts
└── user.validator.ts

middleware/
├── auth.middleware.ts
├── role.middleware.ts
└── error.middleware.ts

constants/
├── roles.ts
├── status.ts
└── permissions.ts

config/
├── env.ts
└── database.ts

logs/

scripts/
```

---
## Project Overview

This project is a full-stack ticketing system built for Freshworks to help support agents manage customer issues efficiently. The application focuses on a simple, role-based workflow for handling tickets, sending responses, and managing assignments.

## Problem Statement

Freshworks wants a ticket system where agents can view open tickets one page at a time. When an agent replies to a ticket, the new message should appear instantly while the message is being sent in the background. Agents should only be able to view tickets assigned to them, and admins should be able to reassign tickets as needed.

## Tech Stack

- Frontend: Next.js
- Backend: Next.js API routes and server-side logic
- Database: PostgreSQL
- ORM: Prisma
- Cloud Platform: Google Cloud Platform (GCP)

## Features

- Paginated view of open tickets
- Instant display of new replies after submission
- Role-based access for agents and admins
- Ticket assignment and reassignment
- Clean API structure for authentication, tickets, and messaging

## Team Members

- Om Jagtap — Backend Web Development
- Aayushman Shukla — Middleware, Testing, Deployment
- Shruti Itkalkar — Frontend Web Development

## Contribution Guidelines

1. Fork the repository and create a new branch for your work.
2. Use clear branch names such as feature/your-feature, fix/bug-name, or docs/update-readme.
3. Make small, focused changes and keep commits descriptive.
4. Test your changes before pushing them.
5. Open a pull request with a short summary of what was changed.
6. Avoid pushing directly to the main branch.

## Git Workflow

- main: stable branch for production-ready code
- feature/*: new feature development
- fix/*: bug fixes and improvements
- docs/*: documentation updates

Example workflow:

```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "Add your feature"
git push origin feature/your-feature-name
```
