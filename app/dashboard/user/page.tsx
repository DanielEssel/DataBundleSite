"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Package, Clock } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import OrderModal from "@/components/OrderModal";
import OrdersTable, { Order } from "@/components/OrdersTable";

// ============================================================================
// TYPES
// ============================================================================

interface Bundle {
  _id: string;
  name: string;
  price: number;
  telcoCode: string;
  validity?: string;
  dataAmount?: string;
}

interface UserProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface NetworkConfig {
  color: string;
  bgColor: string;
  lightBg: string;
  logo: React.ReactElement;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const WHATSAPP_SUPPORT_NUMBER = "233555168047";
const ITEMS_PER_PAGE = 5;

const NETWORK_CONFIG: Record<string, NetworkConfig> = {
  MTN: {
    color: "#FFD700",
    bgColor: "bg-yellow-400",
    lightBg: "bg-yellow-50",
    logo: <img src="/logos/mtn.png" alt="MTN" className="w-6 h-6" />,
  },
  VODAFONE: {
    color: "#E60000",
    bgColor: "bg-red-500",
    lightBg: "bg-red-50",
    logo: <img src="/logos/vodafone.png" alt="Vodafone" className="w-6 h-6" />,
  },
  AIRTELTIGO: {
    color: "#0066CC",
    bgColor: "bg-blue-600",
    lightBg: "bg-blue-50",
    logo: <img src="/logos/at.png" alt="AirtelTigo" className="w-6 h-6" />,
  },
  TELECEL: {
    color: "#E60000",
    bgColor: "bg-red-500",
    lightBg: "bg-red-50",
    logo: <img src="/logos/tel.png" alt="Telecel" className="w-6 h-6" />,
  },
  OTHER: {
    color: "#4B5563",
    bgColor: "bg-gray-500",
    lightBg: "bg-gray-50",
    logo: <Package className="w-6 h-6 text-gray-600" />,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getNetworkConfig = (telcoCode: string): NetworkConfig => {
  return NETWORK_CONFIG[telcoCode?.toUpperCase()] || NETWORK_CONFIG.OTHER;
};

const getUserDisplayName = (user: UserProfile): string => {
  return (
    user.name ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "User"
  );
};

const handleUnauthorized = (): void => {
  localStorage.removeItem("authToken");
  window.location.href = "/login";
};

// ============================================================================
// COMPONENTS
// ============================================================================

const NetworkFilterButton: React.FC<{
  network: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ network, isActive, onClick }) => {
  const config = getNetworkConfig(network);

  return (
    <button
      onClick={onClick}
      className={`px-3 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm transition-all border-2 flex items-center space-x-1 md:space-x-2 ${
        isActive
          ? "text-white border-transparent"
          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
      }`}
      style={isActive ? { backgroundColor: config.color } : {}}
    >
      <span className="w-4 h-4 md:w-6 md:h-6 flex items-center justify-center">
        {config.logo}
      </span>
      <span className="sm:inline">{network}</span>
    </button>
  );
};

const BundleCard: React.FC<{
  bundle: Bundle;
  onBuyClick: (bundle: Bundle) => void;
}> = ({ bundle, onBuyClick }) => {
  const config = getNetworkConfig(bundle.telcoCode);

  return (
    <div
      className="relative border-2 border-gray-200 rounded-xl p-3 bg-white hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between"
      style={{ borderTop: `4px solid ${config.color}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className={`${config.lightBg} p-1.5 rounded-md flex items-center justify-center`}
        >
          {config.logo}
        </div>
        <span className="text-xs text-gray-500">{bundle.validity || "—"}</span>
      </div>

      <div className="text-center mb-2">
        <p className="text-sm md:text-lg font-bold text-gray-900 line-clamp-2">
          {bundle.name}
        </p>
        <p className="text-xs font-medium text-gray-600">{bundle.telcoCode}</p>
      </div>

      <div className="flex justify-between items-center gap-2">
        <span className="text-xs md:text-sm font-semibold text-gray-900">
          ₵{bundle.price?.toFixed(2) || "0.00"}
        </span>
        <button
          onClick={() => onBuyClick(bundle)}
          className="hover:opacity-90 text-white px-2 md:px-3 py-1 rounded-md text-xs font-medium transition-all"
          style={{ backgroundColor: config.color }}
        >
          Buy
        </button>
      </div>
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen text-gray-600">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading dashboard...</p>
    </div>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex justify-center items-center min-h-screen text-red-600">
    <div className="text-center">
      <p className="text-xl font-semibold mb-4">Error: {message}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  </div>
);

const WhatsAppButton: React.FC = () => (
  <a
    href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}`}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110"
    aria-label="Contact support on WhatsApp"
  >
    <FaWhatsapp className="w-6 h-6" />
  </a>
);

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function Dashboard() {
  // State
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("MTN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Fetch Dashboard Data
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      setError("No auth token found. Please login.");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userRes, bundlesRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/bundles?page=1`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/orders?page=1&limit=10`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Handle unauthorized access
        if (
          userRes.status === 401 ||
          bundlesRes.status === 401 ||
          ordersRes.status === 401
        ) {
          handleUnauthorized();
          return;
        }

        // Check for other errors
        if (!userRes.ok || !bundlesRes.ok || !ordersRes.ok) {
          throw new Error("Failed to load some dashboard data");
        }

        // Parse responses
        const [userJson, bundlesJson, ordersJson] = await Promise.all([
          userRes.json(),
          bundlesRes.json(),
          ordersRes.json(),
        ]);

        // Set data
        setUserData(userJson.data || userJson);
        setBundles(bundlesJson.data?.data || []);
        setOrders(ordersJson.data?.orders || []);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Group Bundles by Network
  const bundlesByNetwork = useMemo(() => {
    return bundles.reduce((acc: Record<string, Bundle[]>, bundle) => {
      const key = bundle.telcoCode?.toUpperCase() || "OTHER";
      if (!acc[key]) acc[key] = [];
      acc[key].push(bundle);
      return acc;
    }, {});
  }, [bundles]);

  // Event Handlers
  const handleBuyClick = useCallback((bundle: Bundle) => {
    setSelectedBundle(bundle);
    setIsOrderModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsOrderModalOpen(false);
    setSelectedBundle(null);
  }, []);

  const handleOrderSuccess = useCallback(() => {
    setIsOrderModalOpen(false);
    setSelectedBundle(null);

    // Refresh orders
    const token = localStorage.getItem("authToken");
    if (!token) return;

    fetch(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          handleUnauthorized();
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setOrders(data.data?.orders || []);
        }
      })
      .catch((err) => console.error("Failed to refresh orders:", err));
  }, []);

  // Loading / Error States
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!userData) return null;

  const userName = getUserDisplayName(userData);
  const lastOrderDate = orders[0]?.createdAt 
    ? new Date(orders[0].createdAt).toLocaleDateString()
    : "N/A";

  // Render
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}!
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span>
                Total Purchases:{" "}
                <span className="font-semibold text-gray-900">
                  {orders.length}
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>
                Last Purchase:{" "}
                <span className="font-semibold text-gray-900">
                  {lastOrderDate}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Bundles Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Available Bundles
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.keys(bundlesByNetwork).map((network) => (
                <NetworkFilterButton
                  key={network}
                  network={network}
                  isActive={selectedNetwork === network}
                  onClick={() => setSelectedNetwork(network)}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {bundlesByNetwork[selectedNetwork]?.map((bundle) => (
              <BundleCard
                key={bundle._id}
                bundle={bundle}
                onBuyClick={handleBuyClick}
              />
            ))}
          </div>
        </div>

        {/* Purchase History Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Recent Purchase History
            </h2>
            <a
              href="dashboard/user/orders"
              className="text-sm md:text-base text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              View All →
            </a>
          </div>
          <OrdersTable
            orders={orders}
            page={1}
            pageSize={10}
            totalOrders={orders.length}
            totalPages={1}
            setPage={() => {}}
          />
        </div>
      </div>

      {/* WhatsApp Support Button */}
      <WhatsAppButton />

      {/* Order Modal */}
      {selectedBundle && (
        <OrderModal
          bundleId={selectedBundle?._id || ""}
          bundleName={selectedBundle?.name || ""}
          price={selectedBundle?.price || 0}
          isOpen={isOrderModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}