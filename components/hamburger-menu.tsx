"use client"

import { useState } from "react"
import { Menu, X, History, Users, Search, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const menuItems = [
    { icon: History, label: "Transaction History", href: "/transactions" },
    { icon: Users, label: "Referrals", href: "/referrals" },
    { icon: Search, label: "Explorer", href: "/explorer" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="relative z-50 text-foreground">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            style={{ backgroundColor: "#000000", opacity: 1 }}
          />
          <div
            className="fixed right-0 top-0 z-50 h-full w-72 border-l border-border/50"
            style={{ backgroundColor: "#000000", opacity: 1 }}
          >
            <div className="flex flex-col gap-2 p-6 pt-20 h-full" style={{ backgroundColor: "#000000" }}>
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-foreground transition-all hover:bg-white/10 hover:text-primary"
                    style={{ backgroundColor: "transparent" }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}

              <div className="my-4 h-px bg-border/50" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-destructive transition-all hover:bg-destructive/10"
                style={{ backgroundColor: "transparent" }}
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
