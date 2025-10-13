"use client"

import { useState } from "react"
import { MoreVertical, Edit, Trash2, Power } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface AddressActionsProps {
  address: {
    _id: string
    token: string
    address: string
    network: string
    isActive: boolean
  }
}

export function AddressActions({ address }: AddressActionsProps) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [editData, setEditData] = useState({
    token: address.token,
    address: address.address,
    network: address.network,
  })

  const handleToggleActive = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/deposit-addresses/toggle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: address._id }),
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to toggle address status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/deposit-addresses/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: address._id,
          ...editData,
        }),
      })

      if (res.ok) {
        setIsEditOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to edit address:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/deposit-addresses/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: address._id }),
      })

      if (res.ok) {
        setIsDeleteOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to delete address:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleActive} disabled={isLoading}>
            <Power className="mr-2 h-4 w-4" />
            {address.isActive ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-red-500">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Address
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deposit Address</DialogTitle>
            <DialogDescription>Update the deposit address details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-token">Token</Label>
              <Select value={editData.token} onValueChange={(value) => setEditData({ ...editData, token: value })}>
                <SelectTrigger id="edit-token">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usdt">USDT</SelectItem>
                  <SelectItem value="usdc">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editData.address}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                placeholder="Enter wallet address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-network">Network</Label>
              <Input
                id="edit-network"
                value={editData.network}
                onChange={(e) => setEditData({ ...editData, network: e.target.value })}
                placeholder="e.g., TRC20, ERC20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deposit Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <p className="text-sm font-medium text-foreground">{address.token.toUpperCase()}</p>
            <p className="font-mono text-xs text-muted-foreground">{address.address}</p>
            <p className="text-xs text-muted-foreground">{address.network}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
