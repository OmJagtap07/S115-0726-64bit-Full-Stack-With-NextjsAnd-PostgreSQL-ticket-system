# VIVA PREPARATION GUIDE
**Project:** Customer Support Ticket Management System (CSTMS)

## A. Project Explanation

### 30-Second Explanation
"I built a Customer Support Ticket Management System (CSTMS) designed to handle support queries efficiently. It uses a Next.js frontend and an Express/Node.js backend, backed by PostgreSQL and Prisma. The system implements strict Role-Based Access Control allowing Customers to raise tickets, Agents to resolve them, and Admins to manage workloads and view analytics. It features optimistic UI updates and secure JWT authentication."

### 1-Minute Explanation
"This project is an enterprise-grade ticketing system following a Backend-for-Frontend (BFF) architecture. The frontend is built with Next.js App Router, Tailwind CSS, and React Query for optimistic data fetching. The backend is an Express API written in TypeScript, using Prisma ORM to interact with a PostgreSQL database. The core feature is the ticket lifecycle: a customer creates a ticket, an Admin assigns it, and an Agent moves it from 'In Progress' to 'Resolved'. We also support internal threaded replies and Cloudinary file attachments. Security is handled via Bcrypt for passwords, JWTs for session management, and role-based middleware guarding all API endpoints."

### 3-Minute Explanation
"CSTMS is a comprehensive support platform addressing the need for structured customer service workflows. 

**Architecture:** It separates concerns into a Next.js frontend (client and SSR) and a standalone Express Node.js API. 
**Database:** We use PostgreSQL, modeled via Prisma. The schema includes Users, Sessions, Tickets, TicketReplies, and TicketActivities. The Activity table acts as an audit log, strictly recording every state change or assignment. 
**Backend:** The API is structured cleanly into routes, controllers, and services. For example, `TicketsService` enforces business rules, like preventing a Customer from marking a ticket 'In Progress', or preventing an Agent from closing a ticket prematurely.
**Security & Auth:** We implemented our own JWT authentication system. Login provides a short-lived access token and a long-lived refresh token stored in the database. Redis is used for rate limiting brute-force login attempts.
**Frontend:** We used React Hook Form and Zod for validation, ensuring data integrity before it even hits the backend. TanStack React Query handles our remote state, allowing us to implement optimistic UI—when an agent replies, it instantly appears on the screen while syncing in the background.
**Key Challenge:** A major technical challenge was handling file uploads and attachments securely, which we solved by integrating Cloudinary via Multer middleware, storing the file metadata in Postgres while offloading the binary data."

---

## B. Likely AI Viva Questions

### Product
1. **Why did you build this?**
   - *Answer:* To solve the problem of unstructured customer inquiries by providing a centralized, role-based platform for tracking and resolving issues.
2. **What problem does it solve?**
   - *Answer:* It prevents lost customer requests and provides accountability by logging all ticket activities and enforcing strict status workflows.
3. **Who are the users?**
   - *Answer:* Customers (who raise issues), Agents (who solve them), and Admins (who manage the system and monitor analytics).
4. **What are the core features?**
   - *Answer:* RBAC authentication, Ticket CRUD, Status lifecycle management, Threaded replies (with internal notes), and Admin analytics.

### Architecture
5. **Why this architecture?**
   - *Answer:* The BFF (Backend-for-Frontend) pattern separates the frontend presentation (Next.js) from the business logic (Express), allowing the backend to scale independently and serve other clients (like a future mobile app) if needed.
6. **Why this technology stack?**
   - *Answer:* Next.js provides excellent routing and SEO; Express is lightweight and highly customizable; Prisma ensures type safety with Postgres, preventing runtime SQL errors.
7. **Why this database?**
   - *Answer:* PostgreSQL is a robust relational database perfectly suited for structured, related data like Users, Tickets, and Replies.
8. **How does data flow through the system?**
   - *Answer:* UI -> React Query -> Express Route -> Zod Middleware -> Controller -> Service -> Prisma ORM -> PostgreSQL -> Response back up the chain.
