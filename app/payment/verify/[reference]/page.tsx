"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

/**
 * Payment metadata structure
 */
interface PaymentMetadata {
  orderId: string;
  userId: string;
  bundleId: string;
  recipientPhone: string;
}

/**
 * Payment data structure returned from verification
 */
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
  const params = useParams();
  const reference = params.reference as string;

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

      // Get token from localStorage (or your auth system)
      const token = localStorage.getItem("authToken"); // Must be backend API token
      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }

      const API_URL = "https://bundle-api-w6yw.onrender.com";

  
      try {
        const res = await fetch(`${API_URL}/payment/verify/${reference}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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

  // ------------------------
  // Helper Functions
  // ------------------------
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

  const getStatusStyle = (status: string) => {
    const base = {
      padding: "8px 16px",
      borderRadius: "6px",
      fontWeight: 600,
      textTransform: "capitalize" as const,
      display: "inline-block",
      fontSize: "18px",
    };
    switch (status.toLowerCase()) {
      case "success":
        return { ...base, backgroundColor: "#d4edda", color: "#155724" };
      case "pending":
        return { ...base, backgroundColor: "#fff3cd", color: "#856404" };
      case "failed":
        return { ...base, backgroundColor: "#f8d7da", color: "#721c24" };
      default:
        return { ...base, backgroundColor: "#e2e3e5", color: "#383d41" };
    }
  };

  // ------------------------
  // Render States
  // ------------------------
  if (loading)
    return (
      <div className="max-w-lg mx-auto my-24 p-10 text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-2xl text-gray-800 mb-2">Verifying Payment...</h2>
        <p className="text-gray-500">Please wait while we confirm your payment</p>
      </div>
    );

  if (error)
    return (
      <div className="max-w-lg mx-auto my-24 p-10 text-center bg-red-50 rounded-lg border border-red-200">
        <div className="text-6xl mb-6">❌</div>
        <h2 className="text-2xl text-red-600 mb-4">Payment Verification Failed</h2>
        <p className="text-red-700 mb-6">{error}</p>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
        >
          Return Home
        </button>
      </div>
    );

  if (!paymentData) return null;

  return (
    <div className="max-w-3xl mx-auto my-10 p-6">
      <div className="text-center p-10 bg-green-100 rounded-lg mb-8">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl text-green-700 font-semibold mb-2">Payment Successful!</h1>
        <p className="text-green-700">Your payment has been verified.</p>
      </div>

      <div className="bg-white border rounded-lg shadow p-6 space-y-6">
        <div className="text-center bg-gray-100 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Amount Paid</div>
          <div className="text-3xl font-bold text-green-600">{formatAmount(paymentData.amount, paymentData.currency)}</div>
        </div>

        <div>
          <strong className="text-gray-500">Status:</strong>{" "}
          <span style={getStatusStyle(paymentData.status)}>{paymentData.status}</span>
        </div>

        <div>
          <strong className="text-gray-500">Reference:</strong>{" "}
          <code className="bg-gray-200 px-2 py-1 rounded">{paymentData.reference}</code>
        </div>

        <div>
          <strong className="text-gray-500">Payment Date:</strong> {formatDate(paymentData.paidAt)}
        </div>

        {paymentData.metadata && (
          <details className="mt-4 p-4 bg-gray-100 rounded-lg">
            <summary className="cursor-pointer font-semibold text-blue-600">📋 View Metadata</summary>
            <div className="mt-4 space-y-2 text-gray-700">
              <div><strong>Order ID:</strong> {paymentData.metadata.orderId}</div>
              <div><strong>Bundle ID:</strong> {paymentData.metadata.bundleId}</div>
              <div><strong>Recipient Phone:</strong> {paymentData.metadata.recipientPhone}</div>
            </div>
          </details>
        )}

        <div className="flex gap-4 justify-center mt-6">
          <button onClick={() => window.print()} className="px-6 py-2 bg-gray-500 text-white rounded-lg font-semibold">Print Receipt</button>
          <button onClick={() => (window.location.href = "/")} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold">Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}
