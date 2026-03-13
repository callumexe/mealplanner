// models/User.ts
import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
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

export const User = models.User || model("User", UserSchema);