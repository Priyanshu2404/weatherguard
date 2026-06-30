import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  // Explicit type required — reflect-metadata cannot infer union types (string | null)
  @Prop({ type: String, default: null })
  avatar: string | null;

  @Prop({ required: true, enum: ['google', 'github'] })
  provider: string;

  @Prop({ required: true })
  providerId: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Prop({ type: String, default: null })
  telegramChatId: string | null;

  @Prop({ type: String, default: null })
  telegramUsername: string | null;

  @Prop({ type: String, default: null })
  city: string | null;

  @Prop({ type: String, default: null })
  telegramLinkToken: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

