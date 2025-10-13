"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function WithdrawPage() {
  const router = useRouter()
  const [token, setToken] = useState<"usdt" | "usdc">("usdt")
  const [amount, setAmount] = useState("")
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [balances, setBalances] = useState({ usdt: 0, usdc: 0 })
  const [fee, setFee] = useState(0)
  const [feePercentage, setFeePercentage] = useState(0)

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
        setFeePercentage(data.settings.fees?.withdrawalPercentage || 0)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch settings:", error)
    }
  }

  useEffect(() => {
    if (amount && !isNaN(Number.parseFloat(amount))) {
      const calculatedFee = (Number.parseFloat(amount) * feePercentage) / 100
      setFee(calculatedFee)
    } else {
      setFee(0)
    }
  }, [amount, feePercentage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const withdrawAmount = Number.parseFloat(amount)

      if (withdrawAmount <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      if (withdrawAmount > balances[token]) {
        throw new Error("Insufficient balance")
      }

      if (!address) {
        throw new Error("Please enter a withdrawal address")
      }

      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          amount: withdrawAmount,
          toAddress: address,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Withdrawal failed")
      }

      router.push("/transactions")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const netAmount = amount ? Number.parseFloat(amount) - fee : 0

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-4 px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Withdraw</h1>
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
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Select Token</Label>
                <Select value={token} onValueChange={(value: "usdt" | "usdc") => setToken(value)}>
                  <SelectTrigger id="token" className="bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usdt">USDT</SelectItem>
                    <SelectItem value="usdc">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Withdrawal Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter wallet address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="bg-input font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="bg-input"
                />
                <button
                  type="button"
                  onClick={() => setAmount(balances[token].toString())}
                  className="text-xs text-primary hover:underline"
                >
                  Max: {balances[token].toFixed(2)} {token.toUpperCase()}
                </button>
              </div>

              {amount && (
                <div className="space-y-2 rounded-lg border border-border/50 bg-black/30 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Withdrawal Fee ({feePercentage}%)</span>
                    <span className="font-medium text-foreground">
                      {fee.toFixed(2)} {token.toUpperCase()}
                    </span>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You will receive</span>
                    <span className="font-bold text-primary">
                      {netAmount.toFixed(2)} {token.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4">
            <h3 className="mb-2 text-sm font-semibold text-warning">Important:</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Withdrawals require admin approval</li>
              <li>• Processing time: 1-24 hours</li>
              <li>• Double-check your address before submitting</li>
              <li>• Minimum withdrawal: $10</li>
            </ul>
          </div>

          <Button type="submit" className="w-full glow-hover" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Withdrawal Request"}
          </Button>
        </form>
      </main>
    </div>
  )
}
