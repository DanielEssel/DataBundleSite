"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

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
  const reference = searchParams.get("reference");

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setError("No payment reference found in URL");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://bundle-api-w6yw.onrender.com/payment/verify/${reference}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.message || `HTTP ${res.status}: ${res.statusText}`);
        }

        const data: VerificationResponse = await res.json();
        if (!data.success || !data.data) {
          throw new Error(data.message || "Payment verification failed.");
        }

        setPaymentData(data.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [reference]);

  const formatAmount = (amount: number, currency: string) => `${(amount / 100).toFixed(2)} ${currency}`;

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading)
    return (
      <div className="max-w-lg mx-auto my-16 p-10 text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Verifying Payment...</h2>
        <p className="text-gray-600">Please wait while we confirm your payment</p>
      </div>
    );

  if (error)
    return (
      <div className="max-w-lg mx-auto my-16 p-10 text-center">
        <div className="text-6xl mb-6">❌</div>
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Payment Verification Failed</h2>
        <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
        >
          Return to Home
        </button>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto my-10 p-6">
      {/* Success Header */}
      <div className="text-center p-10 bg-green-100 rounded-xl mb-8">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-800 mb-2">Payment Successful!</h1>
        <p className="text-green-800">Your payment has been verified and processed</p>
      </div>

      {/* Payment Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-md space-y-6">
        <DetailCard title="Amount Paid" value={formatAmount(paymentData!.amount, paymentData!.currency)} highlight />
        <DetailCard title="Status" value={paymentData!.status} statusClass={getStatusStyle(paymentData!.status)} />
        <DetailCard title="Transaction Reference" value={paymentData!.reference} code />
        <DetailCard title="Payment Date" value={formatDate(paymentData!.paidAt)} />

        {paymentData!.metadata && (
          <details className="mt-4">
            <summary className="cursor-pointer font-semibold text-blue-600">📋 View Additional Details</summary>
            <div className="mt-4 p-4 bg-gray-50 rounded space-y-2 text-gray-700">
              <div>
                <strong>Order ID:</strong> {paymentData!.metadata.orderId}
              </div>
              <div>
                <strong>Bundle ID:</strong> {paymentData!.metadata.bundleId}
              </div>
              <div>
                <strong>Recipient Phone:</strong> {paymentData!.metadata.recipientPhone}
              </div>
            </div>
          </details>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-gray-600 text-white rounded font-semibold hover:bg-gray-700 transition"
        >
          Print Receipt
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

interface DetailCardProps {
  title: string;
  value: string;
  highlight?: boolean;
  statusClass?: string;
  code?: boolean;
}

const DetailCard: React.FC<DetailCardProps> = ({ title, value, highlight, statusClass, code }) => (
  <div className={`p-4 rounded ${highlight ? "bg-gray-100 text-center" : ""}`}>
    <strong className="text-gray-500 text-sm">{title}</strong>
    <div className={`mt-1 text-lg font-bold ${statusClass ? statusClass : ""}`}>
      {code ? <code className="bg-gray-200 px-2 py-1 rounded font-mono">{value}</code> : value}
    </div>
  </div>
);