9. **What happens when a request is made?**
   - *Answer:* It hits Express, passes through Helmet/Cors, goes to the Route, hits Auth/Role Middleware, Zod Validation, then the Controller delegates to the Service.

### Backend
10. **Explain the API architecture.**
    - *Answer:* RESTful design versioned at `/api/v1/`, organized by feature modules (auth, users, tickets, analytics). [Evidence: `src/app.ts`]
11. **Explain middleware.**
    - *Answer:* Middlewares like `requireAuth` intercept requests to verify JWTs, and `validateRequest` parses bodies against Zod schemas before hitting controllers.
12. **Explain authentication.**
    - *Answer:* Handled via custom JWT implementation. `/login` verifies bcrypt hashes and returns Access/Refresh tokens.
13. **Explain authorization.**
    - *Answer:* `requireRole` middleware checks the `role` property in the decoded JWT payload against allowed roles (e.g., ADMIN, AGENT). [Evidence: `src/core/middlewares/requireAuth.ts`]
14. **Explain error handling.**
    - *Answer:* A centralized `errorHandler.ts` middleware catches exceptions passed via `next(error)` and formats them into standardized JSON responses with appropriate HTTP status codes.

### Database
15. **Explain the schema.**
    - *Answer:* The core is the `Ticket` model, relating to a Customer (`User`) and Assignee (`User`). It has one-to-many relationships with `TicketReply` and `TicketActivity`. [Evidence: `prisma/schema.prisma`]
16. **Why these relationships?**
    - *Answer:* A ticket must belong to one customer, but can have many replies and activities. Relational mapping ensures referential integrity (e.g., deleting a ticket cascades to its replies).
17. **What are primary/foreign keys?**
    - *Answer:* Primary keys uniquely identify a row (e.g., `Ticket.id`). Foreign keys link tables (e.g., `Ticket.customerId` points to `User.id`).
18. **How is data validated?**
    - *Answer:* Twice. Once at the API boundary via Zod schemas, and again at the database level via Prisma schema constraints (e.g., Enums, unique constraints).
19. **How would you optimize queries?**
    - *Answer:* By ensuring indexes exist on frequently queried foreign keys like `customerId` and `assigneeId`, which are already implemented in `schema.prisma`.

### Frontend
20. **Explain component structure.**
    - *Answer:* Divided into layout components (Sidebar), UI components (reusable Shadcn elements), and feature components (TicketCard, MessageBubble).
21. **How is state managed?**
    - *Answer:* Server state is managed by TanStack React Query, while local form state is handled by React Hook Form.
22. **How does frontend communicate with backend?**
    - *Answer:* Using Axios or Fetch to call the `/api/v1/` endpoints, passing the JWT in the Authorization header.
23. **How is form validation handled?**
    - *Answer:* Using `react-hook-form` coupled with `@hookform/resolvers/zod` to validate inputs synchronously against Zod schemas before submission.

### Security
24. **How is authentication implemented?**
    - *Answer:* Custom JWT strategy with short-lived access tokens and refresh tokens stored in the `Session` table. [Evidence: `src/modules/auth/auth.controller.ts`]
25. **Where are tokens stored?**
    - *Answer:* Access tokens are returned to the client and should be stored securely (preferably HTTP-only cookies, managed by Next.js).
26. **How are protected routes handled?**
    - *Answer:* Backend routes use `requireAuth` middleware. Frontend uses Next.js middleware to check for tokens before rendering protected dashboard pages.
27. **What vulnerabilities could exist?**
    - *Answer:* If tokens are stored in `localStorage`, the app is vulnerable to XSS. (Mitigation: HTTP-only cookies).
28. **How would you improve security?**
    - *Answer:* Implement CSRF protection and strictly enforce HTTP-only cookies for token storage.

### Scalability
29. **What happens if users increase 100x?**
    - *Answer:* The Node.js backend can be horizontally scaled, and Postgres connections can be pooled using PgBouncer.
