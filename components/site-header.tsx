import { siteConfig } from "@/config/site"
import { MainNav } from "@/components/main-nav"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1a1a1a] bg-[#0a0a0a]">
      <div className="container relative flex h-16 items-center">
        <MainNav items={siteConfig.mainNav} />
      </div>
    </header>
  )
}