import clientPromise from "../lib/mongodb"
import { ObjectId } from "mongodb"
import { generateTransactionHash } from "../lib/utils/hash"

async function verifyDeposits() {
  console.log("[v0] Starting deposit verification...")

  try {
    const client = await clientPromise
    const db = client.db("cryptowallet")

    // Get pending deposit transactions
    const pendingDeposits = await db
      .collection("transactions")
      .find({
        type: "deposit",
        status: "pending",
      })
      .toArray()

    console.log(`[v0] Found ${pendingDeposits.length} pending deposits`)

    // In a real implementation, you would:
    // 1. Query the blockchain API (e.g., TronGrid for TRC20)
    // 2. Check if the transaction exists and is confirmed
    // 3. Update the user's balance
    // 4. Mark the transaction as completed

    // For demo purposes, we'll simulate this:
    for (const deposit of pendingDeposits) {
      // Simulate blockchain verification (replace with actual API call)
      const isConfirmed = Math.random() > 0.5 // 50% chance for demo

      if (isConfirmed) {
        // Update user balance
        const user = await db.collection("users").findOne({ _id: new ObjectId(deposit.userId) })

        if (user) {
          const settings = await db.collection("appSettings").findOne({})
          const firstDepositBonus = settings?.bonuses?.firstDepositPercentage || 0
          const minBonusAmount = settings?.bonuses?.firstDepositMinAmount || 50

          // Check if this is first deposit
          const previousDeposits = await db.collection("transactions").countDocuments({
            userId: deposit.userId,
            type: "deposit",
            status: "completed",
          })

          let bonusAmount = 0
          if (previousDeposits === 0 && deposit.amount >= minBonusAmount) {
            bonusAmount = (deposit.amount * firstDepositBonus) / 100
          }

          const totalAmount = deposit.amount + bonusAmount

          // Update balance
          await db.collection("users").updateOne(
            { _id: new ObjectId(deposit.userId) },
            {
              $inc: { [`balances.${deposit.token}`]: totalAmount },
              $set: { updatedAt: new Date() },
            },
          )

          // Update transaction status
          await db.collection("transactions").updateOne(
            { _id: deposit._id },
            {
              $set: {
                status: "completed",
                updatedAt: new Date(),
                metadata: {
                  ...deposit.metadata,
                  bonusAmount,
                  totalCredited: totalAmount,
                },
              },
            },
          )

          // Handle referral bonus if applicable
          if (user.referredBy && deposit.amount >= (settings?.bonuses?.referralMinDeposit || 60)) {
            const referralReward = settings?.bonuses?.referralReward || 2

            await db.collection("users").updateOne(
              { _id: new ObjectId(user.referredBy) },
              {
                $inc: {
                  "balances.usdt": referralReward,
                  referralEarnings: referralReward,
                },
                $set: { updatedAt: new Date() },
              },
            )

            // Create referral transaction
            await db.collection("transactions").insertOne({
              userId: new ObjectId(user.referredBy),
              type: "referral",
              token: "usdt",
              amount: referralReward,
              status: "completed",
              transactionHash: generateTransactionHash(),
              metadata: {
                referredUserId: user._id,
                referredUserEmail: user.email,
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }

          console.log(`[v0] Deposit confirmed for user ${deposit.userId}: ${totalAmount} ${deposit.token}`)
        }
      }
    }

    console.log("[v0] Deposit verification completed")
  } catch (error) {
    console.error("[v0] Deposit verification error:", error)
  }
}

// Run the verification
verifyDeposits()
