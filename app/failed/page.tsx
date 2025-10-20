"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function FailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("ref");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-center px-6">
      <h1 className="text-3xl font-bold text-red-700 mb-2">❌ Payment Failed</h1>
      <p className="text-gray-700 mb-6">
        We couldn’t verify your payment. Reference:{" "}
        <span className="font-semibold">{reference}</span>
      </p>
      <button
        onClick={() => router.back()}
        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
      >
        Try Again
      </button>
    </div>
  );
}
