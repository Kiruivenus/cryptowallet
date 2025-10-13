"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { useRouter } from "next/navigation"

export function WithdrawalActions({ withdrawalId }: { withdrawalId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, action }),
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("[v0] Withdrawal action error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => handleAction("approve")}
        disabled={loading}
        className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        onClick={() => handleAction("reject")}
        disabled={loading}
        className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
