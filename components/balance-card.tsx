"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface BalanceCardProps {
  totalBalance: number
  usdtBalance: number
  usdcBalance: number
}

export function BalanceCard({ totalBalance, usdtBalance, usdcBalance }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true)

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-6">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Balance</span>
          <Button variant="ghost" size="icon" onClick={() => setShowBalance(!showBalance)} className="h-8 w-8">
            {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-4xl font-bold text-foreground">
            {showBalance ? <span className="gradient-text">${totalBalance.toFixed(2)}</span> : "••••••"}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/50 bg-black/30 p-3 backdrop-blur-sm">
            <div className="mb-1 text-xs text-muted-foreground">USDT</div>
            <div className="text-lg font-semibold text-foreground">{showBalance ? usdtBalance.toFixed(2) : "••••"}</div>
          </div>
          <div className="rounded-xl border border-border/50 bg-black/30 p-3 backdrop-blur-sm">
            <div className="mb-1 text-xs text-muted-foreground">USDC</div>
            <div className="text-lg font-semibold text-foreground">{showBalance ? usdcBalance.toFixed(2) : "••••"}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
