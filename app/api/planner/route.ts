// app/api/planner/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { WeekPlan } from "@/models/weekplan";

// GET /api/planner?weekStart=YYYY-MM-DD
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const weekStart = searchParams.get("weekStart");
  if (!weekStart) return NextResponse.json({ error: "weekStart required" }, { status: 400 });

  await connectDB();
  const plan = await WeekPlan.findOne({ userId: session.user.id, weekStart }).lean();
  return NextResponse.json(plan ?? { days: [] });
}

// POST /api/planner  — upserts the full week plan
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { weekStart, days } = body;
  if (!weekStart || !days) return NextResponse.json({ error: "weekStart and days required" }, { status: 400 });

  await connectDB();
  const plan = await WeekPlan.findOneAndUpdate(
    { userId: session.user.id, weekStart },
    { userId: session.user.id, weekStart, days },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json(plan);
}