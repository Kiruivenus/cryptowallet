"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, AlertCircle, CheckCircle2, User, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SendPage() {
  const router = useRouter()
  const [recipientType, setRecipientType] = useState<"email" | "userId">("email")
  const [recipient, setRecipient] = useState("")
  const [token, setToken] = useState<"usdt" | "usdc">("usdt")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [balances, setBalances] = useState({ usdt: 0, usdc: 0 })
  const [fee, setFee] = useState(0)
  const [feePercentage, setFeePercentage] = useState(0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [recipientInfo, setRecipientInfo] = useState<any>(null)

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
        setFeePercentage(data.settings.fees?.transferPercentage || 0)
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

  const handleVerifyRecipient = async () => {
    setError("")
    setRecipientInfo(null)

    if (!recipient) {
      setError("Please enter recipient information")
      return
    }

    try {
      const response = await fetch("/api/transfer/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientType,
          recipient,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Recipient not found")
      }

      setRecipientInfo(data.user)
      setShowConfirmation(true)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const transferAmount = Number.parseFloat(amount)

      if (transferAmount <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      const totalAmount = transferAmount + fee

      if (totalAmount > balances[token]) {
        throw new Error("Insufficient balance (including fees)")
      }

      const response = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientType,
          recipient,
          token,
          amount: transferAmount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Transfer failed")
      }

      router.push("/transactions")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const netAmount = amount ? Number.parseFloat(amount) : 0
  const totalCost = netAmount + fee

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-4 px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Send Crypto</h1>
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

        {!showConfirmation ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipient Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRecipientType("email")}
                      className={`flex items-center justify-center gap-2 rounded-lg border p-3 transition-all ${
                        recipientType === "email"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-black/30 text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <Mail className="h-4 w-4" />
                      <span className="text-sm font-medium">Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipientType("userId")}
                      className={`flex items-center justify-center gap-2 rounded-lg border p-3 transition-all ${
                        recipientType === "userId"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-black/30 text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">User ID</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">
                    {recipientType === "email" ? "Recipient Email" : "Recipient User ID"}
                  </Label>
                  <Input
                    id="recipient"
                    type={recipientType === "email" ? "email" : "text"}
                    placeholder={recipientType === "email" ? "recipient@example.com" : "Enter user ID"}
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="bg-input"
                  />
                </div>

                {error && !recipientInfo && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button type="button" onClick={handleVerifyRecipient} className="w-full">
                  Verify Recipient
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-success/20 bg-success/5 p-6 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-semibold">Recipient Verified</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium text-foreground">{recipientInfo?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">{recipientInfo?.email}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowConfirmation(false)
                  setRecipientInfo(null)
                }}
                className="mt-3 text-xs"
              >
                Change Recipient
              </Button>
            </div>

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
                    onClick={() => setAmount((balances[token] - fee).toString())}
                    className="text-xs text-primary hover:underline"
                  >
                    Max: {balances[token].toFixed(2)} {token.toUpperCase()}
                  </button>
                </div>

                {amount && (
                  <div className="space-y-2 rounded-lg border border-border/50 bg-black/30 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Transfer Amount</span>
                      <span className="font-medium text-foreground">
                        {netAmount.toFixed(2)} {token.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Transfer Fee ({feePercentage}%)</span>
                      <span className="font-medium text-foreground">
                        {fee.toFixed(2)} {token.toUpperCase()}
                      </span>
                    </div>
                    <div className="h-px bg-border/50" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Cost</span>
                      <span className="font-bold text-primary">
                        {totalCost.toFixed(2)} {token.toUpperCase()}
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

            <Button type="submit" className="w-full glow-hover" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Now"}
            </Button>
          </form>
        )}
      </main>
    </div>
  )
}
