"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export function SettingsForm({ settings }: { settings: any }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    withdrawalPercentage: settings.fees.withdrawalPercentage,
    transferPercentage: settings.fees.transferPercentage,
    swapRateUsdtToUsdc: settings.swapRates.usdtToUsdc,
    swapRateUsdcToUsdt: settings.swapRates.usdcToUsdt,
    firstDepositPercentage: settings.bonuses.firstDepositPercentage,
    firstDepositMinAmount: settings.bonuses.firstDepositMinAmount,
    referralReward: settings.bonuses.referralReward,
    referralMinDeposit: settings.bonuses.referralMinDeposit,
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fees: {
            withdrawalPercentage: Number.parseFloat(formData.withdrawalPercentage.toString()),
            transferPercentage: Number.parseFloat(formData.transferPercentage.toString()),
          },
          swapRates: {
            usdtToUsdc: Number.parseFloat(formData.swapRateUsdtToUsdc.toString()),
            usdcToUsdt: Number.parseFloat(formData.swapRateUsdcToUsdt.toString()),
          },
          bonuses: {
            firstDepositPercentage: Number.parseFloat(formData.firstDepositPercentage.toString()),
            firstDepositMinAmount: Number.parseFloat(formData.firstDepositMinAmount.toString()),
            referralReward: Number.parseFloat(formData.referralReward.toString()),
            referralMinDeposit: Number.parseFloat(formData.referralMinDeposit.toString()),
          },
        }),
      })

      if (res.ok) {
        alert("Settings saved successfully!")
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("[v0] Settings update error:", error)
      alert("Failed to save settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
    >
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Withdrawal Fees (%)</h3>
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Withdrawal Fee Percentage</label>
            <Input
              type="number"
              step="0.01"
              value={formData.withdrawalPercentage}
              onChange={(e) => setFormData({ ...formData, withdrawalPercentage: Number.parseFloat(e.target.value) })}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">Applied to all withdrawals</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Transfer Fees (%)</h3>
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Transfer Fee Percentage</label>
            <Input
              type="number"
              step="0.01"
              value={formData.transferPercentage}
              onChange={(e) => setFormData({ ...formData, transferPercentage: Number.parseFloat(e.target.value) })}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">Applied to peer-to-peer transfers</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Swap Exchange Rates</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">USDT → USDC Rate</label>
            <Input
              type="number"
              step="0.0001"
              value={formData.swapRateUsdtToUsdc}
              onChange={(e) => setFormData({ ...formData, swapRateUsdtToUsdc: Number.parseFloat(e.target.value) })}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">USDC → USDT Rate</label>
            <Input
              type="number"
              step="0.0001"
              value={formData.swapRateUsdcToUsdt}
              onChange={(e) => setFormData({ ...formData, swapRateUsdcToUsdt: Number.parseFloat(e.target.value) })}
              required
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Bonuses</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">First Deposit Bonus (%)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.firstDepositPercentage}
              onChange={(e) => setFormData({ ...formData, firstDepositPercentage: Number.parseFloat(e.target.value) })}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">First Deposit Min Amount ($)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.firstDepositMinAmount}
              onChange={(e) => setFormData({ ...formData, firstDepositMinAmount: Number.parseFloat(e.target.value) })}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Referral Reward ($)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.referralReward}
              onChange={(e) => setFormData({ ...formData, referralReward: Number.parseFloat(e.target.value) })}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Referral Min Deposit ($)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.referralMinDeposit}
              onChange={(e) => setFormData({ ...formData, referralMinDeposit: Number.parseFloat(e.target.value) })}
              required
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  )
}
