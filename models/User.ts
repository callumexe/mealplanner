// models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true },
    email:            { type: String, required: true, unique: true },
    password:         { type: String, required: true },
    verified:         { type: Boolean, default: false },
    verifyCode:       { type: String, default: null },
    verifyCodeExpiry: { type: Date, default: null },
    loginToken:       { type: String, default: null },
    loginTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

// @ts-ignore
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
