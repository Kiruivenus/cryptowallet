"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DepositModal } from "@/components/deposit-modal"

export default function DepositPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-4 px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Deposit</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-4 py-6">
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Select Token</h2>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent p-4 text-left transition-all hover:border-primary/50 hover:from-primary/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">USDT</h3>
                <p className="text-sm text-muted-foreground">Tether USD (TRC20)</p>
              </div>
              <div className="rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-primary">Deposit</div>
            </div>
          </button>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <h3 className="mb-3 text-sm font-semibold text-foreground">How it works</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                1
              </span>
              <span>Click on USDT to get your unique deposit address</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                2
              </span>
              <span>Send USDT to the provided address or scan the QR code</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                3
              </span>
              <span>Your balance will be updated automatically within 5 minutes</span>
            </li>
          </ol>
        </div>

        <div className="rounded-2xl border border-success/20 bg-success/5 p-6 backdrop-blur-sm">
          <h3 className="mb-2 text-sm font-semibold text-success">First Deposit Bonus</h3>
          <p className="text-sm text-muted-foreground">
            Get 30% extra USDT on your first deposit above $50! This is a limited time offer.
          </p>
        </div>
      </main>

      <DepositModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
