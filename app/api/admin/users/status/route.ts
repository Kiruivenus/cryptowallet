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

    const { userId, status, reason } = await req.json()

    if (!userId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["active", "banned", "suspended", "restricted"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    // Update user status
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          status,
          statusReason: reason || "",
          statusUpdatedAt: new Date(),
          isActive: status === "active",
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user status error:", error)
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
  }
}
