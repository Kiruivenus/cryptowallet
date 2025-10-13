import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { generateTransactionHash } from "@/lib/utils/hash"

// Get all withdrawal requests
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    const withdrawals = await db
      .collection("withdrawalRequests")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            "user.password": 0,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    const serializedWithdrawals = withdrawals.map((w) => ({
      _id: w._id.toString(),
      userId: w.userId.toString(),
      token: w.token,
      amount: w.amount,
      fee: w.fee || 0,
      netAmount: w.netAmount || w.amount,
      toAddress: w.toAddress, // Fixed: was 'address', now 'toAddress'
      status: w.status,
      transactionHash: w.transactionHash || null,
      adminNote: w.adminNote || null,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt?.toISOString() || w.createdAt.toISOString(),
      user: {
        _id: w.user._id.toString(),
        email: w.user.email,
        name: w.user.name,
      },
    }))

    console.log("[v0] Fetched withdrawals:", serializedWithdrawals.length)
    return NextResponse.json({ withdrawals: serializedWithdrawals })
  } catch (error) {
    console.error("[v0] Get withdrawals error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Approve or reject withdrawal
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { withdrawalId, action, transactionHash, adminNote } = await request.json()

    if (!withdrawalId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    const withdrawal = await db.collection("withdrawalRequests").findOne({ _id: new ObjectId(withdrawalId) })

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 })
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json({ error: "Withdrawal already processed" }, { status: 400 })
    }

    const txHash = transactionHash || generateTransactionHash()

    if (action === "approve") {
      // Update withdrawal request
      await db.collection("withdrawalRequests").updateOne(
        { _id: new ObjectId(withdrawalId) },
        {
          $set: {
            status: "approved",
            transactionHash: txHash,
            adminNote,
            updatedAt: new Date(),
          },
        },
      )

      // Update transaction
      await db.collection("transactions").updateOne(
        { "metadata.withdrawalRequestId": new ObjectId(withdrawalId) },
        {
          $set: {
            status: "completed",
            transactionHash: txHash,
            updatedAt: new Date(),
          },
        },
      )
    } else {
      // Reject - refund the amount
      await db.collection("users").updateOne(
        { _id: new ObjectId(withdrawal.userId) },
        {
          $inc: { [`balances.${withdrawal.token}`]: withdrawal.amount },
          $set: { updatedAt: new Date() },
        },
      )

      // Update withdrawal request
      await db.collection("withdrawalRequests").updateOne(
        { _id: new ObjectId(withdrawalId) },
        {
          $set: {
            status: "rejected",
            adminNote,
            updatedAt: new Date(),
          },
        },
      )

      // Update transaction
      await db.collection("transactions").updateOne(
        { "metadata.withdrawalRequestId": new ObjectId(withdrawalId) },
        {
          $set: {
            status: "rejected",
            updatedAt: new Date(),
          },
        },
      )
    }

    return NextResponse.json({
      message: `Withdrawal ${action === "approve" ? "approved" : "rejected"} successfully`,
    })
  } catch (error) {
    console.error("[v0] Update withdrawal error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
