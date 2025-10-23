"use client";

import { useState } from "react";
import { verifyPayment } from "@/utils/verifyPayments";

export default function PaymentVerifier({ reference, token }: { reference: string; token: string }) {
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await verifyPayment(reference, token);
      setPaymentData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify Payment"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {paymentData && (
        <div>
          <h3>Payment Verified ✅</h3>
          <p>Amount: {paymentData.amount / 100} {paymentData.currency}</p>
          <p>Status: {paymentData.status}</p>
          <p>Paid At: {new Date(paymentData.paidAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
