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

    // Get all active deposit addresses
    const addresses = await db.collection("depositAddresses").find({ isActive: true }).toArray()

    if (addresses.length === 0) {
      return NextResponse.json({ error: "No deposit addresses available. Please contact support." }, { status: 404 })
    }

    // Select a random address
    const randomAddress = addresses[Math.floor(Math.random() * addresses.length)]

    return NextResponse.json({
      address: randomAddress.address,
      network: randomAddress.network,
    })
  } catch (error) {
    console.error("[v0] Get deposit address error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
