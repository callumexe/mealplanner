import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ShoppingClient from "./shoppingclient";

export default async function ShoppingPage() {
  const session = await auth();
  if (!session) redirect("/login");
  return <ShoppingClient />;
}