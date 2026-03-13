import mongoose, { Schema, model, models } from "mongoose";

export interface IMeal {
  id: string;
  label: string; 
  recipe: string;
  notes?: string;
}

export interface IDayPlan {
  day: string; 
  meals: IMeal[];
}

export interface IWeekPlan {
  userId: string;
  weekStart: string; 
  days: IDayPlan[];
  createdAt?: Date;
  updatedAt?: Date;
}

const MealSchema = new Schema<IMeal>({
  id:     { type: String, required: true },
  label:  { type: String, required: true },
  recipe: { type: String, required: true },
  notes:  { type: String, default: "" },
});

const DayPlanSchema = new Schema<IDayPlan>({
  day:   { type: String, required: true },
  meals: { type: [MealSchema], default: [] },
});

const WeekPlanSchema = new Schema<IWeekPlan>(
  {
    userId:    { type: String, required: true, index: true },
    weekStart: { type: String, required: true },
    days:      { type: [DayPlanSchema], default: [] },
  },
  { timestamps: true }
);

WeekPlanSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

export const WeekPlan = models.WeekPlan || model<IWeekPlan>("WeekPlan", WeekPlanSchema);