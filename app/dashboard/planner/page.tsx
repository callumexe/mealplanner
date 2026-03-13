// app/dashboard/planner/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PlannerClient from "./PlannerClient";

export default async function PlannerPage() {
  const session = await auth();
  if (!session) redirect("/auth");
  return <PlannerClient />;
}