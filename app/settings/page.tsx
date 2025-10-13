import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/utils"
import { HamburgerMenu } from "@/components/hamburger-menu"
import { ProfileForm } from "@/components/profile-form"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
            <p className="text-xs text-muted-foreground">Manage your account</p>
          </div>
          <HamburgerMenu />
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-4 py-6">
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Account Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium text-foreground">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="text-sm font-mono text-foreground">{user._id.toString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="text-sm font-medium text-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Referral Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Your Referral Code</p>
              <p className="text-sm font-mono font-medium text-foreground">{user.referralCode}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Referrals</p>
              <p className="text-sm font-medium text-foreground">{user.referralCount || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Earnings</p>
              <p className="text-sm font-medium text-green-500">${(user.referralEarnings || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <ProfileForm />

        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Account Status</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Account Status</span>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                user.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              }`}
            >
              {user.isActive ? "Active" : "Disabled"}
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
