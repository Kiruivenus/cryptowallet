import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/utils"
import { Button } from "@/components/ui/button"
import { Gift, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import clientPromise from "@/lib/mongodb"

export default async function FirstDepositInstructionsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch app settings to get the first deposit bonus details
  const client = await clientPromise
  const db = client.db("cryptowallet")
  const settings = await db.collection("appSettings").findOne({})

  const minAmount = settings?.bonuses?.firstDepositMinAmount || 10
  const bonusPercentage = settings?.bonuses?.firstDepositPercentage || 30

  // Check if user has already received first deposit bonus
  const hasReceivedBonus = await db.collection("transactions").findOne({
    userId: user._id,
    type: "deposit",
    description: { $regex: /first deposit bonus/i },
  })

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-foreground">First Deposit Bonus</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-4 py-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/50 bg-gradient-to-br from-primary/20 to-accent/20 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-black/30 p-4 backdrop-blur-sm">
              <Gift className="h-12 w-12 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Get {bonusPercentage}% USDC Bonus!</h2>
            <p className="text-sm text-muted-foreground">
              Make your first deposit and receive an instant {bonusPercentage}% bonus in USDC on your deposit amount
            </p>
          </div>
        </div>

        {/* Status Card */}
        {hasReceivedBonus ? (
          <div className="rounded-2xl border border-green-500/50 bg-green-500/10 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-semibold text-foreground">Bonus Already Claimed</h3>
                <p className="text-sm text-muted-foreground">You have already received your first deposit bonus</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
            <h3 className="mb-3 text-sm font-semibold text-foreground">How to Claim Your Bonus</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Minimum Deposit Required</p>
                  <p className="text-xs text-muted-foreground">
                    Deposit at least ${minAmount} USDT or USDC to qualify for the bonus
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Complete Your Deposit</p>
                  <p className="text-xs text-muted-foreground">
                    Send your crypto to the provided deposit address and wait for confirmation
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Receive Your Bonus</p>
                  <p className="text-xs text-muted-foreground">
                    Your {bonusPercentage}% bonus in USDC will be automatically credited to your account
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Terms & Conditions</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>This bonus is only available for your first deposit</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Minimum deposit amount: ${minAmount}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Bonus is calculated as {bonusPercentage}% of your deposit amount and credited in USDC</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Bonus will be credited automatically after deposit confirmation</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>One bonus per user account</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        {!hasReceivedBonus && (
          <Link href="/deposit" className="block">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
              Do Task
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </main>
    </div>
  )
}
