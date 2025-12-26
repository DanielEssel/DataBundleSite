"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Filter
} from "lucide-react";
import OrdersTable, { Order } from "@/components/OrdersTable";

const PAGE_SIZE = 10;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function UserOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  // Stats
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, failed: 0 });

  // Input fields
  const [searchInput, setSearchInput] = useState("");
  const [dateFromInput, setDateFromInput] = useState("");
  const [dateToInput, setDateToInput] = useState("");

  // Applied filters
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");

  // 🔧 NEW: Track if filters have been cleared
  const [filtersCleared, setFiltersCleared] = useState(false);

  const calculateStats = (ordersList: Order[]) => {
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

  const fetchOrders = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (page === 1 && (appliedSearch || appliedDateFrom || appliedDateTo)) setSearching(true);
      else if (page === 1) setLoading(true);

      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
      });
      
      // Only append filters if they have values
      if (appliedSearch) params.append("search", appliedSearch);
      if (appliedDateFrom) params.append("dateFrom", appliedDateFrom);
      if (appliedDateTo) params.append("dateTo", appliedDateTo);

      console.log("📡 Fetching orders with params:", params.toString());

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

      const data = payload?.data || payload; // Handle both response formats
      setOrders(data?.orders || data || []); // Handle nested or flat response
      setTotalOrders(data?.totalOrders || data?.total || 0);
      setTotalPages(data?.totalPages || Math.ceil((data?.total || 0) / PAGE_SIZE));
      setCurrentPage(data?.currentPage || page);
      
      calculateStats(data?.orders || data || []);
      
      setError("");
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSearching(false);
    }
  };

  // 🔧 FIXED: Fetch orders on mount and when filters change
  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch, appliedDateFrom, appliedDateTo, filtersCleared]);

  const handleSearch = () => {
    setAppliedSearch(searchInput);
    setAppliedDateFrom(dateFromInput);
    setAppliedDateTo(dateToInput);
    setFiltersCleared(false); // Reset cleared flag
  };

  const clearFilters = () => {
    setSearchInput("");
    setDateFromInput("");
    setDateToInput("");
    
    // 🔧 IMPORTANT: Clear applied filters
    setAppliedSearch("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
    
    // 🔧 TRIGGER RE-FETCH: Set cleared flag to trigger useEffect
    setFiltersCleared(true);
    
    // 🔧 Also reset to page 1
    setCurrentPage(1);
    
    console.log("🗑️ Filters cleared, fetching all orders...");
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchOrders(newPage);
  };

  const handleRefresh = () => {
    fetchOrders(currentPage, true);
  };

  const exportCsv = () => {
    if (!orders.length) return;
    const headers = [
      "Order Number",
      "Bundle",
      "Network",
      "Recipient Phone",
      "Amount",
      "Currency",
      "Status",
      "Payment Status",
      "Delivery Status",
      "Created At",
    ];

    const rows = orders.map((o) => [
      o.orderNumber ?? o.orderNo ?? "",
      o.bundle?.name ?? "",
      o.bundle?.telcoCode ?? o.telco ?? "",
      o.recipientPhone ?? "",
      o.totalAmount != null ? o.totalAmount.toString() : "",
      o.currency ?? "",
      o.status ?? "",
      o.paymentStatus ?? "",
      o.deliveryStatus ?? "",
      o.createdAt ? new Date(o.createdAt).toLocaleString() : "",
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasActiveFilters = appliedSearch || appliedDateFrom || appliedDateTo;

  // ... rest of your component remains the same until the return statement ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-4 -top-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute -right-4 -bottom-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-1 flex items-center gap-2">
                  My Orders
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Track and manage all your data purchases
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm text-sm font-medium shadow-lg disabled:opacity-50 hover:scale-105"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>

              <button
                onClick={exportCsv}
                disabled={!orders.length}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium shadow-lg disabled:opacity-50 hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 pb-8 sm:pb-12 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[
            { label: "Total Orders", value: totalOrders, icon: ShoppingBag, gradient: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "text-blue-600" },
            { label: "Paid", value: stats.paid, icon: CheckCircle2, gradient: "from-green-500 to-emerald-600", bg: "bg-green-50", text: "text-green-600" },
            { label: "Pending", value: stats.pending, icon: Clock, gradient: "from-yellow-500 to-orange-500", bg: "bg-yellow-50", text: "text-yellow-600" },
            { label: "Failed", value: stats.failed, icon: XCircle, gradient: "from-red-500 to-rose-600", bg: "bg-red-50", text: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl p-5 sm:p-6 border border-gray-100 transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${s.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <s.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${s.text}`} />
                </div>
                <TrendingUp className={`w-4 h-4 ${s.text} opacity-50`} />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1 font-medium">{s.label}</p>
              <p className={`text-2xl sm:text-3xl font-bold ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-md">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-semibold mb-1">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Filter className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Search & Filter</h2>
                <p className="text-xs text-gray-500">Find specific orders quickly</p>
              </div>
            </div>

            {hasActiveFilters && (
              <button 
                onClick={clearFilters} 
                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>Clear All</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by order number, phone number..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
              >
                {searching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={dateFromInput}
                  onChange={(e) => setDateFromInput(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={dateToInput}
                  onChange={(e) => setDateToInput(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs text-gray-500 font-medium">Active filters:</span>
                {appliedSearch && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Search: {appliedSearch}
                  </span>
                )}
                {appliedDateFrom && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    From: {new Date(appliedDateFrom).toLocaleDateString()}
                  </span>
                )}
                {appliedDateTo && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    To: {new Date(appliedDateTo).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4 px-2">
          <p className="text-sm text-gray-600">
            Showing <span className="font-bold text-gray-900">{orders.length}</span> of <span className="font-bold text-gray-900">{totalOrders}</span> order(s)
          </p>
          {hasActiveFilters ? (
            <p className="text-xs text-blue-600 font-medium">Filtered results</p>
          ) : (
            <p className="text-xs text-gray-500 font-medium">All orders</p>
          )}
        </div>

        {/* Orders Table */}
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