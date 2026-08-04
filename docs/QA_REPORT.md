# Day 15 QA & Testing Report

This document outlines the testing strategy, static reviews, and manual verification steps required to certify the CSTMS platform as production-ready.

## 1. Static Accessibility (a11y) Review
I conducted a static review of the React components to ensure compliance with WCAG standards.

- **ARIA Labels:** Added explicit `aria-label` tags to icon-only navigation elements (e.g., the Back button in the Ticket details view and the Search Input on the dashboard).
- **Keyboard Navigation:** Verified that the complex `ReplyBox` supports keyboard shortcuts (Ctrl/Cmd + Enter) and that focus states are properly managed. Dropdowns and Modals are built using Radix UI primitives, ensuring native keyboard accessibility (Tab, Enter, Escape).
- **Color Contrast:** The application uses the Tailwind CSS `muted-foreground` and `primary` variables which have been reviewed to ensure adequate contrast ratios against their respective backgrounds in both light and dark themes.

## 2. API Edge Case Matrix
The generated Postman collection (`docs/CSTMS_Postman_Collection.json`) should be used to manually verify the following edge cases:

| Module | Endpoint | Edge Case Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST /register-admin` | Duplicate Email | `409 Conflict` (Handled by global Prisma interceptor) |
| **Auth** | `POST /login` | Invalid Password | `401 Unauthorized` |
| **Auth** | `POST /refresh-token` | Expired Token | `401 Unauthorized` |
| **Tickets** | `POST /tickets` | Missing Subject | `400 Bad Request` (Handled by Zod validator) |
| **Tickets** | `PATCH /tickets/:id/assign`| Agent assigning to themselves | `200 OK` |
| **Tickets** | `PATCH /tickets/:id/status`| Customer trying to change status | `403 Forbidden` (RBAC interceptor) |

## 3. Browser & Responsive Testing Checklist
Because automated browser suites (like Playwright) are not configured for this project, please perform manual testing across your target browsers (Chrome, Safari, Firefox).

- [ ] **Mobile Dashboard View:** Ensure the `TicketsPage` filters collapse correctly and the table converts to stacked cards or scrolls horizontally.
- [ ] **Mobile Ticket Detail View:** Verify the split-pane layout stacks vertically (Customer Info on top, Conversation below).
- [ ] **Optimistic UI:** Test the chat reply box. When offline or facing high latency, the message should appear immediately as "Sending..." before confirming.
- [ ] **Form Validation:** Submit an empty ticket form and ensure the Zod validation errors display correctly beneath the input fields.

## 4. Known Bugs / Discovered Issues
*None detected during static analysis.* The error handling refactor from Day 13 robustly catches Zod and Prisma exceptions.
