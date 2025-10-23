"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function VerifyPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const [progress, setProgress] = useState(0);

  // Animate the progress bar
  useEffect(() => {
    if (status !== "loading") return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 300);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found in the URL.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("failed");
      setMessage("You must be logged in to verify payments.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`${API_URL}/payment/verify/${reference}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Check if response is JSON before parsing
        const contentType = res.headers.get("content-type");
        let data: any;
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          console.error("Unexpected server response:", text);
          throw new Error("Payment verification failed. Server returned invalid response.");
        }

        console.log("🔍 Payment verification response:", data);

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Payment verification failed.");
        }

        setProgress(100);
        setStatus("success");
        setMessage("✅ Payment verified successfully! Redirecting...");

        setTimeout(() => router.push("/orders"), 3000);
      } catch (error: any) {
        console.error("❌ Verification error:", error);
        setStatus("failed");
        setMessage(error.message || "Payment verification failed.");
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 relative overflow-hidden">
      {/* Animated Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
        <motion.div
          className="h-1 bg-blue-600"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <Loader2 className="animate-spin text-blue-600 w-12 h-12 mb-4" />
            <p className="text-gray-600 text-lg">{message}</p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <CheckCircle className="text-green-600 w-12 h-12 mb-4" />
            <p className="text-green-700 font-semibold text-lg">{message}</p>
          </motion.div>
        )}

        {status === "failed" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <XCircle className="text-red-600 w-12 h-12 mb-4" />
            <p className="text-red-700 font-semibold text-lg">{message}</p>
            <button
              onClick={() => router.push("/bundles")}
              className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
