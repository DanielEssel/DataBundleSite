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
  Filter,
  X,
  AlertCircle,
} from "lucide-react";
import OrdersTable, { Order } from "@/components/OrdersTable";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const API_URL   = process.env.NEXT_PUBLIC_API_URL || "";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const lower = (s?: string) => (s || "").toLowerCase();

const calculateStats = (ordersList: Order[]) => {
  const paid = ordersList.filter((o) => {
    const p = lower(o.paymentStatus);
    return p === "success" || p === "paid";
  }).length;

  const pending = ordersList.filter((o) => lower(o.paymentStatus) === "pending").length;

  const failed = ordersList.filter((o) => {
    const p = lower(o.paymentStatus);
    return p === "failed" || p === "cancelled" || p === "expired";
  }).length;

  return { total: ordersList.length, paid, pending, failed };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  iconColor,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
  iconColor: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`w-10 h-10 ${accent} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-14 bg-gray-100 rounded-lg animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
        )}
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserOrders() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats]             = useState({ total: 0, paid: 0, pending: 0, failed: 0 });

  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError]         = useState("");

  // Input state (uncontrolled until Search is clicked)
  const [searchInput, setSearchInput]     = useState("");
  const [dateFromInput, setDateFromInput] = useState("");
  const [dateToInput, setDateToInput]     = useState("");

  // Applied (committed) filters
  const [appliedSearch, setAppliedSearch]       = useState("");
  const [appliedDateFrom, setAppliedDateFrom]   = useState("");
  const [appliedDateTo, setAppliedDateTo]       = useState("");
  const [filtersCleared, setFiltersCleared]     = useState(false);

  const hasActiveFilters = appliedSearch || appliedDateFrom || appliedDateTo;

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchOrders = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (page === 1 && hasActiveFilters) setSearching(true);
      else if (page === 1) setLoading(true);

      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      const params = new URLSearchParams({ page: page.toString(), limit: PAGE_SIZE.toString() });
      if (appliedSearch)   params.append("search",   appliedSearch);
      if (appliedDateFrom) params.append("dateFrom", appliedDateFrom);
      if (appliedDateTo)   params.append("dateTo",   appliedDateTo);

      const res     = await fetch(`${API_URL}/api/orders?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const payload = await res.json();

      if (!res.ok) {
        setError(payload?.message || "Failed to fetch orders");
        setOrders([]);
        setTotalOrders(0);
        return;
      }

      const data = payload?.data || payload;
      const list = data?.orders || data || [];

      setOrders(list);
      setTotalOrders(data?.totalOrders || data?.total || 0);
      setTotalPages(data?.totalPages || Math.ceil((data?.total || 0) / PAGE_SIZE));
      setCurrentPage(data?.currentPage || page);
      setStats(calculateStats(list));
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

  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch, appliedDateFrom, appliedDateTo, filtersCleared]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSearch = () => {
    setAppliedSearch(searchInput);
    setAppliedDateFrom(dateFromInput);
    setAppliedDateTo(dateToInput);
    setFiltersCleared(false);
  };

  const clearFilters = () => {
    setSearchInput("");
    setDateFromInput("");
    setDateToInput("");
    setAppliedSearch("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
    setFiltersCleared(true);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchOrders(newPage);
  };

  const exportCsv = () => {
    if (!orders.length) return;

    const headers = [
      "Order Number", "Bundle", "Network", "Recipient Phone",
      "Amount", "Currency", "Status", "Payment Status", "Delivery Status", "Created At",
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

    const csv  = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-6">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-400 mt-0.5">Track and manage all your data purchases</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(currentPage, true)}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-xl px-4 py-2 hover:shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>

            <button
              onClick={exportCsv}
              disabled={!orders.length}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-4 py-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={totalOrders}    icon={ShoppingBag}  accent="bg-blue-50"    iconColor="text-blue-600"   loading={loading} />
          <StatCard label="Paid"         value={stats.paid}     icon={CheckCircle2} accent="bg-emerald-50" iconColor="text-emerald-600" loading={loading} />
          <StatCard label="Pending"      value={stats.pending}  icon={Clock}        accent="bg-amber-50"   iconColor="text-amber-600"  loading={loading} />
          <StatCard label="Failed"       value={stats.failed}   icon={XCircle}      accent="bg-red-50"     iconColor="text-red-500"    loading={loading} />
        </div>

        {/* ── Error banner ─────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Something went wrong</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ── Search & filters ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <Filter className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-800">Search & Filter</h2>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Search row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by order number or phone…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl outline-none transition-all placeholder:text-gray-300 hover:border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 shrink-0"
              >
                {searching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{searching ? "Searching…" : "Search"}</span>
              </button>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  From date
                </label>
                <input
                  type="date"
                  value={dateFromInput}
                  onChange={(e) => setDateFromInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-100 rounded-xl outline-none transition-all hover:border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  To date
                </label>
                <input
                  type="date"
                  value={dateToInput}
                  onChange={(e) => setDateToInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-100 rounded-xl outline-none transition-all hover:border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-gray-400 font-medium">Active:</span>
                {appliedSearch && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
                    <Search className="w-3 h-3" />
                    {appliedSearch}
                    <button onClick={() => { setSearchInput(""); setAppliedSearch(""); }} className="ml-0.5 hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {appliedDateFrom && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-full text-xs font-medium">
                    From {new Date(appliedDateFrom).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}
                    <button onClick={() => { setDateFromInput(""); setAppliedDateFrom(""); }} className="ml-0.5 hover:text-violet-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {appliedDateTo && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-full text-xs font-medium">
                    To {new Date(appliedDateTo).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}
                    <button onClick={() => { setDateToInput(""); setAppliedDateTo(""); }} className="ml-0.5 hover:text-violet-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Results meta ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-900">{orders.length}</span>
            {" "}of{" "}
            <span className="font-semibold text-gray-900">{totalOrders}</span>
            {" "}order{totalOrders !== 1 ? "s" : ""}
          </p>
          {hasActiveFilters && (
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Filtered
            </span>
          )}
        </div>

        {/* ── Orders table ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
    </div>
  );
}