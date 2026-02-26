import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
        }),
      }
    )

    const data = await response.json()
    console.log("GEMINI RAW:", data)

    if (data.error) {
      return NextResponse.json({ reply: data.error.message })
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini"

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("SERVER ERROR:", error)
    return NextResponse.json({ reply: "Server error occurred" })
  }
}