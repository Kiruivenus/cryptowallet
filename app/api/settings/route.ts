import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/utils"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("cryptowallet")

    let settings = await db.collection("appSettings").findOne({})

    // Create default settings if none exist
    if (!settings) {
      const defaultSettings = {
        swapRates: {
          usdtToUsdc: 1.0,
          usdcToUsdt: 1.0,
        },
        fees: {
          withdrawalPercentage: 2,
          transferPercentage: 0.5,
        },
        bonuses: {
          firstDepositPercentage: 30,
          firstDepositMinAmount: 50,
          referralReward: 2,
          referralMinDeposit: 60,
        },
        updatedAt: new Date(),
      }

      await db.collection("appSettings").insertOne(defaultSettings)
      settings = defaultSettings
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("[v0] Get settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { swapRates, fees, bonuses } = body

    if (!swapRates || !fees || !bonuses) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptowallet")

    const updatedSettings = {
      swapRates: {
        usdtToUsdc: Number.parseFloat(swapRates.usdtToUsdc.toString()),
        usdcToUsdt: Number.parseFloat(swapRates.usdcToUsdt.toString()),
      },
      fees: {
        withdrawalPercentage: Number.parseFloat(fees.withdrawalPercentage.toString()),
        transferPercentage: Number.parseFloat(fees.transferPercentage.toString()),
      },
      bonuses: {
        firstDepositPercentage: Number.parseFloat(bonuses.firstDepositPercentage.toString()),
        firstDepositMinAmount: Number.parseFloat(bonuses.firstDepositMinAmount.toString()),
        referralReward: Number.parseFloat(bonuses.referralReward.toString()),
        referralMinDeposit: Number.parseFloat(bonuses.referralMinDeposit.toString()),
      },
      updatedAt: new Date(),
    }

    await db.collection("appSettings").updateOne({}, { $set: updatedSettings }, { upsert: true })

    return NextResponse.json({ message: "Settings updated successfully", settings: updatedSettings })
  } catch (error) {
    console.error("[v0] Update settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
