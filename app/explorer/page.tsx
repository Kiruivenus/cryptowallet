"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Search, AlertCircle, Copy, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TransactionDetails {
  transactionHash: string
  type: string
  token: string
  amount: number
  status: string
  createdAt: string
  sender?: string
  receiver?: string
}

export default function ExplorerPage() {
  const [searchHash, setSearchHash] = useState("")
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setTransaction(null)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/explorer?hash=${encodeURIComponent(searchHash)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Transaction not found")
      }

      setTransaction(data.transaction)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("[v0] Failed to copy hash:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-4 px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Transaction Explorer</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-4 py-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter transaction hash"
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              required
              className="bg-input pr-12 font-mono text-sm"
            />
            <Button type="submit" size="icon" className="absolute right-1 top-1 h-8 w-8" disabled={isLoading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {transaction && (
          <div className="rounded-2xl border border-primary/20 bg-card/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Transaction Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                <div className="flex items-center gap-2">
                  <p className="break-all font-mono text-sm text-foreground flex-1">{transaction.transactionHash}</p>
                  <button
                    onClick={() => copyHash(transaction.transactionHash)}
                    className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="h-px bg-border/50" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium capitalize text-foreground">{transaction.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium capitalize text-foreground">{transaction.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Token</p>
                  <p className="font-medium uppercase text-foreground">{transaction.token}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-medium text-foreground">
                    {transaction.amount.toFixed(2)} {transaction.token.toUpperCase()}
                  </p>
                </div>
              </div>
              {transaction.sender && (
                <div>
                  <p className="text-xs text-muted-foreground">Sender</p>
                  <p className="text-sm text-foreground">{transaction.sender}</p>
                </div>
              )}
              {transaction.receiver && (
                <div>
                  <p className="text-xs text-muted-foreground">Receiver</p>
                  <p className="text-sm text-foreground">{transaction.receiver}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm text-foreground">{new Date(transaction.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
