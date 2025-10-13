import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
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
        { error: "Your account is restricted from making transfers. Please contact support." },
        { status: 403 },
      )
    }

    const { recipientType, recipient, token, amount } = await request.json()

    if (!recipientType || !recipient || !token || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Get settings for fee calculation
    const settings = await db.collection("appSettings").findOne({})
    const feePercentage = settings?.fees?.transferPercentage || 0
    const fee = (amount * feePercentage) / 100
    const totalCost = amount + fee

    // Check sender balance
    if (!currentUser || (currentUser.balances?.[token] || 0) < totalCost) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Find recipient
    let recipientUser
    if (recipientType === "email") {
      recipientUser = await db.collection("users").findOne({ email: recipient })
    } else {
      recipientUser = await db.collection("users").findOne({ _id: new ObjectId(recipient) })
    }

    if (!recipientUser) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
    }

    if (recipientUser._id.toString() === user._id.toString()) {
      return NextResponse.json({ error: "Cannot send to yourself" }, { status: 400 })
    }

    const transactionHash = generateTransactionHash()

    // Perform transfer
    const session = client.startSession()

    try {
      await session.withTransaction(async () => {
        // Deduct from sender (amount + fee)
        await db.collection("users").updateOne(
          { _id: user._id },
          {
            $inc: { [`balances.${token}`]: -totalCost },
            $set: { updatedAt: new Date() },
          },
          { session },
        )

        // Add to recipient (only amount, not fee)
        await db.collection("users").updateOne(
          { _id: recipientUser._id },
          {
            $inc: { [`balances.${token}`]: amount },
            $set: { updatedAt: new Date() },
          },
          { session },
        )

        // Create sender transaction
        await db.collection("transactions").insertOne(
          {
            userId: user._id,
            type: "transfer",
            token,
            amount: -totalCost,
            fee,
            status: "completed",
            transactionHash,
            recipientId: recipientUser._id,
            recipientEmail: recipientUser.email,
            metadata: {
              direction: "sent",
              recipientName: recipientUser.name,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { session },
        )

        // Create recipient transaction
        await db.collection("transactions").insertOne(
          {
            userId: recipientUser._id,
            type: "transfer",
            token,
            amount,
            status: "completed",
            transactionHash,
            fromAddress: user.email,
            metadata: {
              direction: "received",
              senderName: user.name,
              senderEmail: user.email,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { session },
        )
      })
    } finally {
      await session.endSession()
    }

    return NextResponse.json(
      {
        message: "Transfer completed successfully",
        transactionHash,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Transfer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
