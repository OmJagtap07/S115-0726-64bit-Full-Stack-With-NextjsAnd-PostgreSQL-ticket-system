import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import httpContext from 'express-http-context';
import { correlationIdMiddleware } from './core/middlewares/correlationId';
import { errorHandler } from './core/middlewares/errorHandler';
import { logger } from './core/logger/winston';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import ticketsRoutes from './modules/tickets/tickets.routes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Observability & Tracing
app.use(httpContext.middleware);
app.use(correlationIdMiddleware);

// Request Logging with Winston
app.use((req, res, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Health Checks
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', (req, res) => {
  // TODO: Add database & redis checks
  res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
});

import authRoutes from './modules/auth/auth.routes';

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/tickets', ticketsRoutes);

// Centralized Error Handling
app.use(errorHandler);

export default app;
