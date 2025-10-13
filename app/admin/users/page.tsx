import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { UserActions } from "@/components/admin/user-actions"

export default async function AdminUsersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  const client = await clientPromise
  const db = client.db("cryptowallet")

  const usersData = await db.collection("users").find({}).sort({ createdAt: -1 }).project({ password: 0 }).toArray()

  const users = usersData.map((u) => ({
    ...u,
    _id: u._id.toString(),
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Link href="/admin/dashboard" className="rounded-lg p-2 hover:bg-white/5">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Users Management</h1>
            <p className="text-xs text-muted-foreground">Total users: {users.length}</p>
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">USDT Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">USDC Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Referrals</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          u.role === "admin" ? "bg-purple-500/10 text-purple-500" : "bg-cyan-500/10 text-cyan-500"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">${(u.balances?.usdt || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-foreground">${(u.balances?.usdc || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{u.referralStats?.totalReferred || 0}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          u.status === "active"
                            ? "bg-green-500/10 text-green-500"
                            : u.status === "banned"
                              ? "bg-red-500/10 text-red-500"
                              : u.status === "suspended"
                                ? "bg-orange-500/10 text-orange-500"
                                : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {u.status || "active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <UserActions user={u} />
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
