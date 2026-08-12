# Product Requirements Document (PRD)
**Project:** Customer Support Ticket Management System (CSTMS)

## 1. Product Overview
- **Product Name:** Freshworks Ticket Management System (CSTMS)
- **Product Purpose:** To provide an enterprise-grade platform for customers to raise support requests and for agents to manage, track, and resolve them efficiently.
- **Problem Statement:** Organizations lack a unified, role-based platform to manage customer inquiries efficiently, leading to lost tickets, lack of accountability, and poor customer satisfaction.
- **Proposed Solution:** A full-stack web application featuring role-based access control (RBAC), real-time optimistic UI updates, conversation threading, and a robust ticket lifecycle management system.
- **Product Vision:** To become a seamless, highly responsive, and reliable ticketing system that empowers agents and delights customers.

## 2. Target Users
1. **Customer**
   - **Responsibilities:** Raising tickets, communicating with agents, and tracking issue resolution.
   - **Goals:** Get issues resolved quickly and transparently.
   - **Permissions:** Create tickets, view own tickets, reply to own tickets, close resolved tickets.
2. **Agent**
   - **Responsibilities:** Investigating and resolving assigned customer issues.
   - **Goals:** Efficiently process their assigned queue and communicate clearly with customers.
   - **Permissions:** View assigned tickets, change status (ASSIGNED -> IN_PROGRESS -> RESOLVED), reply to tickets (including internal notes).
3. **Admin**
   - **Responsibilities:** Overseeing the entire support operation and managing system users.
   - **Goals:** Ensure workload distribution, monitor metrics, and manage agent access.
   - **Permissions:** Manage users/agents, view all tickets, assign tickets to agents, access analytics dashboards, soft-delete tickets.

## 3. Objectives
- Ensure 100% data integrity for all ticket state transitions.
- Provide a highly responsive UI where interactions feel instantaneous.
- Secure all routes and data endpoints using robust Authentication and RBAC.

## 4. User Personas
- **"Frustrated Customer" (Jane):** Needs a simple interface to report a bug without navigating complex menus. 
- **"Efficient Agent" (John):** Needs a fast queue view and internal notes functionality to coordinate with technical teams.
- **"Data-Driven Admin" (Sarah):** Needs high-level analytics to spot bottlenecks and the ability to manually assign tickets to balance workloads.

## 5. User Stories
- As a **Customer**, I want to create a new support ticket so that my issue can be tracked.
- As a **Customer**, I want to see the status of my tickets so that I know when they are being worked on.
- As an **Agent**, I want to filter my dashboard to see only tickets assigned to me so I can focus on my workload.
- As an **Agent**, I want to add internal notes to a ticket so that I can document technical details without the customer seeing them.
- As an **Admin**, I want to view analytical dashboards so that I can track ticket volumes and agent workloads.
- As an **Admin**, I want to assign an open ticket to a specific agent so that the workload is properly distributed.

## 6. Functional Requirements
- **FR-01 (Authentication):** The system shall allow users to register and login using email/password, issuing a JWT.
- **FR-02 (Role Management):** The system shall assign all new users the CUSTOMER role by default. Admins can upgrade users to AGENT or ADMIN.
- **FR-03 (Ticket Creation):** Customers shall be able to create tickets with a subject, description, and priority level.
- **FR-04 (Ticket Lifecycle):** Tickets shall strictly follow the state transitions: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED.
- **FR-05 (Ticket Assignment):** Admins shall be able to assign tickets to agents.
- **FR-06 (Threading):** Users and Agents shall be able to add replies to a ticket. Agents shall be able to mark replies as internal.
- **FR-07 (Audit Logging):** The system shall automatically record an activity log whenever a ticket is created, assigned, or changes status.
- **FR-08 (Analytics):** The system shall provide Admins with aggregate data on ticket status, priority, and workload.

## 7. Non-Functional Requirements
- **Performance:** The UI should utilize optimistic updates to reflect status changes and new messages instantly.
- **Security:** Passwords must be hashed using bcrypt. All API routes (except auth) must require a valid JWT.
- **Reliability:** The system must gracefully handle failed API requests with global error boundaries.
- **Maintainability:** The backend must use a layered architecture separating routes, controllers, and services.

## 8. User Flows
**Ticket Creation & Resolution Flow:**
1. Customer -> Logs in -> Dashboard -> Clicks "New Ticket" -> Submits form.
2. System -> Creates Ticket -> Logs Activity -> Updates UI.
3. Admin -> Logs in -> Views all tickets -> Assigns ticket to Agent.
4. Agent -> Logs in -> Sees assigned ticket -> Changes status to IN_PROGRESS.
5. Agent -> Adds reply -> Changes status to RESOLVED.
6. Customer -> Views resolved ticket -> Changes status to CLOSED.

## 9. Feature Scope
- **Core Implemented Features:** RBAC authentication, ticket CRUD, replies, status lifecycle, assignment, audit logging (TicketActivity), admin analytics endpoints.
- **Secondary Implemented Features:** File attachments (via Cloudinary), soft deletion of tickets, internal agent notes.
- **Planned/Future Features:** Real-time push notifications (Socket.io is in package.json but not integrated into the backend architecture).

## 10. Constraints and Assumptions
- **Constraints:** Must use PostgreSQL and Prisma. Must follow the BFF pattern with Next.js and Express.
- **Assumptions:** Customers will only have access to their own tickets. Agents will only have access to tickets assigned to them unless reassigned by an Admin.

## 11. Acceptance Criteria
- **Feature: Ticket Assignment**
  - Given an Admin is logged in, when they select an OPEN ticket and choose an agent, the ticket's `assigneeId` is updated, an activity log is created, and the UI reflects the new assignee.
- **Feature: Internal Notes**
  - Given an Agent is logged in, when they submit a reply marked as "internal", the reply is saved to the database but is completely hidden when a Customer views the ticket thread.

## 12. Future Scope
- Webhook integrations for external CRM syncing.
- Service Level Agreement (SLA) timers and automated escalations.
- Email notifications upon ticket updates.
