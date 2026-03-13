import mongoose, { Schema, model, models } from "mongoose";

export interface IShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  checked: boolean;
  category: string;
}

export interface IShoppingList {
  userId: string;
  items: IShoppingItem[];
  updatedAt?: Date;
}

const ShoppingItemSchema = new Schema<IShoppingItem>({
  id:       { type: String, required: true },
  name:     { type: String, required: true },
  quantity: { type: String, default: "" },
  unit:     { type: String, default: "" },
  checked:  { type: Boolean, default: false },
  category: { type: String, default: "Other" },
});

const ShoppingListSchema = new Schema<IShoppingList>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items:  { type: [ShoppingItemSchema], default: [] },
  },
  { timestamps: true }
);

export const ShoppingList =
  models.ShoppingList || model<IShoppingList>("ShoppingList", ShoppingListSchema);