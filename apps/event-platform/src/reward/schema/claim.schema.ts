import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Claim extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({ default: 'PENDING' }) status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);
