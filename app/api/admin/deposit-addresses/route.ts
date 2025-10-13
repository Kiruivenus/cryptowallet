import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"

// Get all deposit addresses
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    const addresses = await db.collection("depositAddresses").find().sort({ createdAt: -1 }).toArray()

    const serializedAddresses = addresses.map((addr) => ({
      _id: addr._id.toString(),
      address: addr.address,
      network: addr.network,
      token: addr.token,
      isActive: addr.isActive,
      createdAt: addr.createdAt.toISOString(),
    }))

    return NextResponse.json({ addresses: serializedAddresses })
  } catch (error) {
    console.error("[v0] Get deposit addresses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add new deposit address
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { address, network, token } = await request.json()

    if (!address || !network || !token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    // Check if address already exists
    const existing = await db.collection("depositAddresses").findOne({ address })
    if (existing) {
      return NextResponse.json({ error: "Address already exists" }, { status: 400 })
    }

    const newAddress = {
      address,
      network,
      token: token.toLowerCase(),
      isActive: true,
      createdAt: new Date(),
    }

    const result = await db.collection("depositAddresses").insertOne(newAddress)

    return NextResponse.json(
      {
        message: "Deposit address added successfully",
        address: { _id: result.insertedId, ...newAddress },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Add deposit address error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete deposit address
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const addressId = searchParams.get("id")

    if (!addressId) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")
    const { ObjectId } = await import("mongodb")

    await db.collection("depositAddresses").deleteOne({ _id: new ObjectId(addressId) })

    return NextResponse.json({ message: "Deposit address deleted successfully" })
  } catch (error) {
    console.error("[v0] Delete deposit address error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
