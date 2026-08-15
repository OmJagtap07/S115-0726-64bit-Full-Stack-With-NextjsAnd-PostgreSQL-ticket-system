# Attachment System Architectural Audit

---

## 1. Current Implementation

### Database Layer (Prisma)
- **Attachment Model**: Present in `prisma/schema.prisma` (`model Attachment`). It includes fields `id`, `ticketId`, `ticket`, `replyId`, `reply`, `filename`, `url`, `mimeType`, `size`, and `createdAt`.
- **Relations**: Properly connected to `Ticket` (`attachments Attachment[]`) and `TicketReply` (`attachments Attachment[]`) with `onDelete: Cascade` and indexed foreign keys (`ticketId`, `replyId`).

### Backend Core Layer
- **Repository Abstraction**: `IAttachmentRepository` interface is declared in `src/core/repositories/interfaces.ts` and implemented via `PrismaAttachmentRepository` in `src/infrastructure/repositories/PrismaRepositories.ts` (`create` method). `PrismaTicketRepository` includes `attachments` in query payloads.
- **Storage Abstraction**: `IStorageProvider` interface exists in `src/core/providers/IStorageProvider.ts` with `uploadFile` and `deleteFile` signatures, but has **no concrete implementation** anywhere in the codebase.

### Frontend Layer
- **Ticket Creation (`web/src/app/(dashboard)/dashboard/tickets/new/page.tsx`)**: Displays a visual drag-and-drop container (`<UploadCloud />`), but lacks a file input element, file state management, or upload handler.
- **Reply Component (`web/src/components/tickets/ReplyBox.tsx`)**: Renders an unclickable `<Paperclip />` button with no file selection input or upload trigger.
- **Message Component (`web/src/components/tickets/MessageBubble.tsx`)**: Only renders string message content; no UI for rendering attachments, image previews, or download links.
- **API Client (`web/src/lib/api.ts`)**: `TicketDTO` and `TicketReplyDTO` interfaces omit attachment fields, and no file upload methods are exposed.

### Dependencies
- Only `@types/multer` is listed in root `devDependencies`. No runtime upload middleware (`multer`, `formidable`, etc.) is installed in dependencies.

---

## 2. Missing Features

1. **Upload API Endpoints**: No HTTP handlers (`POST /api/tickets/:id/attachments` or `POST /api/upload`) exist to parse `multipart/form-data`.
2. **Concrete Storage Provider**: Missing an implementation of `IStorageProvider` (e.g. `LocalStorageProvider` for disk storage or `S3StorageProvider` for cloud storage).
3. **Secure Download / File Serving Route**: Missing file serving endpoint (e.g. `GET /api/attachments/:id`) to stream or deliver uploaded files securely.
4. **Frontend File Picker & State**:
   - Integrated `<input type="file" />` triggers in `ReplyBox.tsx` and ticket creation form.
   - Selected file lists with removal controls before sending.
   - Upload progress and loading feedback indicators.
5. **Attachment Display & Downloads**: Rendered attachment chips/previews inside `MessageBubble.tsx` and ticket detail views.
6. **Attachment Deletion**: API endpoints and UI triggers to delete uploaded files.
7. **Typed API Serialization**: `AttachmentDTO` definitions and backend response mappers.

---

## 3. Security Concerns

1. **Unrestricted File Execution Risk**: Uploading files into publicly served web roots (e.g., Next.js `public/` directory) without disabling script execution allows Stored XSS or Remote Code Execution (RCE) via uploaded `.html`, `.svg`, or executable scripts.
2. **Missing Access Control (IDOR)**: Direct static URLs permit unauthorized users to download private ticket files without verifying ticket assignment or ownership.
3. **Spoofed Extension / Content-Type Vulnerability**: Absence of server-side MIME type and magic byte (file signature) validation allows malicious files to masquerade as images or PDFs.
4. **Uncapped File Uploads (Denial of Service)**: Lack of request body limits, Multer file size limits, or upload rate limiters enables attackers to exhaust server disk space and memory.
5. **Path Traversal & Unsanitized Filenames**: Storing files under user-provided original filenames can lead to directory traversal attacks (`../../`) or filesystem conflicts if not sanitized and assigned secure UUID filenames on disk.

---

## 4. Recommended Implementation Order

1. **Dependency & Storage Abstraction Setup**:
   - Install runtime upload library (`multer`).
   - Implement `LocalStorageProvider` (or cloud provider) fulfilling `IStorageProvider`.
2. **Backend API Routes & Authorization**:
   - Implement `POST /api/tickets/:id/attachments` with Multer file size limits, MIME type/extension whitelist validation, and secure UUID renaming.
   - Implement `GET /api/attachments/:id` enforcing role-based ticket access checks prior to streaming files.
3. **Service & Repository Wiring**:
   - Wire attachment creation into ticket creation and ticket reply service methods.
4. **Frontend API & DTO Updates**:
   - Add `AttachmentDTO` and `uploadAttachment` helper functions to `web/src/lib/api.ts`.
5. **Frontend UI Components**:
   - Connect file inputs and attachment state to `ReplyBox.tsx` and `new/page.tsx`.
   - Render attachment chips and download triggers inside `MessageBubble.tsx`.
6. **Verification & Audit**:
   - Validate file size caps, invalid file type rejections, and cross-role download authorization (Customer vs Agent vs Admin).

---

## 5. Answers to Verification Questions

| # | Question | Status | Details |
|---|---|---|---|
| **1** | Does the Prisma schema contain an `Attachment` model? | **Yes** | Defined in `prisma/schema.prisma` with fields: `id`, `ticketId`, `replyId`, `filename`, `url`, `mimeType`, `size`, `createdAt`. |
| **2** | Is it connected to `TicketReply`? | **Yes** | Connected via `replyId` foreign key, `reply TicketReply? @relation(...)`, and `TicketReply.attachments Attachment[]`. |
| **3** | Are upload APIs implemented? | **No** | No upload routes exist in Express (`src/`) or Next.js route handlers (`web/src/app/api`). |
| **4** | Can files currently be uploaded? | **No** | Backend handlers, storage implementation, and frontend file selection handlers are all missing. |
| **5** | Can files be downloaded? | **No** | No file download endpoints, signed URL generators, or download buttons exist. |
| **6** | Are permissions enforced? | **No** | Attachment access control is non-existent as the feature is un-implemented. |
| **7** | Are file types validated? | **No** | No extension or MIME type validation exists on backend or frontend. |
| **8** | Are file size limits enforced? | **No** | No upload size limits are configured or enforced. |
| **9** | Where should uploaded files be stored? | **Disk / Cloud** | Dedicated `uploads/` directory on disk for local dev, or S3/Cloud Storage for production, abstracted via `IStorageProvider`. |
| **10** | Is an upload library already installed? | **No** | `multer` is not installed in runtime `dependencies` (only `@types/multer` exists in `devDependencies`). |
