import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/utils"
import { BalanceCard } from "@/components/balance-card"
import { QuickActions } from "@/components/quick-actions"
import { PromoBanner } from "@/components/promo-banner"
import { HamburgerMenu } from "@/components/hamburger-menu"
import clientPromise from "@/lib/mongodb"
import { ArrowUpRight, ArrowDownLeft, Repeat, Send } from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const totalBalance = (user.balances?.usdt || 0) + (user.balances?.usdc || 0)

  const client = await clientPromise
  const db = client.db("cryptowallet")

  const transactions = await db
    .collection("transactions")
    .find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray()

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">CryptoWallet</h1>
            <p className="text-xs text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          <HamburgerMenu />
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-4 py-6">
        <BalanceCard
          totalBalance={totalBalance}
          usdtBalance={user.balances?.usdt || 0}
          usdcBalance={user.balances?.usdc || 0}
        />

        <QuickActions />

        <PromoBanner />

        <div className="rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Recent Activity</h3>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">No recent transactions</p>
              <p className="text-xs text-muted-foreground">Your activity will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const getIcon = () => {
                  switch (tx.type) {
                    case "deposit":
                      return <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    case "withdrawal":
                      return <ArrowUpRight className="h-4 w-4 text-red-500" />
                    case "swap":
                      return <Repeat className="h-4 w-4 text-blue-500" />
                    case "transfer":
                      return <Send className="h-4 w-4 text-purple-500" />
                    default:
                      return <ArrowDownLeft className="h-4 w-4 text-cyan-500" />
                  }
                }

                const getColor = () => {
                  switch (tx.type) {
                    case "deposit":
                    case "referral":
                      return "text-green-500"
                    case "withdrawal":
                      return "text-red-500"
                    default:
                      return "text-foreground"
                  }
                }

                return (
                  <div key={tx._id.toString()} className="flex items-center justify-between rounded-lg bg-black/20 p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-white/5 p-2">{getIcon()}</div>
                      <div>
                        <p className="text-sm font-medium capitalize text-foreground">{tx.type}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${getColor()}`}>
                        {tx.type === "withdrawal" || tx.type === "transfer" ? "-" : "+"}${tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.token.toUpperCase()}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
