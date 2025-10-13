"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export function ProfileForm() {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password")
      }

      setSuccess("Password changed successfully")
      setIsChangingPassword(false)
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isChangingPassword) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Security</h2>
        <Button onClick={() => setIsChangingPassword(true)} variant="outline" className="w-full">
          Change Password
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Change Password</h2>
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input id="currentPassword" name="currentPassword" type="password" required className="bg-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input id="newPassword" name="newPassword" type="password" required className="bg-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required className="bg-input" />
        </div>

        {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        {success && <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-500">{success}</div>}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Changing..." : "Change Password"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsChangingPassword(false)
              setError("")
              setSuccess("")
            }}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
