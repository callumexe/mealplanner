// app/api/shopping/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { ShoppingList } from "@/models/shoppinglist";

// GET /api/shopping
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const list = await ShoppingList.findOne({ userId: session.user.id }).lean();
  return NextResponse.json(list ?? { items: [] });
}

// POST /api/shopping — upserts full list
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items } = await req.json();
  if (!Array.isArray(items)) return NextResponse.json({ error: "items required" }, { status: 400 });

  await connectDB();
  const list = await ShoppingList.findOneAndUpdate(
    { userId: session.user.id },
    { userId: session.user.id, items },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json(list);
}