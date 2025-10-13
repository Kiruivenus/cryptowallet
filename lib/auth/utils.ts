import { cookies } from "next/headers"
import { verifyToken } from "./jwt"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    return null
  }

  const payload = await verifyToken(token.value)
  if (!payload || !payload.userId) {
    return null
  }

  const client = await clientPromise
  const db = client.db("cryptowallet")

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(payload.userId as string) }, { projection: { password: 0 } })

  return user
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}
