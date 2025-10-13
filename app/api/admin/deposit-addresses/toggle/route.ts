import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { addressId } = await req.json()

    if (!addressId) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    // Get current status
    const address = await db.collection("depositAddresses").findOne({ _id: new ObjectId(addressId) })

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // Toggle the status
    await db.collection("depositAddresses").updateOne(
      { _id: new ObjectId(addressId) },
      {
        $set: {
          isActive: !address.isActive,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Toggle address status error:", error)
    return NextResponse.json({ error: "Failed to toggle address status" }, { status: 500 })
  }
}
