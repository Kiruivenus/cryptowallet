"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreVertical, Ban, Pause, AlertTriangle, Edit, CheckCircle, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserActionsProps {
  user: any
}

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [statusAction, setStatusAction] = useState<"banned" | "suspended" | "restricted" | "active">("banned")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    usdtBalance: user.balances?.usdt || 0,
    usdcBalance: user.balances?.usdc || 0,
  })

  const [statusForm, setStatusForm] = useState({
    reason: "",
  })

  const [depositForm, setDepositForm] = useState({
    token: "usdt",
    amount: "",
    type: "deposit",
    note: "",
  })

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/users/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          ...editForm,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update user")
      }

      setIsEditOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          status: statusAction,
          reason: statusForm.reason,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update user status")
      }

      setIsStatusOpen(false)
      setStatusForm({ reason: "" })
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/users/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          token: depositForm.token,
          amount: Number.parseFloat(depositForm.amount),
          type: depositForm.type,
          note: depositForm.note,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to deposit funds")
      }

      setIsDepositOpen(false)
      setDepositForm({ token: "usdt", amount: "", type: "deposit", note: "" })
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openStatusDialog = (action: "banned" | "suspended" | "restricted" | "active") => {
    setStatusAction(action)
    setIsStatusOpen(true)
    setError("")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setIsDepositOpen(true)}>
            <DollarSign className="mr-2 h-4 w-4 text-green-500" />
            Deposit Funds
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
          {user.status !== "active" && (
            <DropdownMenuItem onClick={() => openStatusDialog("active")}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Activate
            </DropdownMenuItem>
          )}
          {user.status !== "banned" && (
            <DropdownMenuItem onClick={() => openStatusDialog("banned")}>
              <Ban className="mr-2 h-4 w-4 text-red-500" />
              Ban User
            </DropdownMenuItem>
          )}
          {user.status !== "suspended" && (
            <DropdownMenuItem onClick={() => openStatusDialog("suspended")}>
              <Pause className="mr-2 h-4 w-4 text-orange-500" />
              Suspend User
            </DropdownMenuItem>
          )}
          {user.status !== "restricted" && (
            <DropdownMenuItem onClick={() => openStatusDialog("restricted")}>
              <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
              Restrict User
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>Add funds to {user.name}'s account</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <Label htmlFor="token">Token</Label>
              <Select
                value={depositForm.token}
                onValueChange={(value) => setDepositForm({ ...depositForm, token: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usdt">USDT</SelectItem>
                  <SelectItem value="usdc">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={depositForm.type}
                onValueChange={(value) => setDepositForm({ ...depositForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={depositForm.amount}
                onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                value={depositForm.note}
                onChange={(e) => setDepositForm({ ...depositForm, note: e.target.value })}
                placeholder="Reason for deposit..."
                rows={2}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Processing..." : "Deposit Funds"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDepositOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and balances</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="usdtBalance">USDT Balance</Label>
              <Input
                id="usdtBalance"
                type="number"
                step="0.01"
                value={editForm.usdtBalance}
                onChange={(e) => setEditForm({ ...editForm, usdtBalance: Number.parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="usdcBalance">USDC Balance</Label>
              <Input
                id="usdcBalance"
                type="number"
                step="0.01"
                value={editForm.usdcBalance}
                onChange={(e) => setEditForm({ ...editForm, usdcBalance: Number.parseFloat(e.target.value) })}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Updating..." : "Update User"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{statusAction} User</DialogTitle>
            <DialogDescription>
              {statusAction === "active"
                ? "Reactivate this user account"
                : `${statusAction} this user account. This action can be reversed later.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStatusChange} className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason {statusAction !== "active" && "(Required)"}</Label>
              <Textarea
                id="reason"
                value={statusForm.reason}
                onChange={(e) => setStatusForm({ reason: e.target.value })}
                placeholder={`Reason for ${statusAction}...`}
                required={statusAction !== "active"}
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                variant={statusAction === "active" ? "default" : "destructive"}
                className="flex-1"
              >
                {loading ? "Processing..." : `${statusAction === "active" ? "Activate" : statusAction} User`}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsStatusOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
