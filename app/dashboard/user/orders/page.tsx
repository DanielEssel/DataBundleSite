"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import OrdersTable, { Order } from "@/components/OrdersTable";

const PAGE_SIZE = 10; // Match your backend page size
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function UserOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Stats
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, failed: 0 });

  // Filters
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  // Fetch orders with pagination and filters
  const fetchOrders = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
      });
      
      if (search) params.append("search", search);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const res = await fetch(`${API_URL}/api/orders?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const payload = await res.json();

      if (!res.ok) {
        setError(payload?.message || "Failed to fetch orders");
        setOrders([]);
        setTotalOrders(0);
        return;
      }

      const data = payload?.data;
      setOrders(data?.orders || []);
      setTotalOrders(data?.totalOrders || 0);
      setTotalPages(data?.totalPages || 1);
      setCurrentPage(data?.currentPage || 1);
      
      // Update stats (you may want a separate endpoint for this)
      calculateStats(data?.orders || []);
      
      setError("");
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (ordersList: Order[]) => {
    // Note: Stats should ideally come from backend to show ALL orders
    const lower = (s?: string) => (s || "").toLowerCase();
    
    const paid = ordersList.filter((o) => {
      const p = lower(o.paymentStatus);
      return p === "success" || p === "paid";
    }).length;

    const pending = ordersList.filter((o) => lower(o.paymentStatus) === "pending").length;
    
    const failed = ordersList.filter((o) => {
      const p = lower(o.paymentStatus);
      return p === "failed" || p === "cancelled" || p === "expired";
    }).length;

    setStats({ total: ordersList.length, paid, pending, failed });
  };

  useEffect(() => {
    fetchOrders(1);
  }, [search, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearch("");
    setDateFrom(null);
    setDateTo(null);
  };

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage);
  };

  // CSV export - you may want to fetch all orders for this
  const exportCsv = () => {
    if (!orders.length) return;
    const headers = [
      "orderNo",
      "bundle",
      "telcoCode",
      "recipient",
      "amount",
      "currency",
      "status",
      "paymentStatus",
      "deliveryStatus",
      "createdAt",
    ];

    const rows = orders.map((o) => [
      o.orderNumber ?? o.orderNo ?? "",
      o.bundle?.name ?? "",
      o.bundle?.telcoCode ?? "",
      o.recipientPhone ?? "",
      o.totalAmount != null ? o.totalAmount.toString() : "",
      o.currency ?? "",
      o.status ?? "",
      o.paymentStatus ?? "",
      o.deliveryStatus ?? "",
      o.createdAt ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4" />
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-2 sm:gap-3">
                <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
                My Orders
              </h1>
              <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                Track and manage all your data purchases
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => fetchOrders(currentPage, true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm text-sm sm:text-base"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="font-medium">Refresh</span>
              </button>

              <button
                onClick={exportCsv}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 pb-8 sm:pb-12">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {[
            { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "blue" },
            { label: "Paid", value: stats.paid, icon: CheckCircle2, color: "green" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "yellow" },
            { label: "Failed", value: stats.failed, icon: XCircle, color: "red" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${s.color}-50 rounded-lg sm:rounded-xl flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${s.color}-600`} />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">{s.label}</p>
              <p className={`text-xl sm:text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm sm:text-base text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Search & Date</span>
              <span className="sm:hidden">Filters</span>
            </h2>

            {(search || dateFrom || dateTo) && (
              <button onClick={clearFilters} className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium">
                Clear
              </button>
            )}
          </div>

          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-4">
            <div className="relative md:col-span-3 lg:col-span-1">
              <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm text-gray-600 w-12 sm:w-20 flex-shrink-0">From</label>
              <input
                type="date"
                value={dateFrom ?? ""}
                onChange={(e) => setDateFrom(e.target.value || null)}
                className="flex-1 px-2 sm:px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm text-gray-600 w-12 sm:w-20 flex-shrink-0">To</label>
              <input
                type="date"
                value={dateTo ?? ""}
                onChange={(e) => setDateTo(e.target.value || null)}
                className="flex-1 px-2 sm:px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* Showing count */}
        <div className="mb-3 sm:mb-4 flex items-center justify-between px-1">
          <p className="text-sm sm:text-base text-gray-600">
            Showing <span className="font-semibold">{totalOrders}</span> total order(s)
          </p>
        </div>

        {/* Orders table */}
        <OrdersTable
          orders={orders}
          page={currentPage}
          pageSize={PAGE_SIZE}
          totalPages={totalPages}
          totalOrders={totalOrders}
          setPage={handlePageChange}
        />
      </div>
    </div>
  );
}