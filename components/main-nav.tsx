"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { NavItem } from "@/types/nav";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface MainNavProps {
  items?: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === "/") return null;

  // Home is always visible, everything else requires auth
  const visibleItems = items?.filter((item) => {
    if (item.href === "/") return true;
    return !!session;
  });

  return (
    <div className="flex items-center gap-10">
      {/* Brand */}
      <Link href="/" className="group flex items-center gap-3 no-underline">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-yellow-600 font-serif italic text-yellow-600 text-sm transition-colors group-hover:bg-yellow-600 group-hover:text-black">
          {siteConfig.name?.[0] ?? "A"}
        </div>
        <span className="text-[0.65rem] uppercase tracking-[0.2em] text-neutral-500 transition-colors group-hover:text-yellow-600 font-mono">
          {siteConfig.name}
        </span>
      </Link>

      {/* Nav links */}
      {visibleItems?.length ? (
        <nav className="flex items-center">
          {visibleItems.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] transition-colors",
                    "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-yellow-600 after:transition-transform after:duration-200",
                    pathname === item.href
                      ? "text-[#b8962e] after:scale-x-100"
                      : "text-[#666] hover:text-[#1a1a1a] after:scale-x-0 hover:after:scale-x-100",
                    item.disabled && "pointer-events-none opacity-40"
                  )}
                >
                  {item.title}
                </Link>
              )
          )}
        </nav>
      ) : null}
    </div>
  );
}