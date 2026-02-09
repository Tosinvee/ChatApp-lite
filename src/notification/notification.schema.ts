import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 'PUSH' })
  channel: 'PUSH' | 'SOCKET';
  @Prop()
  data: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
