"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FaCheckCircle,
  FaMobileAlt,
  FaReceipt,
  FaHome,
} from "react-icons/fa";
import Image from "next/image";

interface PaymentMetadata {
  orderId: string;
  userId: string;
  bundleId: string;
  recipientPhone: string;
}

interface PaymentData {
  amount: number;
  currency: string;
  status: string;
  reference: string;
  paidAt: string;
  metadata: PaymentMetadata;
}

interface VerificationResponse {
  success: boolean;
  message: string;
  data: PaymentData;
  timestamp: string;
}

export default function PaymentVerificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference") || "";

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setError("No payment reference provided.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("authToken");
      const API_URL = "https://bundle-api-w6yw.onrender.com";

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/payment/verify/${reference}`, {
          method: "GET",
          headers,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || `HTTP ${res.status}`);
        }

        const data: VerificationResponse = await res.json();
        if (!data.success) throw new Error(data.message);

        setPaymentData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [reference]);

  const formatAmount = (amount: number, currency: string) =>
    `${(amount / 100).toFixed(2)} ${currency}`;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const goToDashboard = () => {
    router.push("/userdashboard");
  };

  // ------------------ LOADING STATE ------------------
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-white to-blue-50">
        <Image
          src="/logos/acdatalogo.png"
          alt="AC Data Hub Logo"
          width={80}
          height={80}
          className="mb-6 animate-pulse"
        />
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6" />
        <h2 className="text-xl sm:text-2xl font-bold text-blue-700 mb-2 text-center">
          Verifying Payment...
        </h2>
        <p className="text-sm sm:text-base text-gray-500 text-center max-w-md">
          Please wait while we confirm your data bundle purchase
        </p>
      </div>
    );

  // ------------------ ERROR STATE ------------------
  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
        <Image
          src="/logos/acdatalogo.png"
          alt="AC Data Hub Logo"
          width={80}
          height={80}
          className="mb-4"
        />
        <div className="text-5xl sm:text-6xl text-red-500 mb-4">❌</div>
        <h2 className="text-xl sm:text-2xl text-blue-800 font-bold mb-2 text-center">
          Payment Verification Failed
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6 text-center max-w-md">
          {error}
        </p>
        <button
          onClick={goToDashboard}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 text-sm sm:text-base"
        >
          <FaHome /> Return to Dashboard
        </button>
      </div>
    );

  // ------------------ SUCCESS STATE ------------------
  if (!paymentData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col items-center py-6 sm:py-10 px-4">
      {/* Logo */}
      <Image
        src="/logos/acdatalogo.png"
        alt="AC Data Hub Logo"
        width={64}
        height={64}
        className="mb-6 sm:mb-8"
      />

      {/* Success Banner */}
      <div className="text-center p-6 sm:p-8 bg-blue-100 rounded-2xl shadow-md w-full max-w-lg mb-6 sm:mb-8 border border-blue-200">
        <FaCheckCircle className="text-blue-600 text-5xl sm:text-6xl mx-auto mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-2">
          Payment Successful!
        </h1>
        <p className="text-sm sm:text-base text-blue-700">
          Your data bundle has been activated 🎉
        </p>
      </div>

      {/* Receipt Card */}
      <div className="bg-white border border-blue-100 shadow-lg rounded-2xl p-4 sm:p-6 w-full max-w-lg">
        <div className="flex justify-between items-start border-b border-blue-100 pb-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-blue-800 flex items-center gap-2">
              <FaReceipt className="text-sm sm:text-base" /> Receipt
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {formatDate(paymentData.paidAt)}
            </p>
          </div>
          <FaMobileAlt className="text-blue-600 text-2xl sm:text-3xl flex-shrink-0" />
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base font-medium text-gray-600">
              Amount Paid
            </span>
            <span className="text-lg sm:text-xl text-blue-700 font-bold">
              {formatAmount(paymentData.amount, paymentData.currency)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base font-medium text-gray-600">
              Status
            </span>
            <span className="text-sm sm:text-base text-green-600 font-semibold capitalize">
              {paymentData.status}
            </span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-sm sm:text-base font-medium text-gray-600">
              Reference
            </span>
            <span className="font-mono text-xs sm:text-sm text-gray-700 text-right break-all max-w-[60%]">
              {paymentData.reference}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base font-medium text-gray-600">
              Recipient
            </span>
            <span className="text-sm sm:text-base font-semibold text-blue-700">
              {paymentData.metadata?.recipientPhone}
            </span>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4">
            <span className="text-xs sm:text-sm text-blue-700 font-medium">
              Bundle ID: {paymentData.metadata?.bundleId}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
          <button
            onClick={() => window.print()}
            className="w-full sm:flex-1 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition text-sm sm:text-base"
          >
            🧾 Print Receipt
          </button>
          <button
            onClick={goToDashboard}
            className="w-full sm:flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
          >
            💡 Back to Dashboard
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 sm:mt-10 text-center text-gray-500 text-xs sm:text-sm max-w-md">
        <p>
          Thank you for choosing{" "}
          <strong className="text-blue-700">AC Data Hub</strong> 💙
        </p>
        <p className="mt-1">Stay connected, stay online!</p>
      </footer>
    </div>
  );
}