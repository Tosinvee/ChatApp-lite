import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Device extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  fcmToken: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
