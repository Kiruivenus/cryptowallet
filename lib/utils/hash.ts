import crypto from "crypto"

export function generateTransactionHash(): string {
  // Generate a 64-character hexadecimal hash similar to blockchain transaction hashes
  return "0x" + crypto.randomBytes(32).toString("hex")
}
