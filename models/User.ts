// models/User.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  verifyCode?: string;
  verifyCodeExpiry?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:             { type: String, required: true },
    email:            { type: String, required: true, unique: true },
    password:         { type: String, required: true },
    verified:         { type: Boolean, default: false },
    verifyCode:       { type: String, default: null },
    verifyCodeExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User = (models.User as mongoose.Model<IUser>) || model<IUser>("User", UserSchema);
