export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "MEAL PLANNER",
  description:
    "Plan meals and identify their nutrients with ease...",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Dashboard",
      href: "/dashboard"
    },
    {
      title: "Meal Planning",
      href: "/planner"
    },
    {
      title: "Shopping List",
      href: "/shopping"
    },
    {
      title: "Recipe Library",
      href: "/recipes"
    }
  ],
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/shadcn/ui",
    docs: "https://ui.shadcn.com",
  },
}
