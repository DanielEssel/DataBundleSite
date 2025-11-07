"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Package, Clock, Wifi, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

interface Bundle {
  _id: string;
  name: string;
  price: number;
  telcoCode: string;
  validity?: string;
}

interface Transaction {
  _id: string;
  bundle?: Bundle | string;
  bundleName?: string;
  recipient?: string;
  status?: "success" | "pending" | "failed";
  date?: string;
  time?: string;
}

interface UserProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
}

// Network configurations with colors and logos
const networkConfig: Record<string, { 
  color: string;
  bgColor: string;
  lightBg: string;
  logo: React.ReactElement;
}> = {
  MTN: {
    color: "#FFD700",
    bgColor: "bg-yellow-400",
    lightBg: "bg-yellow-50",
    logo: <img src="/logos/mtn.png" alt="MTN" className="w-6 h-6" />
  },
  VODAFONE: {
    color: "#E60000",
    bgColor: "bg-red-500",
    lightBg: "bg-red-50",
    logo: <img src="/logos/vodafone.png" alt="Vodafone" className="w-6 h-6" />
  },
  AIRTELTIGO: {
    color: "#0066CC",
    bgColor: "bg-blue-600",
    lightBg: "bg-blue-50",
    logo: <img src="/logos/at.png" alt="AirtelTigo" className="w-6 h-6" />
  },
  TELECEL: {
    color: "#E60000",
    bgColor: "bg-red-500",
    lightBg: "bg-red-50",
    logo: <img src="/logos/tel.png" alt="Telecel" className="w-6 h-6" />
  },
  OTHER: {
    color: "#4B5563",
    bgColor: "bg-gray-500",
    lightBg: "bg-gray-50",
    logo: <Package className="w-6 h-6 text-gray-600" />
  }
};

