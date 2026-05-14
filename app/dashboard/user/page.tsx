"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Package, Clock, ShoppingBag, ChevronRight, Wifi, AlertCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import OrderModal from "@/components/OrderModal";
import OrdersTable, { Order } from "@/components/OrdersTable";
import { apiCache, CACHE_TTL } from "@/lib/cache";
import { authFetch } from "@/lib/authFetch";
import { getTokenExpiryMs, isTokenExpired, logout } from "@/lib/jwtAuth";

// ============================================================================
// TYPES
// ============================================================================

interface Bundle {
  _id: string;
  name: string;
  price: number;
  telcoCode: string;
  category?: "regular" | "bigdata";
  validity?: string;
  dataAmount?: string;
  isActive?: boolean;
}

interface UserProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface NetworkConfig {
  color: string;
  bgColor: string;
  lightBg: string;
  ringColor: string;
  logo: React.ReactElement;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const WHATSAPP_SUPPORT_NUMBER = "233555168047";
const WHATSAPP_CHANNEL_LINK = "https://chat.whatsapp.com/FWGf9yOAMFlG9102qPIha3";

const TAB_KEYS = {
  AT_ISHARE: "AIRTELTIGO_ISHARE",
  AT_BIGDATA: "AIRTELTIGO_BIGDATA",
} as const;

const NETWORK_CONFIG: Record<string, NetworkConfig> = {
  MTN: {
    color: "#FFD700",
    bgColor: "bg-yellow-400",
    lightBg: "bg-yellow-50",
    ringColor: "ring-yellow-300",
    logo: <img src="/logos/mtn.png" alt="MTN" className="w-5 h-5 object-contain" />,
  },
  VODAFONE: {
    color: "#E60000",
    bgColor: "bg-red-500",
    lightBg: "bg-red-50",
    ringColor: "ring-red-300",
    logo: <img src="/logos/vodafone.png" alt="Vodafone" className="w-5 h-5 object-contain" />,
  },
  AIRTELTIGO: {
    color: "#0066CC",
    bgColor: "bg-blue-600",
    lightBg: "bg-blue-50",
    ringColor: "ring-blue-300",
    logo: <img src="/logos/at.png" alt="AirtelTigo" className="w-5 h-5 object-contain" />,
  },
  TELECEL: {
    color: "#E60000",
    bgColor: "bg-red-500",
    lightBg: "bg-red-50",
    ringColor: "ring-red-300",
    logo: <img src="/logos/tel.png" alt="Telecel" className="w-5 h-5 object-contain" />,
  },
  OTHER: {
    color: "#4B5563",
    bgColor: "bg-gray-500",
    lightBg: "bg-gray-50",
    ringColor: "ring-gray-300",
    logo: <Package className="w-5 h-5 text-gray-600" />,
  },
};

// ============================================================================
// UTILS
// ============================================================================

const getTabKeyForBundle = (b: Bundle) => {
  const telco = (b.telcoCode || "").toUpperCase();
  if (telco === "AIRTELTIGO") {
    return (b.category || "regular") === "bigdata" ? TAB_KEYS.AT_BIGDATA : TAB_KEYS.AT_ISHARE;
  }
  return telco || "OTHER";
};

const getTabLabel = (tabKey: string) => {
  if (tabKey === TAB_KEYS.AT_ISHARE) return "Ishare";
  if (tabKey === TAB_KEYS.AT_BIGDATA) return "BigTime";
  return tabKey.charAt(0) + tabKey.slice(1).toLowerCase();
};

const getTabConfig = (tabKey: string): NetworkConfig => {
  if (tabKey === TAB_KEYS.AT_ISHARE || tabKey === TAB_KEYS.AT_BIGDATA) return NETWORK_CONFIG.AIRTELTIGO;
  return NETWORK_CONFIG[tabKey] || NETWORK_CONFIG.OTHER;
};

const getUserDisplayName = (user: UserProfile): string =>
  user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";

const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("");

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Network tab pill */
const NetworkTab: React.FC<{
  tabKey: string;
  isActive: boolean;
  count: number;
  onClick: () => void;
}> = ({ tabKey, isActive, count, onClick }) => {
  const config = getTabConfig(tabKey);
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border-2
        ${isActive
          ? "text-white border-transparent shadow-md"
          : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
        }`}
      style={isActive ? { backgroundColor: config.color, borderColor: config.color } : {}}
    >
      <span className="w-5 h-5 flex items-center justify-center shrink-0">{config.logo}</span>
      <span>{getTabLabel(tabKey)}</span>
      <span
        className={`text-xs px-1.5 py-0.5 rounded-full font-semibold tabular-nums
          ${isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"}`}
      >
        {count}
      </span>
    </button>
  );
};

/** Bundle card */
const BundleCard: React.FC<{
  bundle: Bundle;
  onBuyClick: (bundle: Bundle) => void;
}> = ({ bundle, onBuyClick }) => {
  const baseTelco = (bundle.telcoCode || "").toUpperCase();
  const config = NETWORK_CONFIG[baseTelco] || NETWORK_CONFIG.OTHER;
  const isActive = bundle.isActive !== false;

  const subLabel =
    baseTelco === "AIRTELTIGO"
      ? bundle.category === "bigdata" ? "BigTime Data" : "Ishare"
      : bundle.telcoCode;

  return (
    <div
      className={`relative rounded-2xl bg-white border-2 border-gray-100 flex flex-col transition-all duration-200
        ${isActive ? "hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer" : "opacity-60"}`}
    >
      {/* Telco colour bar */}
      <div className="h-1 rounded-t-xl w-full" style={{ backgroundColor: config.color }} />

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className={`p-1.5 rounded-lg ${config.lightBg} shrink-0`}>
            {config.logo}
          </div>
          {bundle.validity && (
            <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full whitespace-nowrap">
              {bundle.validity}
            </span>
          )}
        </div>

        {/* Name + sublabel */}
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{bundle.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="text-base font-bold text-gray-900 tabular-nums">
            ₵{(bundle.price ?? 0).toFixed(2)}
          </span>

          {isActive ? (
            <button
              onClick={() => onBuyClick(bundle)}
              aria-label={`Buy ${bundle.name}`}
              className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-95 shadow-sm"
              style={{ backgroundColor: config.color }}
            >
              Buy
            </button>
          ) : (
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/** Stat pill in the welcome section */
const StatPill: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon, label, value,
}) => (
  <div className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
    <span className="text-blue-500">{icon}</span>
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-bold text-gray-900">{value}</span>
  </div>
);

/** Full-screen loading */
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="text-center space-y-4">
      <div className="relative mx-auto w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-gray-400 font-medium">Loading dashboard…</p>
    </div>
  </div>
);

/** Full-screen error */
const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
    <div className="text-center max-w-sm space-y-4">
      <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-800 mb-1">Something went wrong</p>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
);

/** Floating WhatsApp FAB */
const WhatsAppFab: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Menu */}
      <div
        className={`flex flex-col gap-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 origin-bottom-right
          ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        <a
          href={WHATSAPP_CHANNEL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-5 py-3.5 hover:bg-green-50 transition-colors border-b border-gray-50"
        >
          <FaWhatsapp className="w-4 h-4 text-green-500 shrink-0" />
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Join our channel</span>
        </a>
        <a
          href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-5 py-3.5 hover:bg-green-50 transition-colors"
        >
          <FaWhatsapp className="w-4 h-4 text-green-500 shrink-0" />
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Contact support</span>
        </a>
      </div>

      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="WhatsApp menu"
        className={`w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:shadow-xl
          ${open ? "rotate-180" : ""}`}
      >
        <FaWhatsapp className={`w-6 h-6 transition-transform duration-200 ${open ? "scale-90" : ""}`} />
      </button>
    </div>
  );
};

/** Delivery notice modal */
const DeliveryNoticeModal: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    onClick={onDismiss}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Icon header */}
      <div className="flex flex-col items-center pt-8 pb-5 px-6 text-center border-b border-gray-100">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Delivery Timeline</h2>
        <p className="text-sm text-gray-500 mt-1">What to expect after payment</p>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Timeline */}
        <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
          <p className="text-sm text-gray-700 leading-relaxed">
            Your data bundle will be delivered within{" "}
            <span className="font-bold text-blue-600">10 – 20 minutes</span> of successful payment confirmation.
          </p>
        </div>

        {/* WhatsApp CTA */}
        <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-600 font-medium">Get updates & offers</p>
          <a
            href={WHATSAPP_CHANNEL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <FaWhatsapp className="w-3 h-3" />
            Join Channel
          </a>
        </div>
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={onDismiss}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          Got it, let&apos;s go!
        </button>
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export default function Dashboard() {
  const router = useRouter();

  const [userData, setUserData]           = useState<UserProfile | null>(null);
  const [bundles, setBundles]             = useState<Bundle[]>([]);
  const [orders, setOrders]               = useState<Order[]>([]);
  const [selectedTab, setSelectedTab]     = useState<string>(TAB_KEYS.AT_ISHARE);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [authorized, setAuthorized]       = useState(false);
  const [showDeliveryNotice, setShowDeliveryNotice] = useState(true);

  // Auth guard
  useEffect(() => {
    let timer: number | undefined;

    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const user  = localStorage.getItem("user");

      if (!token || !user) { router.replace("/login"); return; }
      if (isTokenExpired(token)) { logout(router); return; }

      const expMs = getTokenExpiryMs(token);
      if (expMs) {
        const msLeft = expMs - Date.now();
        timer = window.setTimeout(() => logout(router), Math.max(msLeft, 0));
      }

      try {
        const parsed = JSON.parse(user);
        if (parsed?.role === "admin") { router.replace("/dashboard/admin"); return; }
        setAuthorized(true);
      } catch {
        router.replace("/login");
      }
    };

    checkAuth();

    const onAuthChanged = () => {
      if (!localStorage.getItem("authToken")) router.replace("/login");
    };
    window.addEventListener("userAuthChanged", onAuthChanged);

    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("userAuthChanged", onAuthChanged);
    };
  }, [router]);

  // Data fetch
  useEffect(() => {
    if (!authorized) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userJson, bundlesJson, ordersJson] = await Promise.all([
          apiCache.getOrFetch(
            "user-profile",
            () => authFetch(router, `${API_BASE}/api/auth/profile`).then((r) => r.json()),
            CACHE_TTL.LONG
          ),
          apiCache.getOrFetch(
            "bundles-list",
            () => authFetch(router, `${API_BASE}/api/bundles?page=1`).then((r) => r.json()),
            CACHE_TTL.MEDIUM
          ),
          apiCache.getOrFetch(
            "orders-list",
            () => authFetch(router, `${API_BASE}/api/orders?page=1&limit=10`).then((r) => r.json()),
            CACHE_TTL.MEDIUM
          ),
        ]);

        setUserData(userJson?.data || userJson);
        setBundles(bundlesJson?.data?.data || []);
        setOrders(ordersJson?.data?.orders || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred";
        console.error("Dashboard fetch error:", err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authorized, router]);

  // Bundle → tab grouping
  const bundlesByTab = useMemo(
    () =>
      bundles.reduce<Record<string, Bundle[]>>((acc, b) => {
        const key = getTabKeyForBundle(b);
        (acc[key] ||= []).push(b);
        return acc;
      }, {}),
    [bundles]
  );

  // Ordered tab keys
  const tabOrder = useMemo(() => {
    const preferredOrder = [
      TAB_KEYS.AT_ISHARE,
      TAB_KEYS.AT_BIGDATA,
      "MTN",
      "TELECEL",
      "VODAFONE",
    ];
    const others = Object.keys(bundlesByTab).filter((k) => !preferredOrder.includes(k));
    return [...preferredOrder, ...others].filter((k) => bundlesByTab[k]?.length);
  }, [bundlesByTab]);

  // Fallback tab selection
  useEffect(() => {
    if (!tabOrder.length) return;
    if (!bundlesByTab[selectedTab]?.length) {
      setSelectedTab(
        (bundlesByTab[TAB_KEYS.AT_ISHARE]?.length && TAB_KEYS.AT_ISHARE) ||
        (bundlesByTab[TAB_KEYS.AT_BIGDATA]?.length && TAB_KEYS.AT_BIGDATA) ||
        tabOrder[0]
      );
    }
  }, [tabOrder, bundlesByTab, selectedTab]);

  const handleBuyClick = useCallback((bundle: Bundle) => {
    setSelectedBundle(bundle);
    setIsOrderModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsOrderModalOpen(false);
    setSelectedBundle(null);
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorDisplay message={error} />;
  if (!userData) return null;

  const userName     = getUserDisplayName(userData);
  const initials     = getInitials(userName);
  const lastOrderDate =
    (orders as { createdAt?: string }[])[0]?.createdAt
      ? new Date((orders as { createdAt?: string }[])[0].createdAt!).toLocaleDateString("en-GH", {
          day: "numeric", month: "short", year: "numeric",
        })
      : "None yet";

  const currentBundles = bundlesByTab[selectedTab] ?? [];

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-8">

        {/* ── Welcome ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-base font-bold shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Welcome back</p>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{userName}</h1>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            <StatPill
              icon={<ShoppingBag className="w-4 h-4" />}
              label="Purchases"
              value={orders.length.toString()}
            />
            <StatPill
              icon={<Clock className="w-4 h-4" />}
              label="Last purchase"
              value={lastOrderDate}
            />
          </div>
        </div>

        {/* ── Bundle Store ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Panel header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-semibold text-gray-900">Available Bundles</h2>
            </div>

            {/* Network tabs */}
            <div className="flex flex-wrap gap-2">
              {tabOrder.map((tabKey) => (
                <NetworkTab
                  key={tabKey}
                  tabKey={tabKey}
                  isActive={selectedTab === tabKey}
                  count={bundlesByTab[tabKey]?.length ?? 0}
                  onClick={() => setSelectedTab(tabKey)}
                />
              ))}
            </div>
          </div>

          {/* Bundle grid */}
          <div className="p-5">
            {currentBundles.length === 0 ? (
              <div className="py-16 text-center">
                <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No bundles available for this network</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {currentBundles.map((bundle) => (
                  <BundleCard key={bundle._id} bundle={bundle} onBuyClick={handleBuyClick} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Orders ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-semibold text-gray-900">Recent Purchases</h2>
            </div>
            <a
              href="dashboard/user/orders"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="p-5">
            {orders.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No purchases yet — buy your first bundle above!</p>
              </div>
            ) : (
              <OrdersTable
                orders={orders}
                page={1}
                pageSize={10}
                totalOrders={orders.length}
                totalPages={1}
                setPage={() => {}}
              />
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp FAB */}
      <WhatsAppFab />

      {/* Order Modal */}
      {selectedBundle && (
        <OrderModal
          bundleId={selectedBundle._id}
          bundleName={selectedBundle.name}
          price={selectedBundle.price}
          isOpen={isOrderModalOpen}
          onClose={handleModalClose}
        />
      )}

      {/* Delivery Notice */}
      {authorized && showDeliveryNotice && (
        <DeliveryNoticeModal onDismiss={() => setShowDeliveryNotice(false)} />
      )}
    </div>
  );
}