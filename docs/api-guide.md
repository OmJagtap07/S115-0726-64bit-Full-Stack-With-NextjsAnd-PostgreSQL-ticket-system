# API Guide

The backend exposes a REST API via `/api/v1`. Full Swagger documentation is available at `/api-docs` when running the server.

## Core Endpoints

### Authentication
- `POST /api/v1/auth/login` - Authenticate and receive JWT.
- `POST /api/v1/auth/register` - Register as a new customer.
- `POST /api/v1/auth/refresh-token` - Refresh JWT session.

### Tickets
- `GET /api/v1/tickets` - List tickets (supports search, sort, and filters).
- `POST /api/v1/tickets` - Create a new ticket.
- `GET /api/v1/tickets/:id` - Fetch ticket details.
- `PATCH /api/v1/tickets/:id/status` - Update ticket status.
- `POST /api/v1/tickets/:id/replies` - Add a reply or internal note.

### Analytics (Admin Only)
- `GET /api/v1/analytics/overview` - Fetch KPIs.
- `GET /api/v1/analytics/trends` - Fetch volume trends.

### Notifications
- `GET /api/v1/notifications` - List notifications.
- `GET /api/v1/notifications/unread-count` - Get unread count.
