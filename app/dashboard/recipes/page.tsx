// app/dashboard/recipes/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RecipeLibrary from "./library";

export default async function RecipesPage() {
  const session = await auth();
  if (!session) redirect("/auth");
  return <RecipeLibrary />;
}