30. **What is the current bottleneck?**
    - *Answer:* File uploads (attachments) routing through the Node server block the event loop.
31. **How would you scale the system?**
    - *Answer:* Implement pre-signed URLs to upload attachments directly from the client browser to Cloudinary/S3, bypassing the Node backend.

### Code-level
32. **Why is this function written this way?** (e.g., `updateStatus` in `TicketsService`)
    - *Answer:* It explicitly checks `user.role` to ensure a Customer cannot arbitrarily set a ticket to IN_PROGRESS. [Evidence: `src/modules/tickets/tickets.service.ts`]
33. **What happens if this API fails?**
    - *Answer:* The controller catches the error, passes it to the error handler, and returns a JSON error. React Query catches it on the frontend and displays a toast notification.
34. **What happens if invalid input is provided?**
    - *Answer:* The `validateRequest` middleware throws a Zod validation error, immediately rejecting the request with a 400 status before it reaches business logic.
35. **What happens if the database is unavailable?**
    - *Answer:* Prisma throws a connection error, caught by the global error handler, returning a 500 Internal Server Error.

### Critical-thinking questions
36. **What would you change if rebuilding the project?**
    - *Answer:* I would use Next.js Server Actions instead of a separate Express backend to unify the stack and simplify deployment.
37. **What is the weakest part of the architecture?**
    - *Answer:* The reliance on synchronous REST for real-time features like chat replies. WebSockets would be better.
38. **What technical debt exists?**
    - *Answer:* `Socket.io` is in the `package.json` but not actively powering real-time backend events; the frontend relies on React Query polling/optimistic UI instead.
39. **What assumptions did you make?**
    - *Answer:* We assumed a single-tenant system. If building for multiple companies (SaaS), we would need a `tenantId` on every table.
40. **What would you do differently in production?**
    - *Answer:* Set up automated CI/CD pipelines, enforce database backups, and deploy the backend to a scalable container service like AWS Fargate.

---

## C. POTENTIAL VIVA TRAPS
*Watch out for these false claims during the Viva. Do not claim these features exist just because they are common or hinted at.*

1. **TRAP:** Claiming the app uses WebSockets for real-time chat.
   - **Actual Implementation:** While `socket.io` is listed in `web/package.json`, there is no WebSocket server set up in the Express backend (`src/app.ts` only sets up Express). Real-time feel is achieved via optimistic UI and refetching.
   - **Correct Answer:** "We rely on optimistic UI updates via React Query rather than WebSockets to immediately reflect user actions."

2. **TRAP:** Claiming Next.js Server Actions handle database calls directly.
   - **Actual Implementation:** The project uses Next.js as a frontend, but strictly calls the separate Node.js/Express backend (`/api/v1/`) for all database operations. The BFF pattern is strictly enforced.
   - **Correct Answer:** "The Next.js app acts solely as the frontend, communicating with our Express API which handles all Prisma/Postgres interactions."

3. **TRAP:** Claiming the system automatically emails users on ticket updates.
   - **Actual Implementation:** There is no email service (like SendGrid or Nodemailer) configured or implemented in the codebase.
   - **Correct Answer:** "Email notifications are planned for future scope, but currently, updates are tracked via the in-app `TicketActivity` audit logs."

4. **TRAP:** Claiming the Notifications system is fully built.
   - **Actual Implementation:** Earlier project states had a `notifications` module, but the current backend `src/modules` directory only contains `analytics, auth, tickets, users`.
   - **Correct Answer:** "Notifications were scoped out of the current sprint. We track history via the Ticket Activities instead."

5. **TRAP:** Claiming Next.js version 16 is used.
   - **Actual Implementation:** `package.json` says `"next": "16.2.10"`. Next.js 16 does not exist natively yet (Next 15 is current). This is a mock environment versioning quirk.
   - **Correct Answer:** "The `package.json` specifies version 16.2.10, utilizing the App Router architecture and React 19."
