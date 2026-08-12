# Freshworks Ticket System - Project Overview

## 1. Project Objective
The objective of this project is to build an enterprise-grade customer support ticket management system (CSTMS). The platform is designed to facilitate robust role-based workflows, enabling support teams to efficiently manage the entire lifecycle of customer issues—from creation to resolution—while maintaining clear audit trails and secure access control.

## 2. Problem Statement
Support teams require a centralized, secure, and structured environment to track, prioritize, and resolve customer inquiries. Generic communication tools lack the necessary workflows, such as issue status tracking, agent assignment, internal team notes, and structured role separation. This project solves that by providing a dedicated ticketing platform with tailored interfaces for Admins, Agents, and Customers, ensuring that no customer issue falls through the cracks and support performance can be monitored.

## 3. Tech Stack
The application is built using a modern decoupled architecture:

### Backend
*   **Runtime & Framework:** Node.js, Express.js 5
*   **Language:** TypeScript
*   **Database & ORM:** PostgreSQL, Prisma ORM (`@prisma/client`, `@prisma/adapter-pg`)
*   **Caching & State:** Redis (via `ioredis`)
*   **Authentication & Security:** JWT (JSON Web Tokens), `bcrypt`, `helmet`, `cors`
*   **Storage & Utilities:** Cloudinary (attachments), `multer`, `winston` (logging), `zod` (validation)

### Frontend
*   **Framework:** Next.js 16 (App Router)
*   **Library:** React 19
*   **Styling & UI:** Tailwind CSS v4, shadcn/ui, Radix UI primitives, Framer Motion
*   **State & Data Fetching:** React Query (`@tanstack/react-query`), React Hook Form
*   **Icons:** Lucide React

## 4. Folder Structure Overview
The repository is split into distinct backend and frontend directories:

*   **`src/` (Backend):** Contains the core Node.js/Express application.
    *   `src/modules/`: Feature-based domains containing controllers, services, and routes (e.g., `auth`, `tickets`, `users`).
    *   `src/core/`: Application-wide infrastructure, such as custom middlewares (`errorHandler`, `correlationId`), `winston` logger setup, and `swagger` configurations.
    *   `src/app.ts` & `src/server.ts`: Express application setup and server initialization.
*   **`web/` (Frontend):** Contains the Next.js frontend application.
    *   `web/src/app/`: Next.js App Router structure containing the page layouts and route segments for distinct user dashboards.
    *   `web/src/components/`: Reusable UI components (primarily `shadcn/ui` implementations).
    *   `web/src/lib/`: Frontend utilities, API client instances, and helper functions.
    *   `web/middleware.ts`: Next.js edge middleware for frontend route protection based on authentication state.
*   **`prisma/`**: Contains `schema.prisma` mapping out the database models and `seed.ts` for populating initial development data.

## 5. Architecture Overview
The system follows a **Modular Monolith** architecture for the backend, decoupled from a **Next.js** frontend. 
*   The Next.js frontend proxies API requests (via `next.config.mjs`) to the Express backend running on `http://127.0.0.1:5001/api/v1/`.
*   The Express backend exposes RESTful API endpoints, validated via Zod schemas, and structured into self-contained modules.
*   The Prisma ORM abstracts the PostgreSQL database, managing relationships between Users, Tickets, Replies, and Activities.
*   Authentication is stateless but secure, utilizing short-lived JWT access tokens and long-lived refresh tokens stored securely in the `Session` model.

## 6. Major Modules
The backend business logic is divided into the following key modules:

*   **Auth Module (`src/modules/auth/`)**: Handles user registration, login, token generation, and token refreshing.
*   **Users Module (`src/modules/users/`)**: Manages profile data and role assignments.
*   **Tickets Module (`src/modules/tickets/`)**: The core engine of the application. It manages the CRUD operations for the `Ticket` model, handles status transitions (Open → In Progress → Resolved → Closed), links `TicketReply` records to specific tickets, and manages file `Attachment` logic.
*   **Notifications Module (`src/modules/notifications/`)**: Manages the `Notification` model to alert users of ticket updates, assignments, or new replies.
*   **Analytics Module (`src/modules/analytics/`)**: Aggregates data to provide Admins with insights (e.g., ticket volume, resolution times).

## 7. User Roles
Defined in the Prisma `Role` enum, the system enforces strict Role-Based Access Control (RBAC):

*   **Admin**: Has full system control. Admins can view all tickets, manage user roles (promoting customers to agents), and access system-wide analytics.
*   **Agent**: Support staff responsible for resolving issues. Agents can view tickets assigned to them, change ticket statuses, reply to customers, and add private `isInternal` notes to ticket threads.
*   **Customer**: The end-user. Customers can only view and interact with tickets they have created (`customerId`).

## 8. Major Features
*   **Comprehensive Ticket Lifecycle:** Tickets are created with a predefined Priority (Low, Medium, High, Urgent) and move through Statuses (Open, In Progress, Resolved, Closed).
*   **Threaded Conversations & Internal Notes:** Using the `TicketReply` model, customers and agents can converse. Agents have the ability to flag a reply as `isInternal`, keeping it hidden from the customer.
*   **Immutable Audit Trail:** Every major action—such as creation, reassignment, or status change—generates a `TicketActivity` record, ensuring complete transparency of a ticket's history.
*   **Secure Session Management:** The `Session` model in Prisma tracks refresh tokens, allowing users to stay logged in securely while permitting admins or the system to invalidate sessions if necessary.

## 9. Sprint-wise Development Summary
*   **Sprint 1 - Foundation & Auth**: Configured the monorepo structure, set up PostgreSQL and Prisma, and implemented JWT-based authentication alongside the `User` and `Session` models.
*   **Sprint 2 - Core Ticketing Engine**: Developed the `Ticket` model and implemented the REST APIs and frontend views for creating, reading, and updating basic tickets.
*   **Sprint 3 - Role-Based Workflows**: Introduced the Admin, Agent, and Customer roles. Created tailored Next.js dashboards and implemented backend middleware to restrict endpoint access based on user roles.
*   **Sprint 4 - Interactions & Audit Trails**: Implemented the `TicketReply` and `TicketActivity` models. Added support for threaded messaging, internal notes, and activity timeline rendering on the frontend.
*   **Sprint 5 - Attachments & Analytics**: Integrated Cloudinary for file uploads (`Attachment` model) and built out the Analytics module to provide administrative insights.
*   **Sprint 6 (Phase 7) - Polish & Finalization**: Focused on production readiness. Implemented comprehensive testing, optimized performance, cleaned up codebase warnings (e.g., legacy Next.js link behaviors), enhanced UI accessibility with ARIA labels, and finalized extensive documentation.

## 10. Final Project Capabilities
In its final state, the Freshworks Ticket System is a complete, production-ready support portal. It enables:
*   **Customers** to easily submit issues, track their progress, and communicate with support staff through a clean, modern UI.
*   **Agents** to efficiently manage their workload, collaborate privately via internal notes, and move issues to resolution with full context provided by the activity timeline.
*   **Admins** to oversee the entire operation, manage personnel, and gauge system performance through analytical data. 
The system is built on a scalable foundation (Express + Prisma + Next.js), making it highly extensible for future feature additions such as real-time WebSockets or AI-driven ticket categorization.
