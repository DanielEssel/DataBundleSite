"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Package, Clock } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import OrderModal from "@/components/OrderModal";
import OrdersTable, { Order } from "@/components/OrdersTable";
import { apiCache, CACHE_TTL } from "@/lib/cache";

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
const WHATSAPP_CHANNEL_LINK = "https://chat.whatsapp.com/FWGf9yOAMFlG9102qPIha3";
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

const WhatsAppButton: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* WhatsApp Menu */}
      {showMenu && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slide-up">
          <a
            href={WHATSAPP_CHANNEL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 whitespace-nowrap"
          >
            <FaWhatsapp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Join Our Channel</span>
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors whitespace-nowrap"
          >
            <FaWhatsapp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Contact Support</span>
          </a>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl"
        aria-label="WhatsApp menu"
      >
        <FaWhatsapp className="w-6 h-6" />
      </button>
    </div>
  );
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function Dashboard() {
  // Hooks
  const router = useRouter();

  // State
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("MTN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [showDeliveryNotice, setShowDeliveryNotice] = useState(true);

  // ✅ Check auth on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const user = localStorage.getItem("user");

      if (!token || !user) {
        router.replace("/auth/login");
        return;
      }

      try {
        const userData = JSON.parse(user);
        if (userData?.role === "admin") {
          router.replace("/dashboard/admin");
          return;
        }
        setAuthorized(true);
      } catch (error) {
        console.error("Error parsing user:", error);
        router.replace("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  // Fetch Dashboard Data
  useEffect(() => {
    if (!authorized) return;

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

        const [userJson, bundlesJson, ordersJson] = await Promise.all([
          apiCache.getOrFetch(
            'user-profile',
            () => fetch(`${API_BASE}/api/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.json()),
            CACHE_TTL.LONG
          ),
          apiCache.getOrFetch(
            'bundles-list',
            () => fetch(`${API_BASE}/api/bundles?page=1`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.json()),
            CACHE_TTL.MEDIUM
          ),
          apiCache.getOrFetch(
            'orders-list',
            () => fetch(`${API_BASE}/api/orders?page=1&limit=10`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.json()),
            CACHE_TTL.MEDIUM
          ),
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
  }, [authorized]);

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

  // Delivery Notice Modal Component
  const DeliveryNoticeModal: React.FC = () => (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-opacity duration-300 ${
        showDeliveryNotice ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setShowDeliveryNotice(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 p-6 text-white text-center">
          <div className="flex justify-center mb-3">
            <Clock className="w-12 h-12 text-blue-100" />
          </div>
          <h2 className="text-2xl font-bold">Delivery Timeline</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">
            <p className="text-gray-900 font-semibold mb-3">
              Bundle Delivery Assurance
            </p>
            <p className="text-gray-700 leading-relaxed text-sm">
              We are committed to delivering your data bundle within <span className="font-bold text-blue-600">10 to 20 minutes</span> of successful payment confirmation. 
            </p>
          </div>

          <div className="space-y-3 border-t border-gray-200 pt-4">
            

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Quick Processing</p>
                <p className="text-xs text-gray-600">10-20 minutes delivery guarantee</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">24/7 Support</p>
                <p className="text-xs text-gray-600">Contact us anytime if you need help</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Channel Invitation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-green-900 mb-2">
              <span className="font-semibold">Stay Updated:</span> Join our WhatsApp channel for the latest updates, offers, and support!
            </p>
            <a
              href={WHATSAPP_CHANNEL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded transition-colors"
            >
              <FaWhatsapp className="w-3 h-3" />
              Join Channel
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={() => setShowDeliveryNotice(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Got It, Let's Get Started
          </button>
        </div>
      </div>
    </div>
  );

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
        {selectedNetwork === "MTN" && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-shrink-0 pt-0.5">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-900 mb-2">
                  ⚠️ Important: Unsupported SIM Types
                </p>
                <p className="text-sm text-red-800 mb-4">
                  Our DATA REQUEST doesn't support these SIM types. Any data transferred will be <span className="font-semibold">burned and cannot be reversed</span>. You will be charged for the loss.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-x-4 gap-y-2">
                  {[
                    "Turbonet SIM",
                    "Merchant SIM",
                    "EVD SIM",
                    "Broadband SIM",
                    "Blacklisted SIM",
                    "Roaming SIM",
                    "Different Network",
                    "Wrong Number",
                    "Inactive Number"
                  ].map((sim) => (
                    <div key={sim} className="flex items-center text-sm text-red-700">
                      <span className="mr-2 text-red-500">•</span>
                      <span>{sim}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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

      {/* Delivery Notice Modal */}
      {authorized && <DeliveryNoticeModal />}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}