import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EventConditionType } from '@event-platform/common';

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true }) title: string;

  @Prop({ type: String, enum: EventConditionType, required: true })
  conditionType: EventConditionType;

  @Prop({ type: Object, default: {} }) conditionMeta: Record<string, any>;

  @Prop({ required: true }) startAt: Date;
  @Prop({ required: true }) endAt: Date;

  @Prop({ default: true }) active: boolean;
  @Prop({
    type: [Types.ObjectId],
    ref: 'Reward',
    default: [],
  })
  rewards: Types.ObjectId[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
