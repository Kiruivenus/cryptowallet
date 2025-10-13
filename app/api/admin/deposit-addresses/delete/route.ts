import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(req: NextRequest) {
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

    await db.collection("depositAddresses").deleteOne({ _id: new ObjectId(addressId) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete address error:", error)
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}
