# Conversation System Documentation (Replies & Chat)

The Ticket Conversation System is the core communication interface between Customers and Support Agents. It is built to feel like a modern, real-time chat application, utilizing advanced React Query patterns to ensure immediate visual feedback (optimistic updates) while securely synchronizing with the PostgreSQL backend.

This document covers the end-to-end request lifecycle and implementation details of the reply system.

---

## 1. Frontend Implementation

### The UI Components
The conversation UI is rendered primarily within `web/src/app/(dashboard)/dashboard/tickets/[id]/page.tsx` and leverages a few sub-components:

- **Message Bubbles (`TicketReplyDTO`)**: Each reply is rendered as a distinct chat bubble.
  - **Alignment**: Customer messages are aligned to the left; Agent/Admin messages are aligned to the right.
  - **Internal Notes**: If a message has `isInternal === true`, it is styled with a distinct yellow/warning background to clearly indicate to the Agent that this note is private.
- **`ReplyBox` Component**: A rich input area at the bottom of the conversation thread. It supports:
  - Standard text input.
  - A toggle switch for "Internal Note" (only visible to `AGENT` or `ADMIN` roles).
  - File attachment support.
  - Disables input and shows a loading state while `isSending` is true.

### Optimistic Updates & React Query Cache
To make the application feel instantly responsive, the frontend implements an **Optimistic Update** pattern using `@tanstack/react-query`. When a user submits a reply, the UI updates *before* the server responds.

**The Lifecycle (`replyMutation` in `page.tsx`):**
1. **`onMutate`**: 
   - `queryClient.cancelQueries()` is called to prevent background refetches from overwriting our optimistic data.
   - A snapshot of the current cache (`previousReplies`) is taken.
   - A fake `optimisticReply` object is created using a temporary ID (`temp_${Date.now()}`), the current user's details, and the input message.
   - The React Query cache (`['replies', ticketId]`) is immediately updated with this fake reply, causing the UI to instantly render the new message bubble.
2. **Backend Request**: The actual `POST /api/tickets/:id/replies` network request is fired.
3. **`onError` (Rollback Logic)**: If the backend throws an error (e.g., network failure, 500 error), the `onError` callback fires and reverts the cache back to the `previousReplies` snapshot. The temporary message disappears, and the user can try again.
4. **`onSettled`**: Regardless of success or failure, `queryClient.invalidateQueries()` is called. This forces React Query to fetch the ground-truth data from the server, replacing the temporary ID with the real PostgreSQL UUID and ensuring absolute data consistency.

---

## 2. Backend Implementation

### Request Lifecycle
When the frontend's `api.tickets.reply()` method fires, the request flows through the backend:

1. **Route (`POST /:id/replies`)**: Captured in `tickets.routes.ts`.
2. **Middlewares**: 
   - `requireAuth`: Ensures the user is logged in.
   - `uploadMiddleware`: Multer parses `multipart/form-data` to extract the `message`, `isInternal` flag, and any attached file (`req.file`).
   - `validateRequest`: Ensures the payload matches `replyTicketSchema` (Zod).
3. **Controller (`TicketsController.replyToTicket`)**: Extracts parameters and passes them to the Service layer.
4. **Service (`TicketsService.replyToTicket`)**: The core business logic executes.

### Business Logic & Authorization
The Service layer strictly enforces communication rules:

- **Closed Ticket Check**: The system checks if the ticket status is `CLOSED`. If so, it throws a `ConflictError` ("Cannot reply to a closed ticket").
- **Authorization**: `authorizeTicketAccess` ensures:
  - Customers can only reply to their own tickets.
  - Agents can reply to assigned or unassigned tickets (taking ownership).
- **File Uploads**: If a file was attached, the service calls `CloudinaryService.uploadFile()`, retrieving a secure URL.

### Database Writes & Activity Logging
If validations pass, the Repository layer executes a transaction-like sequence:

1. **Create Reply**: A new `TicketReply` record is inserted into PostgreSQL via Prisma.
2. **Create Attachment**: If a file exists, an `Attachment` record is created and linked to the `TicketReply`.
3. **Update Ticket Timestamp**: The parent `Ticket` record's `updatedAt` field is bumped to ensure it bubbles to the top of sorting lists.
4. **Activity Log**: An immutable `TicketActivity` record (`ActivityType.REPLIED`) is generated, tracking *who* replied.

---

## 3. Internal Notes & Security Considerations

### Internal Notes (`isInternal`)
Internal notes allow Agents and Admins to discuss a ticket without the Customer seeing the conversation.

- **Frontend Security**: The toggle to create an internal note is entirely hidden from the UI if `userRole === 'CUSTOMER'`.
- **Backend Enforcement**: When `TicketsService.getReplies()` is called, it checks the requester's role. If the requester is a `CUSTOMER`, Prisma is explicitly instructed to filter out internal notes:
  ```typescript
  // In PrismaTicketReplyRepository.ts or Service
  const where: any = { ticketId };
  if (user.role === Role.CUSTOMER) {
      where.isInternal = false; // Hard filter at the database level
  }
  ```
This guarantees that even if a malicious user manipulates the frontend client, the backend will never transmit internal notes over the network to a customer account.

### Attachment Security
Files uploaded to a reply are stored securely on Cloudinary. The URLs are not exposed directly in the API payload. Instead, the frontend must hit `GET /:id/attachments/:attachmentId`. This endpoint runs the exact same `authorizeTicketAccess` checks before issuing a 302 Redirect to the actual file, ensuring only authorized participants can download the attachments.
