import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AdminTransactionsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  const client = await clientPromise
  const db = client.db("cryptowallet")

  const transactions = await db
    .collection("transactions")
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
      { $limit: 100 },
    ])
    .toArray()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Link href="/admin/dashboard" className="rounded-lg p-2 hover:bg-white/5">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">All Transactions</h1>
            <p className="text-xs text-muted-foreground">Latest 100 transactions</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/50 bg-black/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Token</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transactions.map((tx) => (
                  <tr key={tx._id.toString()} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.user.name}</p>
                        <p className="text-xs text-muted-foreground">{tx.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          tx.type === "deposit"
                            ? "bg-green-500/10 text-green-500"
                            : tx.type === "withdrawal"
                              ? "bg-orange-500/10 text-orange-500"
                              : tx.type === "transfer_sent"
                                ? "bg-red-500/10 text-red-500"
                                : tx.type === "transfer_received"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : "bg-purple-500/10 text-purple-500"
                        }`}
                      >
                        {tx.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{tx.token.toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">${tx.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          tx.status === "completed"
                            ? "bg-green-500/10 text-green-500"
                            : tx.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="max-w-xs truncate font-mono text-xs text-muted-foreground">{tx.hash}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
