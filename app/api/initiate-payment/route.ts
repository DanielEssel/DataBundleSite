import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, amount, phone, network, plan } = await req.json();

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amount * 100, // GHS → pesewas
      callback_url: "https://bundle-api-w6yw.onrender.com/api/payments/verify",
      metadata: { phone, network, plan },
    }),
  });

  const data = await response.json();
  return NextResponse.json(data.data);
}
