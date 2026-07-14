import { Redis } from 'ioredis';
import { config } from '../../config';

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => console.error('Redis Client Error:', err.message));
redis.on('connect', () => console.log('✅ Connected to Redis'));
