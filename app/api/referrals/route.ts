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

    // Get referred users
    const referredUsers = await db
      .collection("users")
      .find(
        { referredBy: user._id.toString() },
        {
          projection: {
            name: 1,
            email: 1,
            createdAt: 1,
          },
        },
      )
      .sort({ createdAt: -1 })
      .toArray()

    // Get referral transactions to see earnings per referral
    const referralTransactions = await db
      .collection("transactions")
      .find({
        userId: user._id,
        type: "referral",
      })
      .toArray()

    // Map earnings to referrals
    const referralsWithEarnings = referredUsers.map((ref) => {
      const transaction = referralTransactions.find(
        (t) => t.metadata?.referredUserId?.toString() === ref._id.toString(),
      )
      return {
        name: ref.name,
        email: ref.email,
        createdAt: ref.createdAt,
        earned: transaction?.amount || 0,
      }
    })

    const actualReferralCount = referredUsers.length
    const totalEarnings = referralTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)

    const referralData = {
      referralCode: user.referralCode,
      referralCount: actualReferralCount,
      referralEarnings: totalEarnings,
      referrals: referralsWithEarnings,
    }

    return NextResponse.json({ referralData })
  } catch (error) {
    console.error("[v0] Get referrals error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
