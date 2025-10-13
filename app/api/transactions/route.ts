import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    const transactions = await db
      .collection("transactions")
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[v0] Get transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
