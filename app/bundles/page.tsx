"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Signal, X } from "lucide-react";
import Image from "next/image";
import BundleHero from "@/components/BundleHero";
import Navbar from "@/components/Navbar";

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
    logo: "/image/telecel.png",
    gradient: "from-red-500 to-red-600",
    accentColor: "border-red-500",
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

  // ==============================
  // 🔹 State
  // ==============================
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [networkFilter, setNetworkFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [offsetY, setOffsetY] = useState(0);

  // ==============================
  // 🔒 Auth Check
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
  }, [router]);

  // ==============================
  // 🛰️ Fetch Bundles
  // ==============================
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

  // ==============================
  // 🪄 Parallax Effect
  // ==============================
  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY * 0.3);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ==============================
  // 🧠 Filtered Bundles & Stats
  // ==============================
  const filteredBundles = useMemo(() => {
    return bundles.filter((bundle) => {
      const matchesNetwork =
        networkFilter === "all" ||
        bundle.telcoCode?.toLowerCase() === networkFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        bundle.isActive === (statusFilter === "active");

      const matchesSearch =
        !search.trim() || bundle.name.toLowerCase().includes(search.toLowerCase());

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
      offsetY,
    }),
    [bundles, offsetY]
  );

  const clearFilters = () => {
    setSearch("");
    setNetworkFilter("all");
    setStatusFilter("all");
  };

  const handleCardClick = (bundleId: string) => {
    router.push(`/bundles/${bundleId}`);
  };

  // ==============================
  // 🌀 Loading / Error UI
  // ==============================
  if (loading)
    return (
      <LoadingScreen message="Loading available bundles..." />
    );

  if (error)
    return (
      <ErrorScreen error={error} />
    );

  // ==============================
  // 🧩 Main UI
  // ==============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar/>
      <BundleHero />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Filters
          search={search}
          setSearch={setSearch}
          networkFilter={networkFilter}
          setNetworkFilter={setNetworkFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />

        {filteredBundles.length === 0 ? (
          <NoBundles hasActiveFilters={hasActiveFilters} clearFilters={clearFilters} />
        ) : (
          <BundlesGrid
            bundles={filteredBundles}
            networkConfig={networkConfig}
            handleCardClick={handleCardClick}
          />
        )}
      </section>
    </div>
  );
}

// ==============================
// 🔹 Subcomponents
// ==============================

const LoadingScreen: React.FC<{ message: string }> = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium text-lg">{message}</p>
    </div>
  </div>
);

const ErrorScreen: React.FC<{ error: string }> = ({ error }) => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6">
    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-100 mb-6">
      <Signal className="w-10 h-10 text-red-500" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-3">
      {error.includes("No bundles") ? "No Bundles Found" : "Error Loading Data"}
    </h3>
    <p className="text-gray-600 mb-6 max-w-md">
      {error.includes("No bundles") ? "There are currently no bundles available." : error}
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

interface FiltersProps {
  search: string;
  setSearch: (val: string) => void;
  networkFilter: string;
  setNetworkFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  hasActiveFilters: boolean | string;
  clearFilters: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  search,
  setSearch,
  networkFilter,
  setNetworkFilter,
  statusFilter,
  setStatusFilter,
  hasActiveFilters,
  clearFilters,
}) => (
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
);

interface NoBundlesProps {
  hasActiveFilters: boolean | string;
  clearFilters: () => void;
}

const NoBundles: React.FC<NoBundlesProps> = ({ hasActiveFilters, clearFilters }) => (
  <div className="text-center py-12">
    <Signal className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No bundles match your filters</h3>
    <p className="text-gray-500 mb-4">Try adjusting search or filters.</p>
    {hasActiveFilters && (
      <button
        onClick={clearFilters}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
      >
        Clear All Filters
      </button>
    )}
  </div>
);

interface BundlesGridProps {
  bundles: Bundle[];
  networkConfig: Record<string, any>;
  handleCardClick: (bundleId: string) => void;
}

const BundlesGrid: React.FC<BundlesGridProps> = ({ bundles, networkConfig, handleCardClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {bundles.map((bundle) => {
      const telcoKey = bundle.telcoCode?.toUpperCase() || "MTN";
      const network = networkConfig[telcoKey] || networkConfig.MTN;

      return (
        <div
          key={bundle._id}
          onClick={() => bundle.isActive && handleCardClick(bundle._id)}
          className={`group bg-white rounded-xl shadow hover:shadow-xl border ${
            network.accentColor
          } transition-all duration-300 overflow-hidden ${
            bundle.isActive ? "cursor-pointer hover:-translate-y-1 active:scale-95" : "opacity-60 cursor-not-allowed"
          }`}
        >
          <div className={`bg-gradient-to-r ${network.gradient} p-3 flex justify-between items-center`}>
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
                bundle.isActive ? "bg-white text-gray-800" : "bg-gray-300 text-gray-600"
              }`}
            >
              {bundle.isActive ? "✓ Active" : "✗ Inactive"}
            </span>
          </div>

          <div className="p-4">
            <h3 className="font-bold text-lg text-gray-900 mb-1">{bundle.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{bundle.description}</p>
            <div className={`${network.bgColor} p-3 rounded-lg`}>
              <p className="text-xs uppercase tracking-wide text-gray-600">Price</p>
              <p className={`text-2xl font-bold ${network.textColor}`}>₵{bundle.price.toFixed(2)}</p>
            </div>
            <div className="text-sm text-center mt-3 font-semibold text-blue-600 group-hover:text-blue-800">
              {bundle.isActive ? "View Details →" : "Unavailable"}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
