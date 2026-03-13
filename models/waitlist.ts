import mongoose, { Schema, model, models } from "mongoose";
 
const WaitlistSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);
 
export const Waitlist = models.Waitlist || model("Waitlist", WaitlistSchema);
 