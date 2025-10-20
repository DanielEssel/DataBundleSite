"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import OrderModal from "@/components/OrderModal";
import { motion } from "framer-motion";
import { Loader2, Wifi, CreditCard } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch bundle by ID
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

  // Fetch bundle on mount
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

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin w-8 h-8 mb-3 text-blue-600" />
        <p>Loading bundle details...</p>
      </div>
    );

  if (!bundle)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Failed to load bundle details.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-3xl shadow-lg p-8 w-full max-w-md relative overflow-hidden"
      >
        {/* Decorative gradient corner */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200 opacity-30 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-5">
            <Wifi className="w-8 h-8 text-blue-600" />
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{bundle.name}</h1>
          <p className="text-gray-600 mb-4 max-w-sm">
            {bundle.description || "Stay connected with our reliable data plan."}
          </p>

          <div className="flex justify-between items-center bg-gray-50 rounded-2xl w-full py-3 px-5 mb-6 border border-gray-100">
            <p className="font-medium text-gray-700">
              <span className="text-gray-500">Data:</span> {bundle.dataAmount}
            </p>
            <p className="text-2xl font-bold text-blue-600">₵{bundle.price}</p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 text-lg shadow-md hover:shadow-lg transition-all"
          >
            <CreditCard className="w-5 h-5" />
            Buy Now
          </Button>
        </div>
      </motion.div>

      {/* Order Modal */}
      <OrderModal
        bundleId={bundle._id}
        bundleName={bundle.name}
        price={bundle.price}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
