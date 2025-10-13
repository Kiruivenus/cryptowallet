"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Repeat2,
  Send,
  Users,
  Filter,
  Copy,
  CheckCircle2,
  Gift,
  ArrowLeftRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Transaction {
  _id: string
  type: "deposit" | "withdrawal" | "transfer" | "swap" | "referral" | "bonus"
  token: string
  amount: number
  status: string
  transactionHash: string
  createdAt: string
  metadata?: any
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions")
      const data = await response.json()
      if (data.transactions) {
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownToLine className="h-5 w-5 text-success" />
      case "withdrawal":
        return <ArrowUpFromLine className="h-5 w-5 text-warning" />
      case "transfer":
        return <Send className="h-5 w-5 text-primary" />
      case "swap":
        return <Repeat2 className="h-5 w-5 text-accent" />
      case "referral":
        return <Users className="h-5 w-5 text-success" />
      case "bonus":
        return <Gift className="h-5 w-5 text-success" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-success"
      case "pending":
        return "text-warning"
      case "rejected":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getAmountDisplay = (transaction: Transaction) => {
    const { type, amount, token } = transaction

    if (type === "withdrawal") {
      return {
        color: "text-destructive",
        sign: "-",
        amount: Math.abs(amount),
      }
    }

    if (type === "swap") {
      return {
        color: "text-accent",
        sign: "",
        amount: Math.abs(amount),
        showArrows: true,
      }
    }

    if (type === "deposit" || type === "bonus" || type === "referral") {
      return {
        color: "text-success",
        sign: "+",
        amount: Math.abs(amount),
      }
    }

    return {
      color: amount > 0 ? "text-success" : "text-destructive",
      sign: amount > 0 ? "+" : "-",
      amount: Math.abs(amount),
    }
  }

  const filteredTransactions = filter === "all" ? transactions : transactions.filter((t) => t.type === filter)

  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopiedHash(hash)
      setTimeout(() => setCopiedHash(null), 2000)
    } catch (error) {
      console.error("[v0] Failed to copy hash:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    )
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
          <h1 className="text-xl font-bold text-foreground">Transactions</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-4 py-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full bg-card/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="transfer">Transfers</SelectItem>
              <SelectItem value="swap">Swaps</SelectItem>
              <SelectItem value="referral">Referrals</SelectItem>
              <SelectItem value="bonus">Bonuses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => {
              const amountDisplay = getAmountDisplay(transaction)

              return (
                <div
                  key={transaction._id}
                  className="rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-primary/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-black/30 p-2">{getTransactionIcon(transaction.type)}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold capitalize text-foreground">{transaction.type}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="break-all font-mono text-xs text-muted-foreground">
                            {transaction.transactionHash.slice(0, 10)}...{transaction.transactionHash.slice(-8)}
                          </p>
                          <button
                            onClick={() => copyHash(transaction.transactionHash)}
                            className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {copiedHash === transaction.transactionHash ? (
                              <CheckCircle2 className="h-3 w-3 text-success" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        {transaction.metadata?.direction && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {transaction.metadata.direction === "sent"
                              ? `To: ${transaction.metadata.recipientName}`
                              : `From: ${transaction.metadata.senderName}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${amountDisplay.color} flex items-center gap-1 justify-end`}>
                        {amountDisplay.showArrows ? (
                          <>
                            <ArrowLeftRight className="h-4 w-4" />
                            <span>
                              {amountDisplay.amount.toFixed(2)} {transaction.token.toUpperCase()}
                            </span>
                          </>
                        ) : (
                          <span>
                            {amountDisplay.sign}
                            {amountDisplay.amount.toFixed(2)} {transaction.token.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs capitalize ${getStatusColor(transaction.status)}`}>{transaction.status}</p>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-12 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground">No transactions found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
