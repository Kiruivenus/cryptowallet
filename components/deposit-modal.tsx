"use client"

import { useState, useEffect } from "react"
import { X, Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import QRCode from "qrcode"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [depositAddress, setDepositAddress] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchDepositAddress()
    }
  }, [isOpen])

  const fetchDepositAddress = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/deposit/address")
      const data = await response.json()

      if (data.address) {
        setDepositAddress(data.address)
        const qrUrl = await QRCode.toDataURL(data.address, {
          width: 300,
          margin: 2,
          color: {
            dark: "#00d4ff",
            light: "#000000",
          },
        })
        setQrCodeUrl(qrUrl)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch deposit address:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("[v0] Failed to copy:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-primary/20 bg-black/95 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Deposit USDT</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Generating deposit address...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="rounded-2xl border-4 border-primary/20 bg-white p-4">
                {qrCodeUrl && <img src={qrCodeUrl || "/placeholder.svg"} alt="Deposit QR Code" className="h-64 w-64" />}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Deposit Address</label>
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg border border-border/50 bg-input px-4 py-3">
                  <p className="break-all text-sm font-mono text-foreground">{depositAddress}</p>
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="icon"
                  className="h-auto border-primary/20 hover:border-primary/50 bg-transparent"
                >
                  {copied ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
              <h3 className="mb-2 text-sm font-semibold text-warning">Important Notes:</h3>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Only send USDT to this address</li>
                <li>• Deposits are verified automatically every 5 minutes</li>
                <li>• Minimum deposit: $10</li>
                <li>• Network: TRC20 (Tron)</li>
              </ul>
            </div>

            <Button onClick={onClose} className="w-full glow-hover">
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
