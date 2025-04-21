import { NextResponse } from "next/server"
import { serverConfig } from "@/lib/config"

export async function GET(req: Request) {
  try {
    // Example of using the API key in a server-side API route
    const response = await fetch("https://api.example.com/data", {
      headers: {
        Authorization: `Bearer ${serverConfig.api.key}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch data from external API")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching from external API:", error)
    return NextResponse.json({ error: "Failed to fetch data from external service" }, { status: 500 })
  }
}
