import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '../cache/redis';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger/winston';

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'middleware_ratelimit',
  points: 10, // 10 requests
  duration: 1, // per 1 second by IP
});

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (rejRes) {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).type('application/problem+json').json({
      type: 'https://api.example.com/errors/429',
      title: 'Too Many Requests',
      status: 429,
      detail: 'You have exceeded your request limit. Please try again later.',
      instance: req.originalUrl
    });
  }
};

// Specialized strict limiter for auth endpoints
const authRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'auth_ratelimit',
  points: 5, // 5 requests
  duration: 60 * 15, // per 15 minutes by IP
});

export const authRateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authRateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (rejRes) {
    logger.warn(`Auth Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).type('application/problem+json').json({
      type: 'https://api.example.com/errors/429',
      title: 'Too Many Requests',
      status: 429,
      detail: 'Too many authentication attempts. Please try again later.',
      instance: req.originalUrl
    });
  }
};
