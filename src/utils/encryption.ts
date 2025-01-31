import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

const algorithm = "aes-256-cbc"
const key = Buffer.from(process.env.ENCRYPTION_KEY!, "base64")

export function encrypt(text: string): string {
  if (!text) {
    throw new Error('No text provided for encryption')
  }
  const iv = randomBytes(16)
  const cipher = createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

export function decrypt(text: string): string {
  if (!text) {
    throw new Error('No text provided for decryption')
  }
  const [ivHex, encryptedHex] = text.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const decipher = createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(encryptedHex, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

