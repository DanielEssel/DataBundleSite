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
import {
  Phone,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

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

    const token = localStorage.getItem("authToken");
    console.log("OrderModal token:", token);

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

    const payload = { bundleId, recipientPhone, paymentMethod: "momo" };

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Order response:", data);

      if (res.status === 401) {
        localStorage.removeItem("authToken");
        setMessage("Session expired. Please log in again.");
        setMessageType("error");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create order.");
      }

      const paymentUrl = data.data?.payment?.authorizationUrl;
      if (!paymentUrl) throw new Error("Missing payment URL from server.");

      setMessage("Order created successfully! Redirecting to payment...");
      setMessageType("success");
      setTimeout(() => (window.location.href = paymentUrl), 1200);
    } catch (error: any) {
      setMessage(error.message || "Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md overflow-hidden border-none shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Complete Your Purchase
            </DialogTitle>
            <p className="text-white/90 text-sm mt-1">
              You’re one step away from activating your bundle
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 bg-white">
          {/* Bundle Summary */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-700 font-medium">
                Bundle Name
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {bundleName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700 font-medium">Amount</span>
              <span className="text-2xl font-bold text-blue-600">
                ₵{price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Recipient Phone */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              Recipient Phone Number
            </label>
            <Input
              type="tel"
              placeholder="e.g. +233557424675"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="border-2 border-gray-200 focus:border-blue-500 py-5 text-base rounded-xl transition-all"
            />
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Enter the phone number that will receive the data bundle.
            </p>
          </div>

          {/* Secure Payment Notice */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-800">
                Secure Payment
              </p>
              <p className="text-xs text-blue-700">
                Protected by Paystack encryption
              </p>
            </div>
          </div>

          {/* Message Feedback */}
          {message && (
            <div
              className={`flex items-start gap-3 p-4 rounded-xl border ${
                messageType === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
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

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              disabled={loading}
              variant="outline"
              className="flex-1 py-5 text-base font-semibold border-2 hover:bg-blue-50 text-blue-700 border-blue-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleOrder}
              disabled={loading || !recipientPhone}
              className="flex-1 py-5 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
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
