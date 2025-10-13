import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyPassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    // Find user
    const user = await db.collection("users").findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const userStatus = user.status || "active"

    if (userStatus === "banned") {
      return NextResponse.json({ error: "Your account has been banned. Please contact support." }, { status: 403 })
    }

    if (userStatus === "suspended") {
      return NextResponse.json({ error: "Your account has been suspended. Please contact support." }, { status: 403 })
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: "Account is disabled" }, { status: 403 })
    }

    // Create JWT token
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    // Set cookie
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 },
    )

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
