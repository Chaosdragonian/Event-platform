import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Reward extends Document {
  _id: mongoose.Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ required: true }) type: string;

  @Prop({ required: true }) amount: number;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
