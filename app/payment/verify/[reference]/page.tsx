"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    if (reference) {
      axios
        .get(`https://bundle-api-w6yw.onrender.com/payment/verify/${reference}`)
        .then((res) => {
          if (res.data.success) {
            setStatus("✅ Payment verified successfully!");
          } else {
            setStatus("❌ Payment verification failed.");
          }
        })
        .catch((err) => {
          console.error("Payment verification error:", err);
          setStatus("⚠ Error verifying payment.");
        });
    }
  }, [reference]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-bold">{status}</h2>
    </div>
  );
}
