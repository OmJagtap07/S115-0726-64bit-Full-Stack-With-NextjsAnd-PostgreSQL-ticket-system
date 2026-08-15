import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { config } from '../../config';
import { logger } from '../logger/winston';
import httpContext from 'express-http-context';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let title = 'Internal Server Error';
  let detail = err.message;
  let validationErrors = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    title = err.name || 'Application Error';
  } else if (err instanceof ZodError) {
    statusCode = 400;
    title = 'Validation Error';
    detail = 'One or more fields failed validation.';
    validationErrors = err.issues;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      title = 'Conflict';
      detail = 'A record with this value already exists.';
    } else if (err.code === 'ETIMEDOUT' || err.code === 'P1001') {
      statusCode = 503;
      title = 'Database Connection Error';
      detail = 'The database is currently unreachable or timed out.';
    } else {
      statusCode = 400;
      title = 'Database Error';
      detail = `A database error occurred (${err.code}).`;
    }
  }

  // Log error
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`[${statusCode}] ${err.message}`);
  }

  // RFC7807 Problem Details
  const problemDetails: any = {
    type: `https://api.example.com/errors/${statusCode}`,
    title,
    status: statusCode,
    detail,
    instance: req.originalUrl,
    correlationId: httpContext.get('correlationId'),
  };

  if (validationErrors) {
    problemDetails.errors = validationErrors;
  }

  if (config.NODE_ENV === 'development') {
    problemDetails.stack = err.stack;
  }

  res.status(statusCode).type('application/problem+json').json(problemDetails);
};
