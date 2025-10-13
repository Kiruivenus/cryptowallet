import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { WithdrawalActions } from "@/components/admin/withdrawal-actions"

export default async function AdminWithdrawalsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  const client = await clientPromise
  const db = client.db("cryptowallet")

  const withdrawalsData = await db
    .collection("withdrawalRequests")
    .aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $sort: { createdAt: -1 } },
    ])
    .toArray()

  const withdrawals = withdrawalsData.map((w) => ({
    ...w,
    _id: w._id.toString(),
    userId: w.userId.toString(),
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt?.toISOString() || w.createdAt.toISOString(),
    user: {
      ...w.user,
      _id: w.user._id.toString(),
    },
  }))

  const pending = withdrawals.filter((w) => w.status === "pending")

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Link href="/admin/dashboard" className="rounded-lg p-2 hover:bg-white/5">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Withdrawal Requests</h1>
            <p className="text-xs text-muted-foreground">{pending.length} pending requests</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {withdrawals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/50 p-12 text-center backdrop-blur-sm">
            <p className="text-lg font-medium text-foreground">No withdrawal requests yet</p>
            <p className="text-sm text-muted-foreground">Withdrawal requests will appear here</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border/50 bg-black/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Token</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Fee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Address</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {withdrawals.map((w) => (
                    <tr key={w._id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{w.user.name}</p>
                          <p className="text-xs text-muted-foreground">{w.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-foreground">{w.token.toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">${w.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">${(w.fee || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <p className="max-w-xs truncate text-xs font-mono text-muted-foreground">{w.toAddress}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            w.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : w.status === "approved"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {w.status === "pending" && <WithdrawalActions withdrawalId={w._id} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
