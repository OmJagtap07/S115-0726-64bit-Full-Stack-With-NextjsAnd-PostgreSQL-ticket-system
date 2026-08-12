# Low-Level Design (LLD)
**Project:** Customer Support Ticket Management System (CSTMS)

## 1. Module Breakdown (Backend)

### 1.1 Auth Module (`src/modules/auth`)
- **Responsibility:** User registration, authentication, JWT issuing and refreshing.
- **Files Involved:** `auth.routes.ts`, `auth.controller.ts`, `auth.service.ts`, `auth.dto.ts`.
- **Dependencies:** `bcrypt`, `jsonwebtoken`, `PrismaUserRepository`, `PrismaSessionRepository`.

### 1.2 Users Module (`src/modules/users`)
- **Responsibility:** Managing user identities, assigning roles, and retrieving profile data.
- **Files Involved:** `users.routes.ts`, `users.controller.ts`, `users.service.ts`, `users.dto.ts`.
- **Dependencies:** `PrismaUserRepository`.

### 1.3 Tickets Module (`src/modules/tickets`)
- **Responsibility:** Core business logic for tickets: creation, assignment, lifecycle state machine, replies, audit logging, and file attachments.
- **Files Involved:** `tickets.routes.ts`, `tickets.controller.ts`, `tickets.service.ts`, `tickets.dto.ts`.
- **Dependencies:** `PrismaTicketRepository`, `PrismaTicketReplyRepository`, `PrismaTicketActivityRepository`, `CloudinaryService`.

### 1.4 Analytics Module (`src/modules/analytics`)
- **Responsibility:** Querying aggregated database metrics for Admin dashboards.
- **Files Involved:** `analytics.routes.ts`, `analytics.controller.ts`, `analytics.service.ts`.
- **Dependencies:** Raw Prisma queries and aggregate functions.

## 2. API-Level Design
| Endpoint | Method | Auth | Input (Body/Params) | Processing | Output |
| -------- | ------ | ---- | ------------------- | ---------- | ------ |
| `/api/v1/auth/login` | POST | None | `{ email, password }` | Validate via bcrypt, generate JWT | `{ accessToken, refreshToken, user }` |
| `/api/v1/tickets` | POST | CUSTOMER | `{ subject, description, priority }` | Validate DTO, insert Ticket, insert Activity | `201 Created` Ticket object |
| `/api/v1/tickets/:id/status` | PATCH | ADMIN/AGENT | `{ status }` | Validate transition rules, update DB, insert Activity | `200 OK` Ticket object |
| `/api/v1/tickets/:id/assign` | PATCH | ADMIN | `{ assigneeId }` | Update `assigneeId`, insert Activity | `200 OK` Ticket object |
| `/api/v1/tickets/:id/replies` | POST | ALL | `{ message, isInternal }`, `file` | Insert Reply, upload to Cloudinary if file present | `201 Created` Reply object |

## 3. Class / Component Design

### 3.1 `TicketsService` (Backend)
- **Responsibility:** Encapsulates all business rules regarding ticket manipulation.
- **Methods:**
  - `createTicket(customerId, data)`: Generates `ticketNumber`, saves ticket, logs `CREATED` activity.
  - `updateStatus(ticketId, user, data)`: Validates transition rules based on role (e.g. Customers can only close resolved tickets). Updates status, logs `STATUS_CHANGED` activity.
  - `assignTicket(ticketId, adminUser, data)`: Reassigns ticket, logs `ASSIGNED` activity.
  - `replyToTicket(...)`: Processes message, uploads optional attachment via `CloudinaryService`, saves `TicketReply`.

### 3.2 Frontend Components (`web/src/components/tickets`)
- **`TicketCard`**: Displays summary information in list views. Accepts `ticket` prop.
- **`MessageBubble`**: Renders individual replies in a thread. Applies different styling based on the `isInternal` flag.
- **`ReplyBox`**: Form component utilizing `react-hook-form`. Manages file selection state and submits FormData to the backend.

## 4. Database-Level Design (Prisma / PostgreSQL)

### 4.1 Table: `Ticket`
- `id` (String, UUID, PK)
- `ticketNumber` (String, Unique Index)
- `subject` (String)
- `description` (Text)
- `status` (Enum: OPEN, IN_PROGRESS, RESOLVED, CLOSED) - Index applied.
- `priority` (Enum: LOW, MEDIUM, HIGH, URGENT)
- `customerId` (String, FK to User) - Index applied.
- `assigneeId` (String, nullable, FK to User) - Index applied.
- `createdAt`, `updatedAt`, `closedAt`, `deletedAt` (DateTime)

### 4.2 Table: `TicketActivity`
- `id` (String, UUID, PK)
- `ticketId` (String, FK to Ticket)
- `actorId` (String, nullable, FK to User)
- `type` (Enum: CREATED, ASSIGNED, STATUS_CHANGED, etc.)
- `details` (Text, nullable)

## 5. Detailed Data Flow: Updating Ticket Status
1. **Frontend:** Agent clicks "Mark as Resolved". `React Query` triggers a `PATCH` request.
2. **Middleware:** `requireAuth` validates JWT. `requireRole` ensures user is AGENT or ADMIN.
3. **Middleware:** `validateRequest` ensures body contains valid `status` enum string using Zod schema.
4. **Controller:** `TicketsController.updateStatus` extracts `ticketId` and `status`, calls `TicketsService`.
5. **Service:** `TicketsService.updateStatus` fetches ticket, checks if state transition is legal for the Agent.
6. **Database:** Prisma executes `UPDATE Ticket SET status = 'RESOLVED'`. Prisma executes `INSERT INTO TicketActivity` logging the change.
7. **Controller:** Returns updated Ticket JSON.
8. **Frontend:** `React Query` updates local cache (optimistic UI), triggering component re-render.

## 6. Error Handling
- **Validation Errors:** Zod throws validation errors caught by the express error handler, returning `400 Bad Request` with field-level details.
- **Authentication Errors:** Missing/invalid JWT throws `UnauthorizedError` (401).
- **Authorization Errors:** Invalid role or accessing another user's ticket throws `ForbiddenError` (403).
- **Database Errors:** Handled gracefully. If an entity is not found, a `NotFoundError` (404) is thrown.

## 7. Edge Cases
- **Simultaneous Edits:** If two agents attempt to assign a ticket simultaneously, the last request overwrites the first. (No optimistic locking detected in the Prisma schema).
- **File Upload Limits:** Managed by Multer middleware before reaching the controller.
- **Invalid State Transitions:** Explicitly caught in `TicketsService.validateStatusTransition()`.

## 8. Complexity Analysis
- `AnalyticsService` queries (e.g., getting workload):
  - **Time Complexity:** O(N) where N is the number of tickets, heavily mitigated by Database indexing on `assigneeId` and `status`.
  - **Space Complexity:** O(M) where M is the number of distinct agents in the aggregation pipeline.

## 9. Design Patterns Used
- **Layered Architecture:** Routes -> Controllers -> Services.
- **Repository Pattern:** Prisma data access is abstracted behind Repository classes (`PrismaTicketRepository`, `PrismaUserRepository`), decoupling services from direct ORM calls.
- **Middleware Pattern:** Express middleware pipeline for auth, validation, and error trapping.
