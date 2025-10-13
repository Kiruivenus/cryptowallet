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

    const { addressId, token, address, network } = await req.json()

    if (!addressId || !token || !address || !network) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    await db.collection("depositAddresses").updateOne(
      { _id: new ObjectId(addressId) },
      {
        $set: {
          token: token.toLowerCase(),
          address,
          network,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Edit address error:", error)
    return NextResponse.json({ error: "Failed to edit address" }, { status: 500 })
  }
}
