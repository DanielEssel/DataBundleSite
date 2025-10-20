"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, CreditCard, Shield, AlertCircle, CheckCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!;

interface OrderModalProps {
  bundleId: string;
  bundleName: string;
  price: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderModal({
  bundleId,
  bundleName,
  price,
  isOpen,
  onClose,
}: OrderModalProps) {
  const router = useRouter();
  const [recipientPhone, setRecipientPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleOrder = async () => {
    setMessage("");
    setMessageType("");

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to continue");
      setMessageType("error");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (!recipientPhone) {
      setMessage("Please enter recipient phone number");
      setMessageType("error");
      return;
    }

    const tryOrder = async (paymentMethod: string) => {
      const payload = {
        bundleId,
        recipientPhone,
        paymentMethod,
      };

      console.log("🧾 Sending Order Payload:", payload);

      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📦 Order Response:", res.status, data);
      return { res, data };
    };

    try {
      setLoading(true);

      // 1️⃣ First attempt with "paystack"
      let { res, data } = await tryOrder("paystack");

      // 2️⃣ If validation fails, retry with "card"
      if (
        res.status === 400 &&
        data?.error?.includes("paymentMethod") &&
        data?.error?.includes("enum")
      ) {
        console.warn("⚠️ Backend rejected 'paystack'. Retrying with 'card'...");
        ({ res, data } = await tryOrder("card"));
      }

      if (res.status === 401) {
        localStorage.removeItem("token");
        setMessage("Session expired. Please log in again.");
        setMessageType("error");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create order.");
      }

      // ✅ Extract payment info
      const paymentUrl = data.data?.payment?.authorizationUrl;
      const reference = data.data?.payment?.reference;
      const orderId = data.data?.order?._id;

      if (!paymentUrl) throw new Error("Missing payment URL from server.");

      setMessage("Order created successfully! Redirecting to payment...");
      setMessageType("success");
      console.log("🔗 Redirecting to:", paymentUrl);

      // Redirect to Paystack payment
      setTimeout(() => {
        window.location.href = paymentUrl;
      }, 1000);
    } catch (error: any) {
      console.error("❌ Error creating order:", error);
      setMessage(error.message || "Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md overflow-hidden border-none shadow-2xl">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-yellow-600 to-pink-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Complete Your Purchase
            </DialogTitle>
            <p className="text-white text-sm mt-2">
              You're one step away from activating your bundle
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Bundle Summary Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600 font-medium">Bundle</span>
              <span className="text-sm font-semibold text-gray-900">
                {bundleName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Amount</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ₵{price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              Recipient Phone Number
            </label>
            <div className="relative">
              <Input
                type="tel"
                placeholder="e.g. +233557424675"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="pl-4 pr-4 py-6 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Enter the phone number that will receive the data bundle
            </p>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-green-900">
                Secure Payment
              </p>
              <p className="text-xs text-green-700">
                Protected by Paystack encryption
              </p>
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <div
              className={`flex items-start gap-3 p-4 rounded-xl border ${
                messageType === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm font-medium ${
                  messageType === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              disabled={loading}
              variant="outline"
              className="flex-1 py-6 text-base font-semibold border-2 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleOrder}
              disabled={loading || !recipientPhone}
              className="flex-1 py-6 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Pay ₵{price.toFixed(2)}
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}