export default function UserDashboard() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("MTN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat UI state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [messageInput, setMessageInput] = useState("");

  // 🛰️ Fetch Dashboard Data
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
          fetch(`${apiBase}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiBase}/api/bundles?page=1`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiBase}/api/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (userRes.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        if (!userRes.ok || !bundlesRes.ok || !ordersRes.ok) {
          throw new Error("Failed to load some dashboard data");
        }

        const userJson = await userRes.json();
        const bundlesJson = await bundlesRes.json();
        const ordersJson = await ordersRes.json();

        setUserData(userJson.data || userJson);
        setBundles(bundlesJson.data?.data || []);
        setTransactions(ordersJson.data?.orders || []);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 🧠 Group Bundles by Network
  const bundlesByNetwork = useMemo(() => {
    return bundles.reduce((acc: Record<string, Bundle[]>, bundle) => {
      const key = bundle.telcoCode?.toUpperCase() || "OTHER";
      if (!acc[key]) acc[key] = [];
      acc[key].push(bundle);
      return acc;
    }, {});
  }, [bundles]);


  // 🟢 Status Badge
  const getStatusBadge = (status: "success" | "pending" | "failed") => {
    const styles: Record<"success" | "pending" | "failed", string> = {
      success: "bg-green-50 text-green-700 border-green-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      failed: "bg-red-50 text-red-700 border-red-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  // 🔄 Loading / Error States
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        Error: {error}
      </div>
    );

  if (!userData) return null;

  const userName =
    userData.name ||
    `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
    "User";

  // 🧩 UI Rendering
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
                  {transactions.length}
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>
                Last Purchase:{" "}
                <span className="font-semibold text-gray-900">
                  {transactions[0]?.date || "N/A"}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Bundles Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Available Bundles</h2>
            <div className="flex flex-wrap gap-2">
              {Object.keys(bundlesByNetwork).map((network) => {
                const config = networkConfig[network] || networkConfig.OTHER;
                return (
                  <button
                    key={network}
                    onClick={() => setSelectedNetwork(network)}
                    className={`px-3 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm transition-all border-2 flex items-center space-x-1 md:space-x-2 ${
                      selectedNetwork === network
                        ? "text-white border-transparent"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                    style={selectedNetwork === network ? { backgroundColor: config.color } : {}}
                  >
                    <span className="w-4 h-4 md:w-6 md:h-6 flex items-center justify-center">{config.logo}</span>
                    <span className="hidden sm:inline">{network}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {bundlesByNetwork[selectedNetwork]?.map((bundle) => {
              const config = networkConfig[bundle.telcoCode?.toUpperCase() || "OTHER"] || networkConfig.OTHER;
              return (
                <div
                  key={bundle._id}
                  className="relative border-2 border-gray-200 rounded-xl p-3 bg-white hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between"
                  style={{ borderTop: `4px solid ${config.color}` }}
                >
                  {/* Network Icon */}
                  <div className="flex items-center justify-between mb-2">
                    <div className={`${config.lightBg} p-1.5 rounded-md flex items-center justify-center`}>
                      {config.logo}
                    </div>
                    <span className="text-xs text-gray-500">
                      {bundle.validity || "—"}
                    </span>
                  </div>

                  {/* Bundle Details */}
                  <div className="text-center mb-2">
                    <p className="text-sm md:text-lg font-bold text-gray-900 line-clamp-2">
                      {bundle.name}
                    </p>
                    <p className="text-xs font-medium text-gray-600">{bundle.telcoCode}</p>
                  </div>

                  {/* Price and Action */}
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs md:text-sm font-semibold text-gray-900">
                      ₵{bundle.price?.toFixed(2) || "0.00"}
                    </span>
                    <button 
                      className="hover:opacity-90 text-white px-2 md:px-3 py-1 rounded-md text-xs font-medium transition-all"
                      style={{ backgroundColor: config.color }}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transactions Table */}
<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  <div className="p-4 md:p-6 border-b border-gray-200">
    <h2 className="text-lg md:text-xl font-bold text-gray-900">
      Purchase History
    </h2>
  </div>

  {/* Table for md+ */}
  <div className="hidden md:block overflow-x-auto">
    <table className="w-full min-w-[640px]">
      <thead className="bg-gray-50">
        <tr>
          <th className="py-3 md:py-4 px-4 md:px-6 text-left text-xs font-semibold text-gray-600 uppercase">Bundle</th>
          <th className="py-3 md:py-4 px-4 md:px-6 text-left text-xs font-semibold text-gray-600 uppercase">Recipient</th>
          <th className="py-3 md:py-4 px-4 md:px-6 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
          <th className="py-3 md:py-4 px-4 md:px-6 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {transactions.map((txn) => (
          <tr key={txn._id} className="hover:bg-gray-50">
            <td className="py-3 md:py-4 px-4 md:px-6 font-medium text-gray-900 text-sm">
              {typeof txn.bundle === "object"
                ? txn.bundle?.name
                : txn.bundleName || txn.bundle || "—"}
            </td>
            <td className="py-3 md:py-4 px-4 md:px-6 text-gray-600 font-mono text-xs md:text-sm">
              {txn.recipient || "—"}
            </td>
            <td className="py-3 md:py-4 px-4 md:px-6">
              {getStatusBadge(txn.status || "pending")}
            </td>
            <td className="py-3 md:py-4 px-4 md:px-6 text-gray-900 font-medium text-sm">
              {txn.date || "—"}
              {txn.time && (
                <div className="text-gray-500 text-xs md:text-sm">{txn.time}</div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Stacked card view for mobile */}
  <div className="md:hidden space-y-3 p-2">
    {transactions.map((txn) => (
      <div
        key={txn._id}
        className="bg-gray-50 rounded-lg p-3 shadow-sm flex flex-col space-y-1"
      >
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900 text-sm">
            {typeof txn.bundle === "object"
              ? txn.bundle?.name
              : txn.bundleName || txn.bundle || "—"}
          </span>
          {getStatusBadge(txn.status || "pending")}
        </div>
        <div className="text-gray-600 text-xs font-mono">Recipient: {txn.recipient || "—"}</div>
        <div className="text-gray-500 text-xs">
          Date: {txn.date || "—"} {txn.time && `| Time: ${txn.time}`}
        </div>
      </div>
    ))}
  </div>
</div>

       {/* Floating WhatsApp Support Button */}
        <a
          href="https://wa.me/233557424675"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center z-50"
        >
          <FaWhatsapp className="w-6 h-6" />
        </a>

        {/* Chat Modal */}
        {chatOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-xl w-full max-w-sm p-4 shadow-lg relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => setChatOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <div className="h-64 overflow-y-auto space-y-3 mb-3">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg text-sm max-w-[80%] ${
                      msg.type === "user"
                        ? "bg-blue-600 text-white ml-auto"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}