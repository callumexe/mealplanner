import { siteConfig } from "@/config/site"
import { MainNav } from "@/components/main-nav"

export function SiteHeader() {
  return (
    <header className="bg-[#faf8f3] sticky top-0 z-40 w-full border-b border-[#e8e0d0]">
      <div className="container relative flex h-16 items-center">
        {/* Brand - left */}
        <MainNav items={siteConfig.mainNav} />

        {/* Nav links - centered absolutely */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center">
          {/* Nav links are rendered inside MainNav, so we need to split them out */}
        </nav>
      </div>
    </header>
  )
}