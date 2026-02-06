import { Logger } from '@nestjs/common';
import Redis from 'ioredis';

const logger = new Logger('NestApplication');

let redisClient: Redis;

if (!redisClient) redisClient = new Redis(process.env.REDIS_URL);
redisClient.on('connect', () => {
  logger.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  logger.error('Redis error:', err);
});

export default redisClient;
