"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Package,
  Clock,
  Wifi,
  Headphones,
  X,
  Send,
} from "lucide-react";

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
    const token = localStorage.getItem("token");
    if (!token) return;

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

  // 💬 Chat Handler
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { type: "user", text: messageInput },
      {
        type: "bot",
        text: "Thank you for your message. Our support team will assist you shortly.",
      },
    ]);
    setMessageInput("");
  };

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
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}!
          </h1>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8">
          <div className="flex space-x-2 mb-4">
            {Object.keys(bundlesByNetwork).map((network) => (
              <button
                key={network}
                onClick={() => setSelectedNetwork(network)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                  selectedNetwork === network
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {network}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {bundlesByNetwork[selectedNetwork]?.map((bundle) => (
              <div
                key={bundle._id}
                className="border border-gray-200 rounded-xl p-3 bg-white hover:bg-blue-50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-blue-100 p-1.5 rounded-md">
                    <Wifi className="w-4 h-4 text-blue-700" />
                  </div>
                  <span className="text-xs text-gray-500">
                    {bundle.validity || "—"}
                  </span>
                </div>
                <div className="text-center mb-2">
                  <p className="text-lg font-bold text-gray-900">
                    {bundle.name}
                  </p>
                  <p className="text-xs text-gray-500">{bundle.telcoCode}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    ₵{bundle.price?.toFixed(2) || "0.00"}
                  </span>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs">
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Purchase History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                    Bundle
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                    Recipient
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {/* ✅ FIX: safely render bundle name */}
                      {typeof txn.bundle === "object"
                        ? txn.bundle?.name
                        : txn.bundleName || txn.bundle || "—"}
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-mono text-sm">
                      {txn.recipient || "—"}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(txn.status || "pending")}
                    </td>
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {txn.date || "—"}
                      {txn.time && (
                        <div className="text-gray-500 text-sm">{txn.time}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Floating Chat */}
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
        >
          <Headphones className="w-6 h-6" />
        </button>

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
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
