# Ticket System for Freshworks

## Backend Folder Structure

```text
app/
└── api/
    ├── auth/
    ├── tickets/
    ├── users/
    ├── messages/
    └── admin/

lib/
├── prisma.ts
├── auth.ts
├── db.ts
└── utils.ts

prisma/
├── schema.prisma
├── migrations/
└── seed.ts

services/
├── auth.service.ts
├── ticket.service.ts
├── user.service.ts
├── message.service.ts
└── admin.service.ts

repositories/
├── ticket.repository.ts
├── user.repository.ts
└── message.repository.ts

validators/
├── auth.validator.ts
├── ticket.validator.ts
└── user.validator.ts

middleware/
├── auth.middleware.ts
├── role.middleware.ts
└── error.middleware.ts

constants/
├── roles.ts
├── status.ts
└── permissions.ts

config/
├── env.ts
└── database.ts

logs/

scripts/
```
