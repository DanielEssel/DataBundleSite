"use client";

import { useState, useEffect } from "react";
import AdminLayout from "./mainPage";
import AdminHeader from "./components/AdminHeader";
import AdminCard from "./components/AdminCard";
import CreateBundleModal from "./components/CreateBundleModal";
import { useRouter } from "next/navigation";
import { ShoppingBag, Users, Package, CreditCard, Clock } from "lucide-react";

import { getTokenExpiryMs, isTokenExpired, logout } from "@/lib/jwtAuth";
import { authFetch } from "@/lib/authFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

type Toast = { message: string; type: "success" | "error" } | null;

type RecentActivityItem = {
  user: string;
  text: string;
  deliveryStatus: string;
  timestamp?: string;
};

const normalize = (v: any) => String(v ?? "").toLowerCase().trim();

const deliveryBadgeClass = (deliveryStatus: string) => {
  const s = normalize(deliveryStatus);

  if (s === "delivered" || s === "success") return "bg-green-100 text-green-700";
  if (s === "failed") return "bg-red-100 text-red-700";
  if (s === "processing") return "bg-blue-100 text-blue-700";
  if (s === "cancelled") return "bg-gray-100 text-gray-700";
  if (s === "refunded" || s === "resolved") return "bg-orange-100 text-orange-700";

  // pending / unknown
  return "bg-yellow-100 text-yellow-700";
};

