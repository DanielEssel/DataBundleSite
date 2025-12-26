"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../mainPage";
import AdminHeader from "../components/AdminHeader";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const PAGE_SIZE = 20;

type UserRef = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

type BundleRef = {
  _id?: string;
  name?: string;
  description?: string;
  dataAmount?: number;
  dataUnit?: string;
  price?: number;
};

type Order = {
  _id: string;
  user?: UserRef;
  bundle?: BundleRef | null;
  recipientPhone?: string;
  status?: string;
  paymentStatus?: string;
  telco?: string;
  paymentMethod?: string;
  deliveryStatus?: string;
  totalAmount?: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
  orderNumber?: string;
  paymentReference?: string;
  deliveredAt?: string;
  deliveryMessage?: string;
  deliveryReference?: string;
};

const statusStyles: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Client-side filter (API returns page results)
  const filtered = orders.filter((o) => {
    const id = o.orderNumber || o._id;
    const customer = `${o.user?.firstName ?? ""} ${o.user?.lastName ?? ""}`.trim();
    const phone = o.user?.phone || o.recipientPhone || "";

    const matchesSearch =
      !search ||
      id.toLowerCase().includes(search.toLowerCase()) ||
      customer.toLowerCase().includes(search.toLowerCase()) ||
      phone.includes(search);

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginated = filtered; // server provides paginated data

  const stats = {
    total: totalOrders,
    completed: orders.filter((o) => o.status === "success" || o.status === "delivered").length,
    pending: orders.filter((o) => o.status === "pending" || o.status === "processing").length,
    failed: orders.filter((o) => o.status === "failed").length,
  };

  const toggleSelectAll = () => {
    if (selected.length === paginated.length) {
      setSelected([]);
    } else {
      setSelected(paginated.map((o) => o._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
      case "delivered":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
      case "processing":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Fetch orders from API
  const fetchOrders = async (page = 1, limit = PAGE_SIZE) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const url = new URL(`${API_URL}/api/auth/orders`);
      url.searchParams.append("page", String(page));
      url.searchParams.append("limit", String(limit));

      const res = await fetch(url.toString(), {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Failed to fetch orders");
      }

      const payload = await res.json();
      const data: Order[] = payload?.data || [];
      const pagination = payload?.pagination || {};

      setOrders(data);
      setTotalOrders(pagination?.total ?? data.length);
      setTotalPages(pagination?.pages ?? 1);
      setCurrentPage(pagination?.page ?? page);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // CSV export for current page
  const exportCsvOrders = () => {
    if (!orders || orders.length === 0) return;
    const headers = ["Order #", "Customer", "Phone", "Bundle", "Amount", "Status", "Payment Status", "Date"];
    const rows = orders.map(o => [
      o.orderNumber ?? o._id,
      `${o.user?.firstName ?? ""} ${o.user?.lastName ?? ""}`.trim(),
      o.user?.phone ?? o.recipientPhone ?? "",
      o.bundle?.name ?? "",
      o.currency ? `${o.currency} ${o.totalAmount ?? ""}` : `${o.totalAmount ?? ""}`,
      o.status ?? "",
      o.paymentStatus ?? "",
      o.createdAt ? new Date(o.createdAt).toLocaleString() : "",
    ]);

    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const filename = `orders-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}.csv`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Orders Management">
      <AdminHeader
        title="Orders Management"
        subtitle="Monitor, manage, and resolve customer orders"
        actionButton={
          <button onClick={exportCsvOrders} disabled={orders.length === 0} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
            Export
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[ 
          { label: "Total Orders", value: stats.total, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completed", value: stats.completed, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending", value: stats.pending, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Failed", value: stats.failed, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                <ShoppingBag className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order ID, customer, phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>

          <div className="flex items-end gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
            <button
              onClick={() => setOrders([...orders])}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selected.length === paginated.length && paginated.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Bundle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginated.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(o._id)}
                      onChange={() => toggleSelect(o._id)}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{o.orderNumber ?? o._id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <p>{`${o.user?.firstName ?? ''} ${o.user?.lastName ?? ''}`.trim()}</p>
                    <p className="text-xs text-gray-400">{o.user?.phone ?? o.recipientPhone ?? '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{o.bundle?.name ?? '-'}</td>
                  <td className="px-6 py-4 font-semibold">{o.currency ?? ''} {o.totalAmount ? Number(o.totalAmount).toFixed(2) : '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(o.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[o.status ?? '']}`}>
                        {o.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
