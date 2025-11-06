"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Phone,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Wifi,
  Database,
  ChevronRight,
} from "lucide-react";

// Network providers
const NETWORKS = [
  { id: "mtn", name: "MTN", color: "bg-yellow-500", logo: "🟡" },
  { id: "vodafone", name: "Vodafone", color: "bg-red-500", logo: "🔴" },
  { id: "airteltigo", name: "AirtelTigo", color: "bg-blue-500", logo: "🔵" },
  { id: "glo", name: "Glo", color: "bg-green-500", logo: "🟢" },
];

interface Bundle {
  _id: string;
  name: string;
  price: number;
  validity?: string;
  network?: string;
}

export default function DataBundleOrderForm() {
  const [step, setStep] = useState(1);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [recipientPhone, setRecipientPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBundles, setLoadingBundles] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  // Fetch bundles when network is selected
  useEffect(() => {
    if (selectedNetwork) {
      fetchBundles();
    }
  }, [selectedNetwork]);

  const fetchBundles = async () => {
    setLoadingBundles(true);
    setBundles([]); // Reset bundles before fetching
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/api/bundles?network=${selectedNetwork}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBundles(data.data);
      } else {
        setBundles([]);
      }
    } catch (error) {
      console.error("Failed to fetch bundles:", error);
      setBundles([]);
    } finally {
      setLoadingBundles(false);
    }
  };

  const handleNetworkSelect = (networkId: string) => {
    setSelectedNetwork(networkId);
    setSelectedBundle(null);
    setStep(2);
  };

  const handleBundleSelect = (bundle: Bundle) => {
    setSelectedBundle(bundle);
    setStep(3);
  };

  const handleSubmitOrder = async () => {
    setMessage("");
    setMessageType("");

    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (!token) {
      setMessage("Please log in to continue");
      setMessageType("error");
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.href = "/login";
      }, 2000);
      return;
    }

    if (!recipientPhone) {
      setMessage("Please enter recipient phone number");
      setMessageType("error");
      return;
    }

    const tryOrder = async (paymentMethod: string) => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const payload = {
        bundleId: selectedBundle!._id,
        recipientPhone,
        paymentMethod,
      };

      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      return { res, data };
    };

    try {
      setLoading(true);
      let { res, data } = await tryOrder("paystack");

      if (
        res.status === 400 &&
        data?.error?.includes("paymentMethod") &&
        data?.error?.includes("enum")
      ) {
        ({ res, data } = await tryOrder("card"));
      }

      if (res.status === 401) {
        if (typeof window !== 'undefined') localStorage.removeItem("token");
        setMessage("Session expired. Please log in again.");
        setMessageType("error");
        setTimeout(() => {
          if (typeof window !== 'undefined') window.location.href = "/login";
        }, 2000);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create order.");
      }

      const paymentUrl = data.data?.payment?.authorizationUrl;
      if (!paymentUrl) throw new Error("Missing payment URL from server.");

      setMessage("Order created successfully! Redirecting to payment...");
      setMessageType("success");
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.href = paymentUrl;
      }, 1200);
    } catch (error) {
      setMessage(message || "Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedNetwork("");
    setSelectedBundle(null);
    setRecipientPhone("");
    setMessage("");
    setMessageType("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Purchase Data Bundle
          </h1>
          <p className="text-gray-600">
            Select your network, choose a bundle, and complete your order
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center items-center mb-8 gap-2">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                  step >= s
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-1 w-12 rounded ${
                    step > s ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Step 1: Network Selection */}
          {step === 1 && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Wifi className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Select Network
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {NETWORKS.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => handleNetworkSelect(network.id)}
                    className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-105 ${
                      selectedNetwork === network.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="text-4xl mb-2">{network.logo}</div>
                    <div className="font-semibold text-gray-900">
                      {network.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Bundle Selection */}
          {step === 2 && (
            <div className="p-8">
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-1"
              >
                ← Back to networks
              </button>

              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Choose Data Bundle
                </h2>
              </div>

              {loadingBundles ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : bundles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No bundles available for this network
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {Array.isArray(bundles) && bundles.map((bundle) => (
                    <button
                      key={bundle._id}
                      onClick={() => handleBundleSelect(bundle)}
                      className={`w-full p-4 rounded-xl border-2 transition-all hover:shadow-md text-left ${
                        selectedBundle?._id === bundle._id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-gray-900 text-lg">
                            {bundle.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Valid for {bundle.validity || "N/A"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            ₵{bundle.price.toFixed(2)}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Phone Number & Checkout */}
          {step === 3 && selectedBundle && (
            <div className="p-8">
              <button
                onClick={() => setStep(2)}
                className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-1"
              >
                ← Back to bundles
              </button>

              <div className="flex items-center gap-3 mb-6">
                <Phone className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Complete Order
                </h2>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-5 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-blue-700 font-medium mb-1">
                      Network
                    </div>
                    <div className="font-semibold text-gray-900">
                      {NETWORKS.find((n) => n.id === selectedNetwork)?.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-700 font-medium mb-1">
                      Bundle
                    </div>
                    <div className="font-semibold text-gray-900">
                      {selectedBundle.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-700 font-medium mb-1">
                      Validity
                    </div>
                    <div className="font-semibold text-gray-900">
                      {selectedBundle.validity || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-700 font-medium mb-1">
                      Amount
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      ₵{selectedBundle.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Recipient Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="e.g. +233557424675"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="border-2 border-gray-200 focus:border-blue-500 py-6 text-base rounded-xl transition-all"
                />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Enter the phone number that will receive the data bundle
                </p>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6">
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
                  className={`flex items-start gap-3 p-4 rounded-xl border mb-6 ${
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
                      messageType === "success"
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {message}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={resetForm}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 py-6 text-base font-semibold border-2 hover:bg-blue-50 text-blue-700 border-blue-200"
                >
                  Start Over
                </Button>
                <Button
                  onClick={handleSubmitOrder}
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
                      Pay ₵{selectedBundle.price.toFixed(2)}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Need help?{" "}
          <a href="/support" className="text-blue-600 hover:underline">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}