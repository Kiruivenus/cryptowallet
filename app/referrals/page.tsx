"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Copy, CheckCircle2, Users, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ReferralData {
  referralCode: string
  referralCount: number
  referralEarnings: number
  referrals: Array<{
    name: string
    email: string
    createdAt: string
    earned: number
  }>
}

export default function ReferralsPage() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      const response = await fetch("/api/referrals")
      const data = await response.json()
      if (data.referralData) {
        setReferralData(data.referralData)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch referral data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyReferralLink = async () => {
    if (!referralData) return

    const referralLink = `${window.location.origin}/register?ref=${referralData.referralCode}`
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("[v0] Failed to copy:", error)
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
          <h1 className="text-xl font-bold text-foreground">Referrals</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/50 bg-gradient-to-br from-primary/10 to-transparent p-4">
            <Users className="mb-2 h-5 w-5 text-primary" />
            <div className="text-2xl font-bold text-foreground">{referralData?.referralCount || 0}</div>
            <div className="text-xs text-muted-foreground">Referrals</div>
          </div>

          <div className="rounded-xl border border-border/50 bg-gradient-to-br from-success/10 to-transparent p-4">
            <DollarSign className="mb-2 h-5 w-5 text-success" />
            <div className="text-2xl font-bold text-foreground">
              ${referralData?.referralEarnings.toFixed(2) || "0.00"}
            </div>
            <div className="text-xs text-muted-foreground">Earned</div>
          </div>

          <div className="rounded-xl border border-border/50 bg-gradient-to-br from-accent/10 to-transparent p-4">
            <TrendingUp className="mb-2 h-5 w-5 text-accent" />
            <div className="text-2xl font-bold text-foreground">$2</div>
            <div className="text-xs text-muted-foreground">Per Ref</div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Your Referral Code</h2>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-border/50 bg-black/30 px-4 py-3">
              <p className="text-center text-2xl font-bold tracking-wider text-primary">{referralData?.referralCode}</p>
            </div>
            <Button
              onClick={copyReferralLink}
              variant="outline"
              size="icon"
              className="h-12 w-12 border-primary/20 bg-transparent"
            >
              {copied ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Share this code with friends to earn rewards when they deposit
          </p>
        </div>

        {/* How it Works */}
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">How it Works</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                1
              </span>
              <span>Share your referral code with friends</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                2
              </span>
              <span>They sign up using your code</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                3
              </span>
              <span>When they deposit $60 or more, you earn $2 USDT</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                4
              </span>
              <span>Rewards are credited instantly to your balance</span>
            </li>
          </ol>
        </div>

        {/* Referral List */}
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Your Referrals</h3>
          {referralData?.referrals && referralData.referrals.length > 0 ? (
            <div className="space-y-3">
              {referralData.referrals.map((referral, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-black/30 p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{referral.name}</p>
                    <p className="text-xs text-muted-foreground">{referral.email}</p>
                    <p className="text-xs text-muted-foreground">{new Date(referral.createdAt).toLocaleDateString()}</p>
                  </div>
                  {referral.earned > 0 && (
                    <div className="rounded-full bg-success/20 px-3 py-1 text-xs font-medium text-success">
                      +${referral.earned.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No referrals yet</p>
              <p className="text-xs text-muted-foreground">Start sharing your code to earn rewards</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
