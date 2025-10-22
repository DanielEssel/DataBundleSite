"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface Bundle {
  _id: string;
  name: string;
  price: number;
  size: string;
  isActive: boolean;
}

interface Network {
  name: string;
  logo: string;
  gradient: string;
  accentColor: string;
}

const networks: Network[] = [
  {
    name: "MTN",
    logo: "/image/mtn.png",
    gradient: "from-yellow-400 to-yellow-500",
    accentColor: "border-yellow-400",
  },
  {
    name: "Telecel",
    logo: "/image/telecel.png",
    gradient: "from-red-500 to-red-600",
    accentColor: "border-red-400",
  },
  {
    name: "AirtelTigo",
    logo: "/image/airteltigo.png",
    gradient: "from-blue-500 to-indigo-600",
    accentColor: "border-blue-400",
  },
];

const BundlesPage = () => {
  const router = useRouter();
  const [selectedNetwork, setSelectedNetwork] = useState("MTN");
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBundles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bundles?network=${selectedNetwork}`);
      const data = await res.json();
      setBundles(data);
    } catch (error) {
      console.error("Error fetching bundles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, [selectedNetwork]);

  const handleCardClick = (id: string) => {
    router.push(`/dashboard/user/buy/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Fast & Reliable{" "}
            <span className="text-blue-600">Data Bundle</span> Delivery
          </h1>
          <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
            Buy MTN, Telecel, or AirtelTigo data instantly — no delays, no
            stress.
          </p>
          <Button
            asChild
            className="bg-blue-600 text-white px-8 py-4 rounded-full font-medium hover:bg-blue-700 transition shadow"
          >
            <a href="/dashboard/user">Get Started</a>
          </Button>
        </div>
      </section>

      {/* Network Selection */}
      <div className="flex justify-center items-center gap-6 mb-6">
        {networks.map((network) => (
          <button
            key={network.name}
            onClick={() => setSelectedNetwork(network.name)}
            className={`flex flex-col items-center gap-2 transition-all duration-300 ${
              selectedNetwork === network.name
                ? "scale-110"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <Image
              src={network.logo}
              alt={network.name}
              width={70}
              height={70}
              className="object-contain drop-shadow-md"
            />
            <span
              className={`font-medium text-sm ${
                selectedNetwork === network.name
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {network.name}
            </span>
          </button>
        ))}
      </div>

      {/* Bundles Section */}
      <section className="flex-1 px-6 pb-20">
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
            {bundles.map((bundle) => (
              <div
                key={bundle._id}
                onClick={() =>
                  bundle.isActive && handleCardClick(bundle._id)
                }
                className={`group bg-white rounded-2xl shadow-md hover:shadow-2xl border transition-all duration-500 ease-out opacity-0 animate-fadeIn ${
                  networks.find((n) => n.name === selectedNetwork)?.accentColor
                } ${
                  bundle.isActive
                    ? "cursor-pointer hover:-translate-y-1 hover:scale-[1.02] active:scale-95"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                {/* Header */}
                <div
                  className={`bg-gradient-to-r ${
                    networks.find((n) => n.name === selectedNetwork)?.gradient
                  } p-4 flex justify-between items-center text-white shadow-inner`}
                >
                  <h3 className="text-lg font-semibold">{bundle.name}</h3>
                  <Image
                    src={
                      networks.find((n) => n.name === selectedNetwork)?.logo ||
                      ""
                    }
                    alt={bundle.name}
                    width={48}
                    height={48}
                    className="object-contain drop-shadow-sm"
                  />
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                  <p className="text-gray-800 text-3xl font-bold mb-2">
                    {bundle.size}
                  </p>
                  <p className="text-gray-600 text-lg mb-4">GHS {bundle.price}</p>

                  <Button
                    variant="outline"
                    disabled={!bundle.isActive}
                    className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                      bundle.isActive
                        ? "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        : "border-gray-400 text-gray-400"
                    }`}
                  >
                    {bundle.isActive ? "Buy Now" : "Unavailable"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BundlesPage;
