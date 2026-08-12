# Ticket Module Documentation

The Ticket Module is the core functional area of the Freshworks Ticket System backend. It manages the complete lifecycle of customer support tickets, including creation, assignment, status updates, replies, activity logging, and file attachments. 

This document provides a comprehensive technical overview of the module's architecture, data flow, and components.

---

## 1. Request Flow
When a client interacts with the Ticket Module, the request follows a strict layered architecture:

1. **Route (`src/modules/tickets/tickets.routes.ts`)**: Captures the incoming HTTP request.
2. **Middlewares**: 
   - `requireAuth`: Verifies the JWT session.
   - `requireRole`: Enforces Role-Based Access Control (RBAC) if the endpoint requires specific permissions.
   - `validateRequest`: Validates the request body against a Zod schema (DTO).
   - `uploadMiddleware`: Processes multipart/form-data for file attachments via Multer.
3. **Controller (`src/modules/tickets/tickets.controller.ts`)**: Extracts parameters, query strings, and validated body data from the request. It then passes these to the Service layer and formats the response.
4. **Service (`src/modules/tickets/tickets.service.ts`)**: Contains all business logic. It handles authorization checks (`authorizeTicketAccess`), state transition rules, calls repositories to interact with the database, and orchestrates secondary actions like uploading files to Cloudinary or logging activities.
5. **Repository (`src/infrastructure/repositories/PrismaRepositories.ts`)**: Executes Prisma ORM queries to fetch, create, or modify records in PostgreSQL. Returns raw domain objects back up the chain.

---

## 2. Routes (`src/modules/tickets/tickets.routes.ts`)
The routes file maps HTTP endpoints to Controller methods and applies necessary middlewares.

**Endpoints:**
- `POST /` - Create a new ticket (Customers only).
- `GET /` - Retrieve a paginated, filtered, and sorted list of tickets.
- `GET /summary` - Retrieve analytics summary for tickets.
- `GET /:id` - Retrieve a specific ticket by ID.
- `DELETE /:id` - Soft delete a ticket (Admins only).
- `PATCH /:id/status` - Update ticket status (Admins/Agents).
- `PATCH /:id/assign` - Assign ticket to an agent (Admins only).
- `PATCH /:id/priority` - Update ticket priority (Admins/Agents).
- `GET /:id/replies` - Get conversation history for a ticket.
- `POST /:id/replies` - Reply to a ticket (optional file attachment).
- `GET /:id/attachments/:attachmentId` - Securely download an attachment.

---

## 3. Data Transfer Objects (DTOs) (`src/modules/tickets/tickets.dto.ts`)
DTOs are implemented using `zod` schemas to ensure strict runtime type validation before a request reaches the controller.

- `createTicketSchema`: Requires `subject` (string), `description` (string), and `priority` (Enum: LOW, MEDIUM, HIGH, URGENT).
- `updateStatusSchema`: Requires `status` (Enum: OPEN, IN_PROGRESS, RESOLVED, CLOSED).
- `assignTicketSchema`: Requires `assigneeId` (UUID string).
- `updatePrioritySchema`: Requires `priority` (Enum).
- `replyTicketSchema`: Requires `message` (string) and optional `isInternal` (boolean, defaults to false).

---

## 4. Controllers (`src/modules/tickets/tickets.controller.ts`)
The Controller layer is purely responsible for HTTP request/response handling.

**Methods:**
- `createTicket()`: Ensures only CUSTOMER roles can create tickets. Calls service and returns `201 Created`.
- `getTickets()`: Parses query parameters for pagination, sorting, filtering, and searching. Constructs a Prisma `where` clause object and passes it to the Service.
- `getTicketById()`: Fetches a single ticket and returns it.
- `updateStatus()`, `assignTicket()`, `updatePriority()`: Extracts the ticket ID and DTO payload, passes them to the Service, and returns the updated ticket.
- `getReplies()`, `replyToTicket()`: Manages the conversation sub-resource. `replyToTicket` handles checking for `req.file` provided by the Multer middleware.
- `deleteTicket()`: Triggers a soft delete via the Service.
- `downloadAttachment()`: Uses the Service to retrieve a secure Cloudinary URL and redirects the client, ensuring the user has access to the ticket first.
- `getSummary()`: Aggregates counts for dashboards (Total, Open, Closed, etc.).

---

## 5. Services (`src/modules/tickets/tickets.service.ts`)
The Service layer enforces business rules and authorization.

