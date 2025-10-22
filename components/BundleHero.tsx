"use client";

import { Signal, Wifi, BarChart2 } from "lucide-react";

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
  const { total, active, networks, offsetY } = stats;

  return (
    <section className="relative w-full bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 text-white overflow-hidden">
      {/* Decorative SVG background */}
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

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Section */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <Signal className="w-8 h-8 text-yellow-400" />
            Data Bundles
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-md">
            Discover the best data bundles across all major networks. Fast, reliable, and affordable.
          </p>

          {/* Stats Cards */}
          <div className="mt-4 flex flex-wrap gap-3">
            <StatCard icon={<Signal className="w-5 h-5 text-yellow-400 mb-1" />} value={total} label="Total" />
            <StatCard icon={<Wifi className="w-5 h-5 text-blue-400 mb-1" />} value={active} label="Active" />
            <StatCard icon={<BarChart2 className="w-5 h-5 text-purple-400 mb-1" />} value={networks} label="Networks" />
          </div>
        </div>

        {/* Right Section - Smaller Phone Illustration */}
        <div
          className="flex-1 flex justify-center md:justify-end transition-transform duration-500"
          style={{ transform: `translateY(${offsetY * 0.03}px)` }}
        >
          <PhoneIllustration />
        </div>
      </div>

      {/* Network Logos Row */}
      <div className="relative z-10 flex justify-center gap-6 py-4 border-t border-white/20">
        {["MTN", "Telecel", "AirtelTigo"].map((network) => (
          <span
            key={network}
            className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-white font-semibold hover:bg-white/20 transition"
          >
            {network}
          </span>
        ))}
      </div>
    </section>
  );
};

// ==============================
// 🔹 Subcomponents
// ==============================
const StatCard: React.FC<{ icon: React.ReactNode; value: number; label: string }> = ({ icon, value, label }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 flex flex-col items-center min-w-[100px] hover:bg-white/20 transition">
    {icon}
    <span className="text-xl font-bold">{value}</span>
    <span className="text-xs text-white/80">{label}</span>
  </div>
);

const PhoneIllustration: React.FC = () => (
  <div className="relative w-40 h-64">
    <div className="w-full h-full bg-gray-900 rounded-2xl border-2 border-gray-800 shadow-lg flex flex-col overflow-hidden">
      {/* Screen */}
      <div className="flex-1 bg-gradient-to-br from-blue-400 to-cyan-400 p-3 flex flex-col justify-center items-center gap-1 rounded-xl">
        <div className="bg-white w-6 h-6 rounded-full flex items-center justify-center text-xs">📶</div>
        <div className="text-white font-bold text-lg">5GB</div>
        <div className="text-white/80 text-xs">Select Bundle</div>
      </div>
      {/* Bottom button */}
      <button className="w-full bg-yellow-400 text-gray-900 font-bold py-1 hover:bg-yellow-500 transition">
        Buy Now
      </button>
    </div>
  </div>
);

export default BundleHero;