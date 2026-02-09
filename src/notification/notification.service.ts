import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './notification.schema';
import { Model } from 'mongoose';
import { PresenceService } from 'src/presence/presence.service';
import { Device } from 'src/device/device.schema';
import { ChatGateway } from 'src/gateway/chat.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private readonly presenseService: PresenceService,
    @InjectModel(Device.name) private deviceModel: Model<Device>,
    private readonly gateway: ChatGateway,
  ) {}

  async sendToUserHybrid(params: {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, any>;
  }) {
    const { userId, title, body, data } = params;

    const notification = await this.notificationModel.create({
      userId,
      title,
      body,
      data,
    });
    const activeDeviceIds = await this.presenseService.getActiveDevices(userId);
    if (activeDeviceIds.length > 0) {
      activeDeviceIds.forEach(() =>
        this.gateway.sendToUser(userId, {
          title,
          body,
          data,
          notificationId: notification._id,
        }),
      );
    }
  }
}
