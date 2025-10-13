import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, name, email, usdtBalance, usdcBalance } = await req.json()

    if (!userId || !name || !email || usdtBalance === undefined || usdcBalance === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    // Check if email is already taken by another user
    const existingUser = await db.collection("users").findOne({
      email,
      _id: { $ne: new ObjectId(userId) },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Update user
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          name,
          email,
          "balances.usdt": Number.parseFloat(usdtBalance),
          "balances.usdc": Number.parseFloat(usdcBalance),
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Edit user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
