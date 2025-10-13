import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/utils"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SettingsForm } from "@/components/admin/settings-form"
import clientPromise from "@/lib/mongodb"

export default async function AdminSettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  const client = await clientPromise
  const db = client.db("cryptowallet")

  let settings = await db.collection("appSettings").findOne({})

  if (!settings) {
    // Create default settings with correct structure
    settings = {
      swapRates: {
        usdtToUsdc: 1.0,
        usdcToUsdt: 1.0,
      },
      fees: {
        withdrawalPercentage: 2,
        transferPercentage: 0.5,
      },
      bonuses: {
        firstDepositPercentage: 30,
        firstDepositMinAmount: 50,
        referralReward: 2,
        referralMinDeposit: 60,
      },
      updatedAt: new Date(),
    }
    await db.collection("appSettings").insertOne(settings)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Link href="/admin/dashboard" className="rounded-lg p-2 hover:bg-white/5">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Platform Settings</h1>
            <p className="text-xs text-muted-foreground">Configure fees, rates, and bonuses</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <SettingsForm settings={JSON.parse(JSON.stringify(settings))} />
      </main>
    </div>
  )
}
