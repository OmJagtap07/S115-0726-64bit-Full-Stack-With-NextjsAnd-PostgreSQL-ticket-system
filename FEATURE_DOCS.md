# Feature Documentation

## Overview

This document provides detailed technical documentation for all features implemented across the Sprint 1 development cycle for the Freshworks Ticket Management System.

---

## Feature 1: Authentication System (Day 2)
**Branch:** `feature/auth-and-dashboard-ui`

### Description
Complete JWT-based authentication flow for the application.

### Components
| Component | Path | Description |
|---|---|---|
| Login Page | `src/app/(auth)/login/page.tsx` | Email/password login with form validation |
| Register Page | `src/app/(auth)/register/page.tsx` | New user registration with role selection |
| Middleware | `src/middleware.ts` | JWT verification and route protection |

### Technical Details
- **JWT tokens** stored in secure HTTP-only cookies via `jose` library.
- **Protected routes**: All `/dashboard/*` paths require a valid token.
- **Validation**: Zod schemas enforce password complexity and email format.
- **Loading & Error UI**: Form-level error messages and disabled-state loading indicators.
- **Logout**: Clears the `accessToken` cookie and redirects to `/login`.

---

## Feature 2: Ticket Dashboard (Day 3)
**Branch:** `feature/auth-and-dashboard-ui`

### Description
The primary dashboard view showing a card-based layout of all relevant tickets.

### Components
| Component | Path | Description |
|---|---|---|
| Dashboard Page | `src/app/(dashboard)/dashboard/tickets/page.tsx` | Main ticket listing view |
| Ticket Card | `src/components/tickets/TicketCard.tsx` | Individual ticket card with status, priority, and assignment |
| Dashboard Layout | `src/app/(dashboard)/layout.tsx` | Sidebar + Header shell |
| Loading Skeleton | `src/components/ui/states.tsx` | `LoadingState`, `EmptyState`, `ErrorState` components |

### Technical Details
- Cards show **ticket number, subject, status badge, priority badge, creation date, and assignee**.
- **Responsive grid**: 1 column on mobile, 2 on tablet, 3 on desktop.
- **Role-aware**: Customers see their own tickets; Agents see assigned tickets; Admins see all.

---

## Feature 3: Ticket Listing & Detail Pages (Day 4)
**Branch:** `feature/ticket-listing-pages`

### Description
Dedicated pages for browsing and reading individual tickets.

### Components
| Component | Path | Description |
|---|---|---|
| Ticket List | `src/app/(dashboard)/dashboard/tickets/page.tsx` | Paginated, filterable ticket list |
| Ticket Detail | `src/app/(dashboard)/dashboard/tickets/[id]/page.tsx` | Full conversation thread for a ticket |
| Not Found UI | `src/app/not-found.tsx` | 404 page for invalid ticket IDs |

### Technical Details
- Detail page fetches ticket metadata and replies in **parallel** using React Query.
- **Error state** shown if ticket ID does not exist or API fails.
- Conversation thread **auto-scrolls** to the latest message on load.

---

## Feature 4: Dashboard Integration (Day 5)
**Branch:** `feature/dashboard-integration`

### Description
Enhancements to the ticket dashboard including filtering, search, and pagination.

### Components
| Component | Path | Description |
|---|---|---|
| Search Bar | `src/app/(dashboard)/dashboard/tickets/page.tsx` | Live search by ticket number or subject |
| Status Filter | `src/app/(dashboard)/dashboard/tickets/page.tsx` | Dropdown to filter by ticket status |
| Pagination | `src/app/(dashboard)/dashboard/tickets/page.tsx` | Previous/Next navigation with loading indicator |

### Technical Details
- Search and filter are passed as **query parameters** to the API (`/api/tickets?search=...&status=...`).
- Pagination uses `skip`/`take` pattern on the backend.
- **Loading indicator** disables controls during refetch.

---

## Feature 5: Conversation UI (Day 5–6)
**Branch:** `feature/conversation-ui`

### Description
Real-time-feeling conversation thread with optimistic UI for instant message feedback.

