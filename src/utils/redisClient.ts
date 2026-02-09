import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private static instance: RedisClient;
  private readonly logger = new Logger(RedisService.name);

  private get client(): RedisClient {
    // Ensure singleton instance
    if (!RedisService.instance) {
      RedisService.instance = new Redis(
        process.env.REDIS_URL || 'redis://127.0.0.1:6379',
      );

      RedisService.instance.on('connect', () =>
        this.logger.log('Connected to Redis'),
      );
      RedisService.instance.on('ready', () =>
        this.logger.log('Redis is ready to use'),
      );
      RedisService.instance.on('error', (err) =>
        this.logger.error('Redis error', err),
      );
      RedisService.instance.on('close', () =>
        this.logger.warn('Redis connection closed'),
      );
    }
    return RedisService.instance;
  }

  async onModuleInit() {
    this.logger.log('Initializing Redis module...');
    await this.client.ping();
  }

  async onModuleDestroy() {
    this.logger.log('Closing Redis connection...');
    await this.client.quit();
    RedisService.instance = null; // reset singleton
  }

  // Redis GET
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  // Redis SET with optional expiration
  async set(key: string, value: string, opts?: { EX?: number }) {
    if (opts?.EX) {
      await this.client.set(key, value, 'EX', opts.EX);
    } else {
      await this.client.set(key, value);
    }
  }

  // Redis DELETE
  async del(key: string) {
    await this.client.del(key);
  }

  // Optional: Redis EXISTS
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }
}
