"use client";

import React from "react";

interface PayButtonProps {
  email: string;
  amount: number; // GHS
  phone: string;
  network: string;
  plan: string;
}

export default function PayButton({
  email,
  amount,
  phone,
  network,
  plan,
}: PayButtonProps) {
  const handlePay = async () => {
    try {
      // 1️⃣ Call your backend to initialize the transaction
      const res = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount, phone, network, plan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment init failed");

      // 2️⃣ Redirect user to Paystack checkout page
      window.location.href = data.authorization_url;
    } catch (error: any) {
      console.error("Payment init error:", error);
      alert("Error initializing payment. Please try again.");
    }
  };

  return (
    <button
      onClick={handlePay}
      className="bg-blue-600 text-white w-full py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
    >
      Pay ₵{amount}
    </button>
  );
}
