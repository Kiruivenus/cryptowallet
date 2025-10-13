"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function AddAddressForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    token: "usdt",
    address: "",
    network: "TRC20",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/admin/deposit-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({ token: "usdt", address: "", network: "TRC20" })
        setIsOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error("[v0] Add address error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Add New Address
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Add Deposit Address</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Token</label>
          <select
            value={formData.token}
            onChange={(e) => setFormData({ ...formData, token: e.target.value })}
            className="w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-foreground"
          >
            <option value="usdt">USDT</option>
            <option value="usdc">USDC</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Network</label>
          <Input
            value={formData.network}
            onChange={(e) => setFormData({ ...formData, network: e.target.value })}
            placeholder="TRC20"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Address</label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter wallet address"
            required
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Address"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
