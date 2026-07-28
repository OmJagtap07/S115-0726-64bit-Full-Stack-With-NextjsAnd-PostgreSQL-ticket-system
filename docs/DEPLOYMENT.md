# Deployment Guide

This document outlines the recommended strategies for taking the CSTMS application to production.

## 1. Database (PostgreSQL)
For production, avoid running databases inside Docker containers on a single VM. Use managed services for high availability.
- **Recommended Providers:** Supabase, Neon, or AWS RDS.
- **Action:** Update the `DATABASE_URL` in your production environment variables to point to the managed instance.

## 2. Backend (Node.js/Express)
The backend is compiled using `tsup` into a standard CommonJS module.
- **Recommended Providers:** Render, Railway, or AWS ECS.
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Environment:** Ensure `NODE_ENV=production` is set so the application utilizes optimized logging and error handling.

## 3. Frontend (Next.js)
The frontend utilizes the Next.js App Router and proxy middleware.
- **Recommended Provider:** Vercel
- **Configuration:** 
  - Root Directory: `web`
  - Build Command: `npm run build`
  - Install Command: `npm install`
- **Environment:** Set the necessary environment variables in the Vercel dashboard.

## 4. Prisma Migrations
Before starting the backend server in production, ensure database migrations have been applied:
```bash
npx prisma migrate deploy
```
*Note: Do not run `migrate dev` in production.*
