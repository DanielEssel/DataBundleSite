"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Signal, X } from "lucide-react";
import Image from "next/image";

// ==============================
// 🔹 Type Definitions
// ==============================
export interface Bundle {
  _id: string;
  name: string;
  description?: string;
  price: number;
  telcoCode: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  totalPages: number;
  currentPage: number;
  totalItems?: number;
}

interface BundlesApiResponse {
  success: boolean;
  message?: string;
  data: {
    data: Bundle[];
    pagination?: Pagination;
  };
}

// ==============================
// 🔹 Network Config
// ==============================
const networkConfig: Record<string, any> = {
  MTN: {
    name: "MTN",
    logo: "/image/mtn.png",
    gradient: "from-yellow-400 to-yellow-500",
    accentColor: "border-yellow-400",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-600",
  },
  VODAFONE: {
    name: "Telecel",
    logo: "/image/telecel.png", // ✅ Changed from vodafone.png to telecel.png
    gradient: "from-red-500 to-red-600",
    accentColor: "border-red-500", // ✅ Changed from red-400 to red-500 for better visibility
    bgColor: "bg-red-50",
    textColor: "text-red-600",
  },
  AIRTELTIGO: {
    name: "AirtelTigo",
    logo: "/image/airteltigo.png",
    gradient: "from-blue-500 to-indigo-600",
    accentColor: "border-blue-400",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
};

// ==============================
// 🔹 Bundles Page Component
// ==============================
export default function BundlesPage() {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [networkFilter, setNetworkFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [offsetY, setOffsetY] = useState(0);

  // ======================================================
  // 🔒 AUTH CHECK
  // ======================================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
  }, [router]);

  // ======================================================
  // 🛰️ FETCH BUNDLES
  // ======================================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchBundles = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${apiBase}/api/bundles?page=${page}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json: BundlesApiResponse = await res.json();

        if (!json.success || !json.data?.data) {
          throw new Error(json.message || "Failed to load bundles");
        }

        setBundles(json.data.data);
        setTotalPages(json.data.pagination?.totalPages || 1);
        if (json.data.data.length === 0) setError("No bundles available");
      } catch (err: any) {
        setError(err.message || "Unable to fetch bundles");
        setBundles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, [page, apiBase, router]);

  // ======================================================
  // 🪄 PARALLAX EFFECT
  // ======================================================
  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY * 0.3);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ======================================================
  // 🧠 FILTERS + STATS
  // ======================================================
  const filteredBundles = useMemo(() => {
    return bundles.filter((bundle) => {
      const matchesNetwork =
        networkFilter === "all" ||
        bundle.telcoCode?.toLowerCase() === networkFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        bundle.isActive === (statusFilter === "active");

      const matchesSearch =
        !search.trim() ||
        bundle.name.toLowerCase().includes(search.toLowerCase());

      return matchesNetwork && matchesStatus && matchesSearch;
    });
  }, [bundles, networkFilter, statusFilter, search]);

  const hasActiveFilters =
    search || networkFilter !== "all" || statusFilter !== "all";

  const stats = useMemo(
    () => ({
      total: bundles.length,
      active: bundles.filter((b) => b.isActive).length,
      networks: new Set(bundles.map((b) => b.telcoCode)).size,
    }),
    [bundles]
  );

  const clearFilters = () => {
    setSearch("");
    setNetworkFilter("all");
    setStatusFilter("all");
  };

  const handleCardClick = (bundleId: string) => {
    router.push(`/bundles/${bundleId}`);
  };

  // ======================================================
  // 🌀 RENDER STATES
  // ======================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">
            Loading available bundles...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-100 mb-6">
          <Signal className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {error.includes("No bundles")
            ? "No Bundles Found"
            : "Error Loading Data"}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          {error.includes("No bundles")
            ? "There are currently no bundles available."
            : error}
        </p>
        {!error.includes("No bundles") && (
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // ======================================================
  // 🧩 MAIN UI
  // ======================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    {/* ✅ HERO BANNER */}
<section className="relative w-full text-white text-center aspect-[16/5] flex flex-col justify-center overflow-hidden">
  {/* Background with Parallax */}
  <div
    className="absolute inset-0 transition-transform duration-300 ease-out"
    style={{ transform: `translateY(${offsetY * 0.1}px)` }}
  >
    {/* Custom gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700" />

    {/* Network pattern overlay */}
    <div 
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='white' stroke-width='2'/%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='white' stroke-width='2'/%3E%3Ccircle cx='50' cy='50' r='20' fill='none' stroke='white' stroke-width='2'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat'
      }}
    />

    {/* Dark overlay for contrast */}
    <div className="absolute inset-0 bg-black/20" />
  </div>

  {/* Network Logos Row */}
  <div className="relative z-10 flex items-center justify-center gap-4 mb-6">
    <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
      <span className="text-yellow-500 font-bold text-xl" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>MTN</span>
    </div>
    <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
      <span className="text-red-600 font-bold text-xl">Telecel</span>
    </div>
    <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
      <span className="text-blue-600 font-bold text-xl">AirtelTigo</span>
    </div>
  </div>

  {/* Foreground text */}
  <div className="relative z-10 px-4">
    <h1 className="text-4xl md:text-5xl font-bold flex items-center justify-center gap-2 drop-shadow-2xl">
      <Signal className="w-8 h-8 md:w-10 md:h-10 text-yellow-300" />
      Data Bundles
    </h1>
    <p className="text-blue-100 mt-3 text-lg md:text-xl max-w-2xl mx-auto drop-shadow">
      Explore the best data bundles across all major networks.
    </p>
  </div>

  {/* Phone illustration */}
  <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 z-10 hidden md:block">
    <div className="relative w-16 h-28 animate-pulse">
      {/* Phone body */}
      <div className="w-16 h-28 bg-gray-900 rounded-xl border-4 border-gray-700 shadow-2xl relative">
        {/* Screen */}
        <div className="w-14 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 m-0.5 rounded-lg overflow-hidden">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs mb-2">
              📶
            </div>
            <div className="text-white text-xs font-bold">5GB</div>
            <div className="text-white text-[8px] mt-1">Select Bundle</div>
          </div>
        </div>
      </div>
      {/* Hand/finger touching */}
      <div className="absolute -bottom-2 -right-4 w-10 h-10 bg-amber-200 rounded-full shadow-lg" style={{ borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)' }}>
        <div className="absolute -top-2 right-2 w-3 h-6 bg-amber-200 rounded-full" style={{ transform: 'rotate(25deg)' }} />
      </div>
    </div>
  </div>

  {/* Stats cards */}
  <div className="relative z-10 mt-10">
    <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 px-6">
      {[
        { label: "Total Bundles", value: stats.total },
        { label: "Active Offers", value: stats.active },
        { label: "Networks", value: stats.networks },
      ].map((s, i) => (
        <div
          key={i}
          className="bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-lg rounded-2xl p-5 text-center shadow-lg border border-white/30"
        >
          <div className="text-3xl font-bold text-white drop-shadow">
            {s.value}
          </div>
          <div className="text-sm text-blue-100 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* ✅ FILTER + GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bundles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg bg-white min-w-[150px]"
            >
              <option value="all">All Networks</option>
              <option value="MTN">MTN</option>
              <option value="VODAFONE">Telecel</option>
              <option value="AIRTELTIGO">AirtelTigo</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg bg-white min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end pt-3">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {filteredBundles.length === 0 ? (
          <div className="text-center py-12">
            <Signal className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No bundles match your filters
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting search or filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBundles.map((bundle) => {
              const telcoKey = bundle.telcoCode?.toUpperCase() || "MTN";
              const network = networkConfig[telcoKey] || networkConfig.MTN;

              return (
                <div
                  key={bundle._id}
                  onClick={() => bundle.isActive && handleCardClick(bundle._id)}
                  className={`group bg-white rounded-xl shadow hover:shadow-xl border ${
                    network.accentColor
                  } transition-all duration-300 overflow-hidden ${
                    bundle.isActive
                      ? "cursor-pointer hover:-translate-y-1 active:scale-95"
                      : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`bg-gradient-to-r ${network.gradient} p-3 flex justify-between items-center`}
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={network.logo}
                        alt={network.name}
                        width={64}
                        height={64}
                        className="w-8 h-8 rounded-md"
                      />
                      <span className="font-bold">{network.name}</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        bundle.isActive
                          ? "bg-white text-gray-800"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {bundle.isActive ? "✓ Active" : "✗ Inactive"}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {bundle.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {bundle.description}
                    </p>
                    <div className={`${network.bgColor} p-3 rounded-lg`}>
                      <p className="text-xs uppercase tracking-wide text-gray-600">
                        Price
                      </p>
                      <p className={`text-2xl font-bold ${network.textColor}`}>
                        ₵{bundle.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-sm text-center mt-3 font-semibold text-blue-600 group-hover:text-blue-800">
                      {bundle.isActive ? "View Details →" : "Unavailable"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
