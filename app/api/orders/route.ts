import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // credentials: "include", // uncomment if backend uses cookies for auth
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          message: `Backend error: ${errorText}`,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // normalize response to ensure consistent structure
    return NextResponse.json({
      success: true,
      message: data?.message || "Orders fetched successfully",
      data: {
        orders: data?.data?.orders || [],
        totalOrders: data?.data?.totalOrders || 0,
        currentPage: data?.data?.currentPage || 1,
        totalPages: data?.data?.totalPages || 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
