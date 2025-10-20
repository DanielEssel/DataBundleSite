// components/SuccessPageContent.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");

  useEffect(() => {
    if (!reference) return;

    const verifyPayment = async () => {
      try {
        const res = await fetch(
          `https://bundle-api-w6yw.onrender.com/api/payments/verify/${reference}`
        );
        const data = await res.json();

        if (res.ok && data.status === true) {
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Verification failed:", error);
        setStatus("failed");
      }
    };

    verifyPayment();
  }, [reference]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 text-center px-6">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h1 className="text-2xl font-semibold text-yellow-700">
          Verifying your payment...
        </h1>
        <p className="text-gray-600 mt-2">
          Please wait a moment while we confirm your transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-center px-6">
      {status === "success" ? (
        <>
          <h1 className="text-3xl font-bold text-green-700 mb-2">✅ Payment Successful</h1>
          <p className="text-gray-700 mb-6">
            Your data purchase was verified successfully. Reference:{" "}
            <span className="font-semibold">{reference}</span>
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-red-700 mb-2">❌ Payment Verification Failed</h1>
          <p className="text-gray-700 mb-6">
            We couldn’t verify your payment. Reference:{" "}
            <span className="font-semibold">{reference}</span>
          </p>
        </>
      )}
      <button
        onClick={() => router.push("/bundles")}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
      >
        Back to Bundles
      </button>
    </div>
  );
}
