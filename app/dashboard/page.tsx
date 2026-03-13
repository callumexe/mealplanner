import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { WeekPlan } from "@/models/weekplan";
import { ShoppingList } from "@/models/shoppinglist";

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth");

  const { user } = session;
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Live stats from DB
  await connectDB();
  const weekStart = getMonday(new Date());

  const [weekPlan, shoppingList] = await Promise.all([
    WeekPlan.findOne({ userId: user?.id, weekStart }).lean(),
    ShoppingList.findOne({ userId: user?.id }).lean(),
  ]);

  const mealsPlanned = weekPlan
    ? (weekPlan as any).days.reduce((acc: number, d: any) => acc + d.meals.length, 0)
    : 0;

  const shoppingItems = shoppingList
    ? (shoppingList as any).items.filter((i: any) => !i.checked).length
    : 0;

  const stats = [
    { label: "Meals Planned", value: String(mealsPlanned), sub: "this week" },
    { label: "Shopping Items", value: String(shoppingItems), sub: "still needed" },
  ];

  const links = [
    { href: "/dashboard/planner", label: "Weekly Planner", desc: "Plan your meals for the week ahead.", icon: "📅" },
    { href: "/dashboard/recipes", label: "Recipe Library", desc: "Search thousands of recipes and add ingredients to your list.", icon: "📖" },
    { href: "/dashboard/shopping", label: "Shopping List", desc: "Manage your shopping list and check off items.", icon: "🛒" },
    { href: "/dashboard/account-settings", label: "Account Settings", desc: "Manage your profile and preferences.", icon: "⚙️", disabled: false },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4d8] font-mono">
      <main className="max-w-5xl mx-auto px-10 py-12">

        {/* GREETING */}
        <div className="mb-12 pb-10 border-b border-[#1a1a1a]">
          <p className="text-[0.6rem] uppercase tracking-[.25em] text-[#d4af37] mb-3 flex items-center gap-3">
            <span className="w-5 h-px bg-[#d4af37] inline-block" />
            {timeGreeting}
          </p>
          <h1 className="font-serif italic text-5xl text-[#f0ece0] leading-tight">
            Hey, {firstName}.
          </h1>
          <p className="text-[0.68rem] tracking-widest text-[#3a3a3a] mt-3">{today}</p>
        </div>

        {/* ACCOUNT CARD */}
        <div className="flex items-center gap-5 p-6 border border-[#1e1e1e] mb-3">
          <div className="w-14 h-14 bg-[#1a1a1a] border border-[#2a2a2a] grid place-items-center font-serif text-xl font-bold text-[#d4af37] shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold tracking-tight text-[#f0ece0]">{user?.name}</p>
            <p className="text-[0.68rem] text-[#444] mt-0.5 truncate">Your email: {user?.email}</p>
          </div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/auth" }); }}>
            <button className="text-[0.58rem] uppercase tracking-[.15em] text-[#3a3a3a] border border-[#1e1e1e] px-3 py-1.5 hover:border-[#d4af37] hover:text-[#d4af37] transition-colors bg-transparent font-mono cursor-pointer">
              Sign out
            </button>
          </form>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 gap-px bg-[#1a1a1a] border border-[#1a1a1a] mb-12">
          {stats.map(({ label, value, sub }) => (
            <div key={label} className="bg-[#0a0a0a] px-6 py-7">
              <p className="text-[0.58rem] uppercase tracking-[.2em] text-[#3a3a3a] mb-3">{label}</p>
              <p className="font-serif italic text-4xl text-[#d4af37] leading-none mb-1">{value}</p>
              <p className="text-[0.6rem] text-[#2a2a2a] tracking-wider">{sub}</p>
            </div>
          ))}
        </div>

        {/* QUICK LINKS */}
        <div className="grid grid-cols-2 gap-px bg-[#1a1a1a] border border-[#1a1a1a] mb-12">
          {links.map(({ href, label, desc, icon, disabled }) =>
            disabled ? (
              <div
                key={label}
                className="bg-[#0a0a0a] p-6 relative overflow-hidden opacity-40 cursor-not-allowed"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl">{icon}</span>
                </div>
                <p className="text-[0.7rem] uppercase tracking-[.12em] text-[#e8e4d8] font-medium mb-2">{label}</p>
                <p className="text-[0.7rem] leading-relaxed text-[#444]">{desc}</p>
              </div>
            ) : (
              <Link
                key={label}
                href={href}
                className="group bg-[#0a0a0a] p-6 hover:bg-[#0d0d0d] transition-colors relative overflow-hidden no-underline"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-[0.55rem] uppercase tracking-[.12em] text-[#d4af37]/50">
                    Open →
                  </span>
                </div>
                <p className="text-[0.7rem] uppercase tracking-[.12em] text-[#e8e4d8] font-medium mb-2">{label}</p>
                <p className="text-[0.7rem] leading-relaxed text-[#444]">{desc}</p>
              </Link>
            )
          )}
        </div>

        {mealsPlanned === 0 && (
          <div className="border border-[#1e1e1e] p-8">
            <p className="text-[0.58rem] uppercase tracking-[.2em] text-[#d4af37] mb-4 flex items-center gap-3">
              <span className="w-4 h-px bg-[#d4af37] inline-block" />
              Getting started
            </p>
            <h2 className="font-serif italic text-2xl text-[#f0ece0] mb-6">
              Your planner is empty — for now. Do the following steps, eh?
            </h2>
            <div className="space-y-3">
              {[
                ["01", "Browse the recipe library and find meals you like"],
                ["02", "Head to the weekly planner and slot them in"],
                ["03", "Your shopping list builds as you plan"],
              ].map(([num, text]) => (
                <div key={num} className="flex items-center gap-4 text-[0.7rem] text-[#444]">
                  <span className="font-serif italic text-[#d4af37] text-lg leading-none w-6 shrink-0">{num}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}