import { NextResponse } from "next/server";

export async function GET() {
  const bundles = {
    MTN: [
      { id: 1, data: "1GB", price: "₵10", validity: "24hrs" },
      { id: 2, data: "5GB", price: "₵25", validity: "7 days" },
    ],
    Vodafone: [
      { id: 3, data: "2GB", price: "₵12", validity: "24hrs" },
    ],
    AirtelTigo: [
      { id: 4, data: "3GB", price: "₵20", validity: "7 days" },
    ],
  };
  return NextResponse.json({ success: true, data: bundles });
}
