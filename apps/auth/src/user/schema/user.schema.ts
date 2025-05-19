import { Role } from '@app/common/enums/role.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true, required: true }) email: string;
  @Prop({ required: true }) passwordHash: string;
  @Prop({ type: [String], enum: Role, default: [Role.USER] }) roles: Role[];
  @Prop({ default: 0 })
  tokenVersion: number;
  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
