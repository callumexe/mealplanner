// app/dashboard/account/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import AccountClient from "./client";

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();
  const user = await User.findById(session.user!.id).lean() as any;
  if (!user) redirect("/login");

  return (
    <AccountClient
      initialName={user.name}
      initialEmail={user.email}
    />
  );
}