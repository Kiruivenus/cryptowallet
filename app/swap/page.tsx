"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowDownUp, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SwapPage() {
  const router = useRouter()
  const [fromToken, setFromToken] = useState<"usdt" | "usdc">("usdt")
  const [toToken, setToToken] = useState<"usdt" | "usdc">("usdc")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [balances, setBalances] = useState({ usdt: 0, usdc: 0 })
  const [swapRates, setSwapRates] = useState({ usdtToUsdc: 1.0, usdcToUsdt: 1.0 })

  useEffect(() => {
    fetchUserData()
    fetchSettings()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me")
      const data = await response.json()
      if (data.user) {
        setBalances(data.user.balances || { usdt: 0, usdc: 0 })
      }
    } catch (error) {
      console.error("[v0] Failed to fetch user data:", error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      const data = await response.json()
      if (data.settings) {
        setSwapRates(data.settings.swapRates || { usdtToUsdc: 1.0, usdcToUsdt: 1.0 })
      }
    } catch (error) {
      console.error("[v0] Failed to fetch settings:", error)
    }
  }

  useEffect(() => {
    if (fromAmount && !isNaN(Number.parseFloat(fromAmount))) {
      const rate = fromToken === "usdt" ? swapRates.usdtToUsdc : swapRates.usdcToUsdt
      const calculated = Number.parseFloat(fromAmount) * rate
      setToAmount(calculated.toFixed(6))
    } else {
      setToAmount("")
    }
  }, [fromAmount, fromToken, toToken, swapRates])

  const handleSwapTokens = () => {
    const tempToken = fromToken
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const swapAmount = Number.parseFloat(fromAmount)

      if (swapAmount <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      if (swapAmount > balances[fromToken]) {
        throw new Error("Insufficient balance")
      }

      const response = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromToken,
          toToken,
          amount: swapAmount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Swap failed")
      }

      // Update balances locally
      setBalances(data.balances)
      setFromAmount("")
      setToAmount("")

      // Show success and redirect
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const currentRate = fromToken === "usdt" ? swapRates.usdtToUsdc : swapRates.usdcToUsdt

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-4 px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Swap</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-4 py-6">
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Available Balance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/50 bg-black/30 p-4">
              <div className="mb-1 text-xs text-muted-foreground">USDT</div>
              <div className="text-xl font-bold text-foreground">{balances.usdt.toFixed(2)}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-black/30 p-4">
              <div className="mb-1 text-xs text-muted-foreground">USDC</div>
              <div className="text-xl font-bold text-foreground">{balances.usdc.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative space-y-4">
            {/* From Token */}
            <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
              <Label className="mb-3 block text-sm text-muted-foreground">From</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    required
                    className="border-0 bg-transparent p-0 text-3xl font-bold text-foreground focus-visible:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setFromAmount(balances[fromToken].toString())}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Max: {balances[fromToken].toFixed(2)}
                  </button>
                </div>
                <div className="flex-shrink-0">
                  <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-2">
                    <span className="text-lg font-bold text-primary">{fromToken.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwapTokens}
                className="rounded-full border border-primary/20 bg-black/80 p-3 transition-all hover:border-primary/50 hover:bg-primary/10"
              >
                <ArrowDownUp className="h-6 w-6 text-primary" />
              </button>
            </div>

            {/* To Token */}
            <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
              <Label className="mb-3 block text-sm text-muted-foreground">To</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-foreground">{toAmount || "0.00"}</div>
                </div>
                <div className="flex-shrink-0">
                  <div className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-2">
                    <span className="text-lg font-bold text-accent">{toToken.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {fromAmount && (
            <div className="rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span className="font-medium text-foreground">
                  1 {fromToken.toUpperCase()} = {currentRate.toFixed(6)} {toToken.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full glow-hover" disabled={isLoading || !fromAmount}>
            {isLoading ? "Swapping..." : "Swap Now"}
          </Button>
        </form>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 backdrop-blur-sm">
          <h3 className="mb-2 text-sm font-semibold text-primary">Instant Swap</h3>
          <p className="text-xs text-muted-foreground">
            Swap between USDT and USDC instantly with no fees. Exchange rates are updated
            regularly.
          </p>
        </div>
      </main>
    </div>
  )
}
