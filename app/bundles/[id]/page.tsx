"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import OrderModal from "@/components/OrderModal";
import { Loader2, Wifi, CreditCard, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function: Fetch bundle details by ID
async function getBundleById(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/bundles/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch bundle: ${res.status}`);
    const json = await res.json();
    return json?.data?.data;
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return null;
  }
}

export default function BundleDetailsPage() {
  const params = useParams();
  const [bundle, setBundle] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch bundle when component mounts
  useEffect(() => {
    async function fetchBundle() {
      const id = params?.id as string;
      if (!id) return;
      const data = await getBundleById(id);
      setBundle(data);
      setLoading(false);
    }
    fetchBundle();
  }, [params]);

  // 🔄 Loading State
  if (loading) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Loading bundle details...</p>
      </section>
    );
  } 

  // ⚠️ Error State
  if (!bundle) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <p className="text-red-600 text-lg font-medium">
          Failed to load bundle details.
        </p>
      </section>
    );
  }

  // ✅ Main Layout
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-40 -right-40 w-[450px] h-[450px] bg-blue-300 rounded-full blur-3xl opacity-20" />
      <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] bg-purple-300 rounded-full blur-3xl opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Wifi className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{bundle.name}</h1>
          <p className="text-gray-600 mt-2 text-sm">
            {bundle.description || "Stay connected with our reliable data plan."}
          </p>
        </div>

        {/* Bundle Details */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Data</span>
            <span className="text-gray-900 font-semibold">{bundle.dataAmount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Price</span>
            <span className="text-blue-700 text-2xl font-bold">
              ₵{bundle.price}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          Buy Now
        </Button>
      </motion.div>

      {/* Order Modal */}
     <OrderModal
        bundleId={bundle._id}
        bundleName={bundle.name}
        price={bundle.price}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
