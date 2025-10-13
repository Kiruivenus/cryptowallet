import Link from "next/link"
import { ArrowRight, Shield, Zap, Users, TrendingUp, Lock, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WalletLogo } from "@/components/wallet-logo"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <WalletLogo className="h-10 w-10" />
            <span className="text-xl font-bold">CryptoWallet</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-primary">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary text-black hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
            Next-Generation Digital Wallet
          </div>
          <h1 className="mb-6 text-balance text-5xl font-bold leading-tight md:text-7xl">
            Your Gateway to the{" "}
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Future of Finance
            </span>
          </h1>
          <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
            Experience the next generation of digital asset management. Securely store, swap, and transfer USDT and USDC
            with lightning-fast transactions, bank-level security, and zero hidden fees. Join thousands of users who
            trust CryptoWallet for their crypto needs.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="bg-primary text-black hover:bg-primary/90">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-primary/10 to-cyan-500/10 p-8 backdrop-blur-xl">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/50 p-6 backdrop-blur-sm">
                <div className="mb-2 text-sm text-muted-foreground">Total Balance</div>
                <div className="text-3xl font-bold">$12,450.00</div>
                <div className="mt-2 text-sm text-green-400">+12.5% this month</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/50 p-6 backdrop-blur-sm">
                <div className="mb-2 text-sm text-muted-foreground">USDT Balance</div>
                <div className="text-3xl font-bold">8,230.50</div>
                <div className="mt-2 text-sm text-primary">Available</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/50 p-6 backdrop-blur-sm">
                <div className="mb-2 text-sm text-muted-foreground">USDC Balance</div>
                <div className="text-3xl font-bold">4,219.50</div>
                <div className="mt-2 text-sm text-primary">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">Why Choose CryptoWallet?</h2>
          <p className="text-lg text-muted-foreground">Everything you need to manage your digital assets</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Bank-Level Security</h3>
            <p className="text-muted-foreground">
              Your assets are protected with industry-leading encryption and multi-layer security protocols.
            </p>
          </div>

          <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Instant Transactions</h3>
            <p className="text-muted-foreground">
              Send, receive, and swap your crypto instantly with near-zero latency and minimal fees.
            </p>
          </div>

          <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Referral Rewards</h3>
            <p className="text-muted-foreground">
              Earn rewards by inviting friends. Both you and your referrals get bonus credits.
            </p>
          </div>

          <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Real-Time Swaps</h3>
            <p className="text-muted-foreground">
              Swap between USDT and USDC instantly with competitive rates and transparent pricing.
            </p>
          </div>

          <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Full Control</h3>
            <p className="text-muted-foreground">
              You own your assets. No hidden fees, no surprises. Complete transparency at every step.
            </p>
          </div>

          <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Multi-Asset Support</h3>
            <p className="text-muted-foreground">
              Manage multiple cryptocurrencies in one place. USDT and USDC support with more coming soon.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/20 to-cyan-500/20 p-12 text-center backdrop-blur-xl md:p-20">
          <div className="relative z-10">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of users managing their digital assets with CryptoWallet
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-primary text-black hover:bg-primary/90">
                Create Your Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-cyan-500/10 blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 CryptoWallet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
