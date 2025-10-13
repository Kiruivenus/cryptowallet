import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/utils"
import { verifyPassword, hashPassword } from "@/lib/auth/password"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    // Get user with password
    const userWithPassword = await db.collection("users").findOne({ _id: new ObjectId(user._id) })

    if (!userWithPassword) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, userWithPassword.password)
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await db.collection("users").updateOne({ _id: new ObjectId(user._id) }, { $set: { password: hashedPassword } })

    return NextResponse.json({ message: "Password changed successfully" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Change password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
