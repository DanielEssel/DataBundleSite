"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  FaCheckCircle,
  FaMobileAlt,
  FaWifi,
  FaReceipt,
  FaHome,
} from "react-icons/fa";

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  // ------------------ LOADING STATE ------------------
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-b from-white to-blue-50">
        <img
          src="/logo.png"
          alt="AC Data Hub Logo"
          className="w-24 h-24 mb-6 animate-pulse"
        />
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-blue-700 mb-2">
          Verifying Payment...
        </h2>
        <p className="text-gray-500">
          Please wait while we confirm your data bundle purchase
        </p>
      </div>
    );

  // ------------------ ERROR STATE ------------------
  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white text-center">
        <img
          src="/logo.png"
          alt="AC Data Hub Logo"
          className="w-20 h-20 mb-4"
        />
        <div className="text-6xl text-red-500 mb-4">❌</div>
        <h2 className="text-2xl text-blue-800 font-bold mb-2">
          Payment Verification Failed
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FaHome /> Return Home
        </button>
      </div>
    );

  // ------------------ SUCCESS STATE ------------------
  if (!paymentData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col items-center py-10 px-4">
      {/* Logo */}
      <img
        src="/logo.png"
        alt="AC Data Hub Logo"
        className="w-24 h-24 mb-6"
      />

      {/* Success Banner */}
      <div className="text-center p-8 bg-blue-100 rounded-2xl shadow-md w-full max-w-2xl mb-8 border border-blue-200">
        <FaCheckCircle className="text-blue-600 text-6xl mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-blue-700 mb-2">
          Payment Successful!
        </h1>
        <p className="text-blue-700">
          Your data bundle has been successfully activated 🎉
        </p>
      </div>

      {/* Receipt Card */}
      <div className="bg-white border border-blue-100 shadow-lg rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center border-b border-blue-100 pb-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <FaReceipt /> Transaction Receipt
            </h2>
            <p className="text-sm text-gray-500">{formatDate(paymentData.paidAt)}</p>
          </div>
          <FaMobileAlt className="text-blue-600 text-3xl" />
        </div>

        <div className="space-y-4 text-gray-700">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Amount Paid:</span>
            <span className="text-blue-700 font-semibold text-lg">
              {formatAmount(paymentData.amount, paymentData.currency)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Status:</span>
            <span className="text-green-600 font-semibold capitalize">
              {paymentData.status}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Reference:</span>
            <span className="font-mono text-sm text-gray-700">
              {paymentData.reference}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Recipient:</span>
            <span className="font-semibold text-blue-700">
              {paymentData.metadata?.recipientPhone}
            </span>
          </div>

          <div className="flex justify-between items-center mt-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <span className="flex items-center gap-2 text-blue-700 font-medium">
              <FaWifi /> Bundle ID: {paymentData.metadata?.bundleId}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition"
          >
            🧾 Print Receipt
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            💡 Buy More Data
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center text-gray-500 text-sm">
        <p>Thank you for purchasing your bundle with <strong className="text-blue-700">AC Data Hub</strong> 💙</p>
        <p className="mt-1">Stay connected, stay online!</p>
      </footer>
    </div>
  );
}
