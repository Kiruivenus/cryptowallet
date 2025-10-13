import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/utils"
import Link from "next/link"
import { Users, Wallet, ArrowDownToLine, ArrowUpFromLine, Settings, TrendingUp } from "lucide-react"

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Portal</h1>
            <p className="text-xs text-muted-foreground">Manage your crypto platform</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              User View
            </Link>
            <Link href="/api/auth/logout" className="text-sm text-muted-foreground hover:text-foreground">
              Logout
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-foreground">Welcome, {user.name}</h2>
          <p className="text-sm text-muted-foreground">Manage all aspects of your crypto wallet platform</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/users"
            className="group rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-card/80"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-cyan-500/10 p-3">
                <Users className="h-6 w-6 text-cyan-500" />
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Users Management</h3>
            <p className="text-sm text-muted-foreground">View and manage all registered users</p>
          </Link>

          <Link
            href="/admin/withdrawals"
            className="group rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-card/80"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-orange-500/10 p-3">
                <ArrowUpFromLine className="h-6 w-6 text-orange-500" />
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Withdrawals</h3>
            <p className="text-sm text-muted-foreground">Approve or reject pending withdrawal requests</p>
          </Link>

          <Link
            href="/admin/deposit-addresses"
            className="group rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-card/80"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-green-500/10 p-3">
                <ArrowDownToLine className="h-6 w-6 text-green-500" />
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Deposit Addresses</h3>
            <p className="text-sm text-muted-foreground">Manage deposit address pool</p>
          </Link>

          <Link
            href="/admin/transactions"
            className="group rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-card/80"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-purple-500/10 p-3">
                <Wallet className="h-6 w-6 text-purple-500" />
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">All Transactions</h3>
            <p className="text-sm text-muted-foreground">View complete transaction history</p>
          </Link>

          <Link
            href="/admin/settings"
            className="group rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-card/80"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-blue-500/10 p-3">
                <Settings className="h-6 w-6 text-blue-500" />
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Platform Settings</h3>
            <p className="text-sm text-muted-foreground">Configure fees, rates, and bonuses</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
