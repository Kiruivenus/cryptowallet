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
        { error: "Your account is restricted from making withdrawals. Please contact support." },
        { status: 403 },
      )
    }

    const { token, amount, toAddress } = await request.json()

    if (!token || !amount || !toAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (amount < 10) {
      return NextResponse.json({ error: "Minimum withdrawal is $10" }, { status: 400 })
    }

    // Get settings for fee calculation
    const settings = await db.collection("appSettings").findOne({})
    const feePercentage = settings?.fees?.withdrawalPercentage || 0
    const fee = (amount * feePercentage) / 100
    const netAmount = amount - fee

    // Check balance
    if (!currentUser || (currentUser.balances?.[token] || 0) < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Deduct amount from user balance
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $inc: { [`balances.${token}`]: -amount },
        $set: { updatedAt: new Date() },
      },
    )

    // Create withdrawal request
    const withdrawalRequest = {
      userId: user._id,
      token,
      amount,
      fee,
      netAmount,
      toAddress,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("withdrawalRequests").insertOne(withdrawalRequest)

    // Create transaction record
    await db.collection("transactions").insertOne({
      userId: user._id,
      type: "withdrawal",
      token,
      amount,
      fee,
      status: "pending",
      transactionHash: generateTransactionHash(),
      toAddress,
      metadata: {
        withdrawalRequestId: result.insertedId,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "Withdrawal request submitted successfully",
        requestId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Withdrawal error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
