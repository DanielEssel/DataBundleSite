import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function GET(req: Request) {
  try {
    // ✅ Get token from request headers (if using next-auth or stored locally)
    const authHeader = req.headers.get("authorization");

    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { success: false, message: "Failed to fetch profile", error: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: data?.message || "Profile fetched successfully",
      data: data?.data,
    });
  } catch (error: any) {
    console.error("Profile route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