**Key Helpers:**
- `authorizeTicketAccess(user, ticket)`: Ensures Customers only see their own tickets, Agents see tickets assigned to them (or open tickets), and Admins see everything. Throws `ForbiddenError` if access is denied.
- `validateStatusTransition(current, new, user, assigneeId)`: Prevents invalid workflow jumps (e.g., Agents can only move `ASSIGNED` -> `IN_PROGRESS` -> `RESOLVED`. Customers can only close a resolved ticket).

**Core Methods (CRUD & Logic):**
- `createTicket()`: Generates a random `TKT-XXXX` number, creates the ticket in DB, and creates an `ActivityType.CREATED` log.
- `getTickets()`: A pass-through to the Repository for list fetching.
- `getTicketById()`: Fetches ticket and enforces `authorizeTicketAccess`.
- `updateStatus()`: Enforces transitions. If status is set to `CLOSED`, populates the `closedAt` timestamp. Logs a `STATUS_CHANGED`, `CLOSED`, or `REOPENED` activity.
- `assignTicket()`: Validates that the target user is an active AGENT. Updates the assignee and logs an `ASSIGNED` or `REASSIGNED` activity.
- `updatePriority()`: Updates priority and logs a `STATUS_CHANGED` activity.
- `getReplies()`: Enforces access. If user is a Customer, it filters out replies where `isInternal === true` so they cannot see internal staff notes.
- `replyToTicket()`: Checks if the ticket is closed (prevents replies). Creates the reply. If `req.file` exists, uploads it via `CloudinaryService` and creates an `Attachment` record. Logs a `REPLIED` activity.
- `softDeleteTicket()`: Verifies admin access and triggers soft deletion in the repository.

---

## 6. Repositories (`src/infrastructure/repositories/PrismaRepositories.ts`)
The system implements the Repository Pattern via interfaces defined in `src/core/repositories/interfaces.ts`. 

- **`PrismaTicketRepository`**:
  - `findAll()`: Executes `prisma.ticket.findMany()` and `prisma.ticket.count()` concurrently using `Promise.all()`. Supports dynamic `where` clauses, `skip`/`take` for pagination, and `orderBy`.
  - `findById()`: Fetches a ticket and deeply includes relations (`customer`, `assignee`, `replies` with their `attachments`, and `activities`).
  - `softDelete()`: Updates `deletedAt` to `new Date()` rather than dropping the row.
- **`PrismaTicketReplyRepository`**: Manages the `TicketReply` table.
- **`PrismaTicketActivityRepository`**: Manages the `TicketActivity` table.
- **`PrismaAttachmentRepository`**: Manages file metadata records linking replies/tickets to Cloudinary URLs.

---

## 7. Advanced Features

### Pagination
Implemented in `TicketsController.getTickets`.
- Reads `req.query.page` and `req.query.limit`.
- Calculates `skip = (page - 1) * limit`.
- Passes `skip` and `limit` to the Repository, which returns the paginated array and total count. The Controller calculates `totalPages`.

### Filtering
Implemented in `TicketsController.getTickets`.
- **Status & Priority**: Direct equality matches (`filters.status = req.query.status`).
- **Assignee**: Supports `'unassigned'` (`null`), `'assigned'` (`not null`), or a specific UUID.
- **Date Range**: Uses Prisma's `gte` (greater than or equal) and `lte` (less than or equal) on `createdAt` if `startDate` or `endDate` are provided.

### Searching
Implemented in `TicketsController.getTickets`.
- Reads `req.query.search`.
- Constructs an `OR` array to search across multiple fields simultaneously: `ticketNumber`, `subject`, `description`, customer `name`, and customer `email`. Uses `mode: 'insensitive'` for case-insensitive PostgreSQL searches.

### Sorting
Implemented in `TicketsController.getTickets`.
- Validates `req.query.sortBy` against an allowed list (`['createdAt', 'updatedAt', 'priority', 'status', 'ticketNumber']`) to prevent SQL injection or bad queries.
- Sets sort direction based on `req.query.sortOrder`.
- Passed to Prisma as the `orderBy` parameter.

### Activity Logging
A core audit feature implemented within `TicketsService`. Every state-mutating action automatically creates a record in the `TicketActivity` table (via `PrismaTicketActivityRepository`).
- Tracks: `ticketId`, `actorId` (the user making the change), `type` (Enum: CREATED, ASSIGNED, STATUS_CHANGED, REPLIED, etc.), and a text `details` string.
- This creates an immutable history timeline visible on the frontend dashboard.