export default function AdminDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    adminUsers: 0,
    agentUsers: 0,
    totalBundles: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);

  const [showCreateBundle, setShowCreateBundle] = useState(false);
  const [newBundle, setNewBundle] = useState({
    name: "",
    description: "",
    price: 0,
    dataAmount: "",
    telcoCode: "MTN" as string,
  });

  const [toastMessage, setToastMessage] = useState<Toast>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ✅ Auth + role + auto logout at expiry
  useEffect(() => {
    let timer: number | undefined;

    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const user = localStorage.getItem("user");

      if (!token || !user) {
        router.replace("/login");
        return;
      }

      if (isTokenExpired(token)) {
        logout(router);
        return;
      }

      const expMs = getTokenExpiryMs(token);
      if (expMs) {
        const msLeft = expMs - Date.now();
        timer = window.setTimeout(() => logout(router), Math.max(msLeft, 0));
      }

      try {
        const userData = JSON.parse(user);
        if (userData?.role !== "admin") {
          router.replace("/dashboard/user");
          return;
        }
        setAuthorized(true);
      } catch {
        router.replace("/login");
      }
    };

    checkAuth();

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [router]);

  // ✅ Fetch dashboard stats only after authorized
  useEffect(() => {
    if (!authorized) return;
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  const fetchDashboardStats = async () => {
    setLoading(true);

    try {
      // ✅ Users
      const usersRes = await authFetch(router, `${API_URL}/api/auth/users?limit=50`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const pagination = usersData?.pagination || {};
        const allUsers = usersData?.data || [];

        const totalUsers = pagination.total || allUsers.length || 0;
        const verifiedCount = allUsers.filter((u: any) => u.isverified).length;
        const adminCount = allUsers.filter((u: any) => u.role === "admin").length;
        const agentCount = allUsers.filter((u: any) => u.role === "agent").length;

        setStats((prev) => ({
          ...prev,
          totalUsers,
          verifiedUsers: verifiedCount,
          adminUsers: adminCount,
          agentUsers: agentCount,
        }));
      }

      // ✅ Bundles
      const bundlesRes = await authFetch(router, `${API_URL}/api/bundles/admin?limit=1`);
      if (bundlesRes.ok) {
        const bundlesData = await bundlesRes.json();
        const totalBundles =
          bundlesData?.pagination?.totalCount || bundlesData?.pagination?.total || 0;

        setStats((prev) => ({ ...prev, totalBundles }));
      }

      // ✅ Orders (Admin endpoint)
      const ordersRes = await authFetch(router, `${API_URL}/api/auth/orders?limit=50`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const pagination = ordersData?.pagination || {};
        const allOrders = ordersData?.data || [];

        const totalOrders = pagination.total || allOrders.length || 0;

        // Pending orders: you can choose order.status OR deliveryStatus.
        // Here we count by order.status === "pending"
        const pendingCount = allOrders.filter((o: any) => o.status === "pending").length;

        setStats((prev) => ({
          ...prev,
          totalOrders,
          pendingOrders: pendingCount,
        }));

        // ✅ Recent Activity uses deliveryStatus (REAL)
        const activity: RecentActivityItem[] = allOrders.slice(0, 5).map((order: any) => ({
          user:
            `${order.user?.firstName ?? ""} ${order.user?.lastName ?? ""}`.trim() ||
            "Unknown",
          text: `${order.bundle?.name ?? "Order"} - ${order.orderNumber}`,
          deliveryStatus: order.deliveryStatus || "pending",
          timestamp: order.createdAt,
        }));

        setRecentActivity(activity);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      showToast("Error fetching dashboard stats", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch(router, `${API_URL}/api/bundles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBundle),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        showToast(payload?.message || "Failed to create bundle", "error");
        return;
      }

      setShowCreateBundle(false);
      setNewBundle({ name: "", description: "", price: 0, dataAmount: "", telcoCode: "MTN" });
      showToast("Bundle created successfully");
      fetchDashboardStats();
    } catch (err) {
      console.error(err);
      showToast("Error creating bundle", "error");
    }
  };

  const navigateTo = (path: string) => router.push(path);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminLayout>
        <AdminHeader title="Admin Dashboard" subtitle="Welcome back, Admin" />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AdminCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            icon={<Users className="w-5 h-5" />}
            color="blue"
            loading={loading}
          />
          <AdminCard
            title="Total Bundles"
            value={stats.totalBundles.toString()}
            icon={<Package className="w-5 h-5" />}
            color="purple"
            loading={loading}
          />
          <AdminCard
            title="Pending Orders"
            value={stats.pendingOrders.toString()}
            icon={<Clock className="w-5 h-5" />}
            color="orange"
            loading={loading}
          />
          <AdminCard
            title="Total Orders"
            value={stats.totalOrders.toString()}
            icon={<CreditCard className="w-5 h-5" />}
            color="green"
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigateTo("/dashboard/admin/orders")}
              className="p-4 border rounded-lg hover:bg-blue-50 transition text-left"
            >
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Process Orders</p>
                  <p className="text-sm text-gray-500">Manage pending orders</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowCreateBundle(true)}
              className="p-4 border rounded-lg hover:bg-green-50 transition text-left"
            >
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Add Bundle</p>
                  <p className="text-sm text-gray-500">Create new data bundle</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigateTo("/dashboard/admin/users")}
              className="p-4 border rounded-lg hover:bg-purple-50 transition text-left"
            >
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Manage Users</p>
                  <p className="text-sm text-gray-500">View and edit users</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity (DELIVERY STATUS ✅) */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest orders and transactions</p>
          </div>

          <div className="p-6 space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              recentActivity.map((item, idx) => {
                const s = normalize(item.deliveryStatus);
                return (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p>
                        <span className="font-medium">{item.user}</span> {item.text}
                      </p>
                      {item.timestamp && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${deliveryBadgeClass(
                        item.deliveryStatus
                      )}`}
                      title={`deliveryStatus: ${s}`}
                    >
                      {item.deliveryStatus}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </AdminLayout>

      {/* Create Bundle Modal */}
      <CreateBundleModal
        isOpen={showCreateBundle}
        onClose={() => setShowCreateBundle(false)}
        onSubmit={handleAddBundle}
        bundle={newBundle}
        onBundleChange={setNewBundle}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 ${
            toastMessage.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <p className="flex items-center gap-2">
            {toastMessage.type === "success" ? "✓" : "✕"} {toastMessage.message}
          </p>
        </div>
      )}
    </>
  );
}
