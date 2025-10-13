"use client"

import { ArrowDownToLine, ArrowUpFromLine, Repeat2, Send } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    icon: ArrowDownToLine,
    label: "Deposit",
    href: "/deposit",
    gradient: "from-success/20 to-success/5",
  },
  {
    icon: ArrowUpFromLine,
    label: "Withdraw",
    href: "/withdraw",
    gradient: "from-warning/20 to-warning/5",
  },
  {
    icon: Repeat2,
    label: "Swap",
    href: "/swap",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Send,
    label: "Send",
    href: "/send",
    gradient: "from-accent/20 to-accent/5",
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link key={action.href} href={action.href} className="group flex flex-col items-center gap-2">
            <div
              className={`relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br p-4 transition-all group-hover:scale-105 group-hover:border-primary/50 ${action.gradient}`}
            >
              <Icon className="h-6 w-6 text-foreground transition-all group-hover:text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
              {action.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
