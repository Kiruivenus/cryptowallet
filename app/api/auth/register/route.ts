import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"
import { generateReferralCode } from "@/lib/auth/utils"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, referralCode } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    // Check if user exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Verify referral code if provided
    let referredBy = undefined
    if (referralCode) {
      const referrer = await db.collection("users").findOne({
        referralCode: referralCode.toUpperCase(),
      })
      if (referrer) {
        referredBy = referrer._id.toString()
        await db.collection("users").updateOne(
          { _id: referrer._id },
          {
            $inc: { referralCount: 1 },
            $set: { updatedAt: new Date() },
          },
        )
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = {
      email,
      password: hashedPassword,
      name,
      role: "user" as const,
      balances: {
        usdt: 0,
        usdc: 0,
      },
      referralCode: generateReferralCode(),
      referredBy,
      referralEarnings: 0,
      referralCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    }

    const result = await db.collection("users").insertOne(newUser)

    // Create JWT token
    const token = await signToken({
      userId: result.insertedId.toString(),
      email,
      role: "user",
    })

    // Set cookie
    const response = NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: result.insertedId,
          email,
          name,
          role: "user",
        },
      },
      { status: 201 },
    )

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
