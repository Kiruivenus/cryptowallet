"use client"

import { Home, Repeat, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()

  const hideOnRoutes = ["/", "/login", "/register"]
  const isAdminRoute = pathname.startsWith("/admin")
  const shouldHide = hideOnRoutes.includes(pathname) || isAdminRoute

  if (shouldHide) {
    return null
  }

  const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Repeat, label: "Swap", href: "/swap" },
    { icon: User, label: "Profile", href: "/profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-6 py-2 transition-all",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-6 w-6 transition-all", isActive && "drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
