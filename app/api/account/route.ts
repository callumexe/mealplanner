// app/api/account/route.ts
import { NextResponse } from "next/server";
import { auth, signOut } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

// PATCH /api/account — update name, email, or password
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type } = body;

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (type === "name") {
    const { name } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    user.name = name.trim();
    await user.save();
    return NextResponse.json({ message: "Name updated" });
  }

  if (type === "email") {
    const { email } = body;
    if (!email?.trim()) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    const exists = await User.findOne({ email: email.trim(), _id: { $ne: user._id } });
    if (exists) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    user.email = email.trim();
    await user.save();
    return NextResponse.json({ message: "Email updated" });
  }

  if (type === "password") {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword)
      return NextResponse.json({ error: "Both passwords are required" }, { status: 400 });
    if (newPassword.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return NextResponse.json({ message: "Password updated" });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

// DELETE /api/account — delete account and all user data
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { password } = await req.json();
  if (!password) return NextResponse.json({ error: "Password required to confirm deletion" }, { status: 400 });

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: "Incorrect password" }, { status: 400 });

  // Delete all user data
  const { WeekPlan } = await import("@/models/weekplan");
  const { ShoppingList } = await import("@/models/shoppinglist");
  await Promise.all([
    User.findByIdAndDelete(session.user.id),
    WeekPlan.deleteMany({ userId: session.user.id }),
    ShoppingList.deleteOne({ userId: session.user.id }),
  ]);

  return NextResponse.json({ message: "Account deleted" });
}