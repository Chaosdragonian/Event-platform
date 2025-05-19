import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RefreshSession extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ unique: true })
  jtiHash: string;

  @Prop({ expires: 0 })
  expiresAt: Date;
}

export const RefreshSessionSchema =
  SchemaFactory.createForClass(RefreshSession);
RefreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
