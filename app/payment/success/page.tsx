"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("ref");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-center px-6">
      <h1 className="text-3xl font-bold text-green-700 mb-2">✅ Payment Successful</h1>
      <p className="text-gray-700 mb-6">
        Your data purchase was successful. Reference: <span className="font-semibold">{reference}</span>
      </p>
      <button
        onClick={() => router.push("/bundles")}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
      >
        Back to Bundles
      </button>
    </div>
  );
}
