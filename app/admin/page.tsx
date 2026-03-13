// app/admin/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminClient from "./adminclient";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/auth");
  if ((session.user as any).role !== "admin") redirect("/dashboard");

  return <AdminClient currentUserId={session.user!.id!} />;
}