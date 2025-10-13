import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"
import { generateTransactionHash } from "@/lib/utils/hash"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    const currentUser = await db.collection("users").findOne({ _id: user._id })
    const userStatus = currentUser?.status || "active"

    if (userStatus === "restricted") {
      return NextResponse.json(
        { error: "Your account is restricted from making swaps. Please contact support." },
        { status: 403 },
      )
    }

    const { fromToken, toToken, amount } = await request.json()

    if (!fromToken || !toToken || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (fromToken === toToken) {
      return NextResponse.json({ error: "Cannot swap same token" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Check user balance
    if (!currentUser || (currentUser.balances?.[fromToken] || 0) < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Get swap rates
    const settings = await db.collection("appSettings").findOne({})
    const swapRates = settings?.swapRates || { usdtToUsdc: 1.0, usdcToUsdt: 1.0 }

    // Calculate swap amount
    const rate = fromToken === "usdt" ? swapRates.usdtToUsdc : swapRates.usdcToUsdt
    const receivedAmount = amount * rate

    // Perform swap
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $inc: {
          [`balances.${fromToken}`]: -amount,
          [`balances.${toToken}`]: receivedAmount,
        },
        $set: { updatedAt: new Date() },
      },
    )

    // Create transaction record
    await db.collection("transactions").insertOne({
      userId: user._id,
      type: "swap",
      token: fromToken,
      amount: -amount,
      status: "completed",
      transactionHash: generateTransactionHash(),
      metadata: {
        fromToken,
        toToken,
        fromAmount: amount,
        toAmount: receivedAmount,
        rate,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Get updated balances
    const updatedUser = await db.collection("users").findOne({ _id: user._id })

    return NextResponse.json({
      message: "Swap completed successfully",
      balances: updatedUser?.balances || { usdt: 0, usdc: 0 },
    })
  } catch (error) {
    console.error("[v0] Swap error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
