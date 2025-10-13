import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string
  name: string
  role: "user" | "admin"
  balances: {
    usdt: number
    usdc: number
  }
  referralCode: string
  referredBy?: string
  referralEarnings: number
  referralCount: number
  status: "active" | "banned" | "suspended" | "restricted"
  statusReason?: string
  statusUpdatedAt?: Date
  profilePicture?: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  referralStats?: {
    totalReferred: number
    totalEarned: number
  }
}

export interface Transaction {
  _id?: ObjectId
  userId: ObjectId
  type: "deposit" | "withdrawal" | "transfer" | "swap" | "referral"
  token: "usdt" | "usdc"
  amount: number
  fee?: number
  status: "pending" | "completed" | "rejected" | "processing"
  transactionHash: string
  fromAddress?: string
  toAddress?: string
  recipientId?: ObjectId
  recipientEmail?: string
  metadata?: any
  createdAt: Date
  updatedAt: Date
}

export interface DepositAddress {
  _id?: ObjectId
  address: string
  network: string
  isActive: boolean
  createdAt: Date
}

export interface WithdrawalRequest {
  _id?: ObjectId
  userId: ObjectId
  token: "usdt" | "usdc"
  amount: number
  fee: number
  netAmount: number
  toAddress: string
  status: "pending" | "approved" | "rejected" | "completed"
  transactionHash?: string
  adminNote?: string
  createdAt: Date
  updatedAt: Date
}

export interface AppSettings {
  _id?: ObjectId
  swapRates: {
    usdtToUsdc: number
    usdcToUsdt: number
  }
  fees: {
    withdrawalPercentage: number
    transferPercentage: number
  }
  bonuses: {
    firstDepositPercentage: number
    firstDepositMinAmount: number
    referralReward: number
    referralMinDeposit: number
  }
  updatedAt: Date
}
