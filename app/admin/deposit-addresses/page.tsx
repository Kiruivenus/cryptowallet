import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AddAddressForm } from "@/components/admin/add-address-form"
import { AddressActions } from "@/components/admin/address-actions"

export default async function AdminDepositAddressesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  const client = await clientPromise
  const db = client.db("cryptowallet")

  const addressesData = await db.collection("depositAddresses").find({}).sort({ createdAt: -1 }).toArray()
  const addresses = addressesData.map((addr) => ({
    _id: addr._id.toString(),
    token: addr.token || "usdt", // Default to usdt if token field is missing
    address: addr.address,
    network: addr.network,
    isActive: addr.isActive ?? true,
    createdAt: addr.createdAt ? addr.createdAt.toISOString() : new Date().toISOString(),
  }))

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Link href="/admin/dashboard" className="rounded-lg p-2 hover:bg-white/5">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Deposit Addresses</h1>
            <p className="text-xs text-muted-foreground">Total addresses: {addresses.length}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <AddAddressForm />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/50 bg-black/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Token</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Address</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Network</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Added</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {addresses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No deposit addresses added yet. Click "Add New Address" to get started.
                    </td>
                  </tr>
                ) : (
                  addresses.map((addr) => (
                    <tr key={addr._id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-foreground">{addr.token.toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-sm text-foreground">{addr.address}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{addr.network}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            addr.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {addr.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(addr.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <AddressActions address={addr} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
