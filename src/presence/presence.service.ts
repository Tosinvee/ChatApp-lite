import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/utils/redisClient';

@Injectable()
export class PresenceService {
  private deviceOffLineMs = 60_000;
  private redisTTLSeconds = 120;

  constructor(private readonly redis: RedisService) {}

  private getKey(userId: string) {
    return `active_device:${userId}`;
  }

  async markActive(userId: string, deviceId: string) {
    const key = this.getKey(userId);
    const now = Date.now();

    const devices: Record<string, number> = JSON.parse(
      (await this.redis.get(key)) || '{}',
    );
    devices[deviceId] = now;

    const cuttOff = now - this.deviceOffLineMs;
    for (const [id, lastSeen] of Object.entries(devices)) {
      if (lastSeen < cuttOff) delete devices[id];
    }
    await this.redis.set(key, JSON.stringify(devices), {
      EX: this.redisTTLSeconds,
    });
  }

  async markInactive(userId: string, deviceId: string) {
    const key = this.getKey(userId);
    const devices: Record<string, number> = JSON.parse(
      (await this.redis.get(key)) || '{}',
    );
    delete devices[deviceId];
    if (Object.keys(devices).length)
      await this.redis.set(key, JSON.stringify(devices), {
        EX: this.redisTTLSeconds,
      });
    else await this.redis.del(key);
  }

  async getActiveDevices(userId: string): Promise<string[]> {
    const key = this.getKey(userId);
    const devices: Record<string, number> = JSON.parse(
      (await this.redis.get(key)) || '{}',
    );
    const cuttOff = Date.now() - this.deviceOffLineMs;
    return Object.entries(devices)
      .filter(([_, lastSeen]) => lastSeen > cuttOff)
      .map(([id]) => id);
  }
}
