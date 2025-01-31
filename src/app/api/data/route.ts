import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/utils/jwt"
import { encrypt, decrypt } from "@/utils/encryption"
import { detectThreats } from "@/utils/threatDetection"

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
    const data = await prisma.data.findMany()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 })
  }
}