import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const MAX_REQUESTS_PER_MINUTE = 100
const SUSPICIOUS_KEYWORDS = ["hack", "exploit", "vulnerability"]

export async function detectThreats(userId: string, content: string): Promise<boolean> {
  // Check for rate limiting
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
  const recentRequests = await prisma.data.count({
    where: {
      userId, 
      createdAt: {
        gte: oneMinuteAgo,
      },
    },
  })

  if (recentRequests > MAX_REQUESTS_PER_MINUTE) {
    console.warn(`Potential threat detected: Rate limit exceeded for user ${userId}`)
    return true
  }

  // Check for suspicious keywords
  if (SUSPICIOUS_KEYWORDS.some((keyword) => content.toLowerCase().includes(keyword))) {
    console.warn(`Potential threat detected: Suspicious keyword found in content for user ${userId}`)
    return true
  }

  return false
}

