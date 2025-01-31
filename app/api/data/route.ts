import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyJWT } from "@/utils/jwt"
import { encrypt, decrypt } from "@/utils/encryption"
import { detectThreats } from "@/utils/threatDetection"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 })
  }

  const payload = await verifyJWT(token)

  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  try {
    const data = await prisma.data.findMany({
      where: { userId: payload.userId as string },
    })

    const decryptedData = data.map((item) => ({
      ...item,
      content: decrypt(item.content),
    }))

    return NextResponse.json(decryptedData)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 })
  }

  const payload = await verifyJWT(token)

  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  const { content } = await request.json()

  // Threat detection
  const isThreat = await detectThreats(payload.userId as string, content)
  if (isThreat) {
    return NextResponse.json({ error: "Potential threat detected" }, { status: 403 })
  }

  try {
    const encryptedContent = encrypt(content)
    const data = await prisma.data.create({
      data: {
        content: encryptedContent,
        userId: payload.userId as string,
      },
    })

    return NextResponse.json({ message: "Data stored successfully" }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error storing data" }, { status: 500 })
  }
}

