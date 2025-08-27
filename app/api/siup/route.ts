import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://localhost/siup/app/euisyii/api/akmal", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("SIUP API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
