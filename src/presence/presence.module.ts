import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { RedisService } from 'src/utils/redisClient';

@Module({
  providers: [PresenceService, RedisService],
})
export class PresenceModule {}
