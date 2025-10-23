"use client";

import { Signal, Wifi, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

interface Stats {
  total: number;
  active: number;
  networks: number;
  offsetY: number;
}

interface BundleHeroProps {
  stats: Stats;
}

const BundleHero: React.FC<BundleHeroProps> = ({ stats }) => {
  const { total, active, networks } = stats;
  const networkLogos = ["MTN", "Telecel", "AirtelTigo", "Vodafone"];

  return (
    <section className="relative w-full bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 text-white overflow-hidden py-20">
      {/* Decorative Background */}
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 320"
      >
        <path
          fill="white"
          fillOpacity="0.05"
          d="M0,160L60,170.7C120,181,240,203,360,218.7C480,235,600,245,720,224C840,203,960,149,1080,144C1200,139,1320,181,1380,202.7L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
        />
      </svg>

      <div className="relative z-10 container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left Section */}
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            <span className="flex items-center gap-3">
              <Signal className="w-10 h-10 text-yellow-400 animate-pulse" />
              Fast & Reliable Data Bundles
            </span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-lg">
            Discover affordable and seamless data plans across all major networks. Choose the right bundle for your needs and stay connected.
          </p>

          {/* Stats Cards */}
          <div className="mt-8 flex flex-wrap gap-6">
            <StatCard icon={<Signal className="w-6 h-6 text-yellow-400 mb-1" />} value={total} label="Total Bundles" />
            <StatCard icon={<Wifi className="w-6 h-6 text-blue-400 mb-1" />} value={active} label="Active Bundles" />
            <StatCard icon={<BarChart2 className="w-6 h-6 text-purple-400 mb-1" />} value={networks} label="Networks Supported" />
          </div>

          {/* Network Logos */}
          <div className="mt-8 flex flex-wrap gap-4">
            {networkLogos.map((network) => (
              <motion.span
                key={network}
                className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white font-semibold hover:bg-white/20 transition"
                whileHover={{ scale: 1.05 }}
              >
                {network}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Right Section - Illustration or Graphic */}
        <motion.div
          className="flex-1 hidden md:flex justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Professional Graphic Placeholder */}
          <div className="w-96 h-96 bg-white/10 rounded-3xl border border-white/20 flex items-center justify-center">
            <span className="text-white/70 text-lg">Your Illustration Here</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==============================
// Subcomponents
// ==============================
const StatCard: React.FC<{ icon: React.ReactNode; value: number; label: string }> = ({ icon, value, label }) => (
  <motion.div
    className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 flex flex-col items-center min-w-[130px] hover:bg-white/20 cursor-pointer"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    {icon}
    <span className="text-2xl font-bold mt-2">{value}</span>
    <span className="text-sm text-white/80 mt-1 text-center">{label}</span>
  </motion.div>
);

export default BundleHero;
