import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DeviceModule } from './device/device.module';
import { NotificationModule } from './notification/notification.module';
import { PresenceModule } from './presence/presence.module';

@Module({
  imports: [AuthModule, UserModule, DeviceModule, NotificationModule, PresenceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
