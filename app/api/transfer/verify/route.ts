import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { recipientType, recipient } = await request.json()

    if (!recipientType || !recipient) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    let recipientUser

    if (recipientType === "email") {
      recipientUser = await db.collection("users").findOne(
        { email: recipient },
        {
          projection: { password: 0 },
        },
      )
    } else {
      try {
        recipientUser = await db.collection("users").findOne(
          { _id: new ObjectId(recipient) },
          {
            projection: { password: 0 },
          },
        )
      } catch (error) {
        return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
      }
    }

    if (!recipientUser) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
    }

    if (recipientUser._id.toString() === user._id.toString()) {
      return NextResponse.json({ error: "Cannot send to yourself" }, { status: 400 })
    }

    return NextResponse.json({
      user: {
        id: recipientUser._id,
        name: recipientUser.name,
        email: recipientUser.email,
      },
    })
  } catch (error) {
    console.error("[v0] Verify recipient error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