### Components
| Component | Path | Description |
|---|---|---|
| Message Bubble | `src/components/tickets/MessageBubble.tsx` | Individual message with sender, timestamp, and status |
| Reply Box | `src/components/tickets/ReplyBox.tsx` | Text area + send button for composing replies |

### Technical Details
- **Optimistic UI**: On submit, the reply is added to the cache immediately with a `pending` status using React Query's `onMutate`.
- **Error state**: If the API call fails, the message is marked `failed` with a **Retry** button.
- **Pending indicator**: A spinner icon appears on pending messages.
- `onSuccess` replaces the optimistic entry with the server-confirmed reply.
- `onError` rolls back to the previous state and marks the message as failed.

---

## Feature 6: Role-Based UI (Day 6)
**Branch:** `feature/role-based-ui`

### Description
Role-based visibility of buttons and pages across the application.

### Components
| Component | Path | Description |
|---|---|---|
| Admin Pages | `src/app/(dashboard)/dashboard/agents/page.tsx` | Agent management view for Admins only |
| Unauthorized Page | `src/app/unauthorized/page.tsx` | Shown when a user accesses a forbidden route |
| Middleware | `src/middleware.ts` | Server-side role checks for `/admin/*` and `/agent/*` routes |

### Technical Details
- The "New Ticket" button is **hidden from Admins** as they manage, not create tickets.
- The `/dashboard/agents` route reads `x-user-role` from request headers set by middleware.
- Non-Admin users visiting the agents page are redirected to `/unauthorized`.

---

## Feature 7: Assignment Modal (Day 7)
**Branch:** `feature/assignment-modal`

### Description
UI for assigning tickets to agents with animations and confirmation.

### Components
| Component | Path | Description |
|---|---|---|
| Ticket Card Assignment | `src/components/tickets/TicketCard.tsx` | Inline agent selector with confirm/cancel controls |

### Technical Details
- Clicking **Assign** reveals an animated dropdown (`zoom-in-95` entrance).
- A `Select` dropdown lists all available agents fetched from the API.
- Confirming triggers a `PATCH` mutation and shows a toast on success.
- **Cancel** dismisses the assignment UI without changes.

---

## Feature 8: Polish — Toast, Error Pages, Empty States (Day 8)
**Branch:** `feature/polish-ui-and-errors`

### Description
Comprehensive UI polish pass covering error handling and user feedback.

### Components
| Component | Path | Description |
|---|---|---|
| Global Error Page | `src/app/error.tsx` | Next.js error boundary with retry and navigation |
| Global 404 Page | `src/app/not-found.tsx` | User-friendly 404 with dashboard link |
| Toast Notifications | `src/app/(dashboard)/dashboard/tickets/[id]/page.tsx` | In-page toast on status update success |
| Empty States | `src/components/ui/states.tsx` | Reusable `EmptyState` component with icon + CTA |

### Technical Details
- `error.tsx` uses `useEffect` to log errors to console.
- Toast uses `useState` + `setTimeout` for auto-dismiss after 3 seconds.
- Entrance animations use Tailwind's `animate-in`, `fade-in`, `slide-in-from-top-1`.

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Login and receive JWT cookie |
| `POST` | `/api/auth/register` | Public | Register a new user |
| `GET` | `/api/auth/me` | JWT | Get current user profile |
| `POST` | `/api/auth/logout` | JWT | Clear auth cookie |
| `GET` | `/api/tickets` | JWT | List tickets (role-filtered) |
| `POST` | `/api/tickets` | JWT | Create a new ticket |
| `GET` | `/api/tickets/:id` | JWT | Get a single ticket |
| `PATCH` | `/api/tickets/:id/status` | JWT | Update ticket status |
| `PATCH` | `/api/tickets/:id/assign` | ADMIN | Assign ticket to an agent |
| `GET` | `/api/tickets/:id/replies` | JWT | Get all replies for a ticket |
| `POST` | `/api/tickets/:id/replies` | JWT | Add a reply to a ticket |
| `GET` | `/api/users/agents` | ADMIN | List all agent users |
