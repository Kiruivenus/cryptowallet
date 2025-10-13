import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hash = searchParams.get("hash")

    if (!hash) {
      return NextResponse.json({ error: "Transaction hash required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    const transaction = await db.collection("transactions").findOne({ transactionHash: hash })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Get user info for sender/receiver
    const user = await db.collection("users").findOne(
      { _id: transaction.userId },
      {
        projection: { email: 1, name: 1 },
      },
    )

    const transactionDetails = {
      transactionHash: transaction.transactionHash,
      type: transaction.type,
      token: transaction.token,
      amount: transaction.amount,
      status: transaction.status,
      createdAt: transaction.createdAt,
      sender: transaction.metadata?.senderEmail || user?.email,
      receiver: transaction.recipientEmail || transaction.toAddress,
    }

    return NextResponse.json({ transaction: transactionDetails })
  } catch (error) {
    console.error("[v0] Explorer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
