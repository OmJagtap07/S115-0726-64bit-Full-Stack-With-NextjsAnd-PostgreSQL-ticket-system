# Environment Configuration

The CSTMS backend and frontend rely on environment variables for configuration. Below is a detailed explanation of every variable required.

## Backend `.env`

Create a `.env` file in the root directory:

```env
# The port the backend server will run on (Default: 5001)
PORT=5001

# The Node environment (development, test, or production)
NODE_ENV=development

# Database Connection URL (Prisma Postgres connection string)
DATABASE_URL="postgresql://cstms_user:cstms_password@localhost:5432/cstms_db"

# Redis Connection URL (for caching and rate limiting)
REDIS_URL="redis://localhost:6379"

# JWT Secrets for Authentication (Generate using `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your_refresh_secret"
JWT_REFRESH_EXPIRES_IN="7d"
```

## Frontend Environment
The Next.js frontend handles API requests via a proxy defined in `next.config.mjs`. There are typically no strictly required `.env` variables for the Next.js local setup unless you are changing the proxy target URL.
