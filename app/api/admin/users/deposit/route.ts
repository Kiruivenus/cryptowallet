import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { generateTransactionHash } from "@/lib/utils/hash"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, token, amount, type, note } = await request.json()

    if (!userId || !token || !amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    if (!["usdt", "usdc"].includes(token)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    if (!["deposit", "bonus"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $inc: { [`balances.${token}`]: amount },
        $set: { updatedAt: new Date() },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await db.collection("transactions").insertOne({
      userId: new ObjectId(userId),
      type: type, // Will be either "deposit" or "bonus"
      token,
      amount,
      status: "completed",
      transactionHash: generateTransactionHash(),
      metadata: {
        note: note || `Admin ${type}`,
        adminDeposit: true,
        adminId: user._id.toString(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true, message: "Funds deposited successfully" })
  } catch (error) {
    console.error("Admin deposit error:", error)
    return NextResponse.json({ error: "Failed to deposit funds" }, { status: 500 })
  }
}
