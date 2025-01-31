import { NextResponse } from "next/server"
import { verify } from "@/utils/jwt"

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 })
  }

  const payload = await verify(token)

  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  // If the token is valid, you can proceed with the protected operation
  return NextResponse.json({ message: "Access granted", user: payload })
}

