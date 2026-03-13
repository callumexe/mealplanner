// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { WeekPlan } from "@/models/weekplan";
import { ShoppingList } from "@/models/shoppinglist";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  if ((session.user as any).role !== "admin") return null;
  return session;
}

// GET — list all users + signup chart data
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();

  const users = await User.find({}, { password: 0, verifyCode: 0, verifyCodeExpiry: 0, loginToken: 0, loginTokenExpiry: 0 })
    .sort({ createdAt: -1 })
    .lean();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const signupChart = await User.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return NextResponse.json({ users, signupChart });
}

// DELETE — delete user and all their data
export async function DELETE(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (id === (session.user as any).id)
    return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });

  await connectDB();
  await Promise.all([
    User.findByIdAndDelete(id),
    WeekPlan.deleteMany({ userId: id }),
    ShoppingList.deleteOne({ userId: id }),
  ]);

  return NextResponse.json({ message: "User deleted" });
}

// PATCH — promote or demote
export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, role } = await req.json();
  if (!id || !role) return NextResponse.json({ error: "id and role required" }, { status: 400 });

  if (id === (session.user as any).id)
    return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });

  await connectDB();
  await User.findByIdAndUpdate(id, { role });

  return NextResponse.json({ message: "Role updated" });
}