import winston from 'winston';
import { config } from '../../config';
import httpContext from 'express-http-context';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Format for console (development)
const consoleFormat = printf(({ level, message, timestamp, stack, correlationId, requestId, ...metadata }) => {
  const reqIdStr = requestId ? `[ReqID: ${requestId}] ` : '';
  const corrIdStr = correlationId ? `[CorrID: ${correlationId}] ` : '';
  let msg = `${timestamp} ${level}: ${corrIdStr}${reqIdStr}${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  if (stack) {
    msg += `\n${stack}`;
  }
  return msg;
});

// Middleware hook to inject correlation ID into every log
const injectCorrelationId = winston.format((info) => {
  const correlationId = httpContext.get('correlationId');
  const requestId = httpContext.get('requestId');
  if (correlationId) info.correlationId = correlationId;
  if (requestId) info.requestId = requestId;
  return info;
});

export const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    injectCorrelationId(),
    config.NODE_ENV === 'production' ? json() : combine(colorize(), consoleFormat)
  ),
  transports: [
    new winston.transports.Console(),
  ],
});
