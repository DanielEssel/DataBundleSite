"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../mainPage";
import AdminHeader from "../components/AdminHeader";
import {
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Smartphone,
  Receipt,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const PAGE_SIZE = 20;

type UserRef = {
  _id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type OrderRef = {
  _id: string;
  recipientPhone?: string;
  totalAmount?: number;
};

type Payment = {
  _id: string;
  reference: string;
  user?: UserRef;
  order?: OrderRef;
  amount: number;
  paymentMethod: "card" | "momo";
  currency?: string;
  status: "pending" | "success" | "failed";
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
  gatewayResponse?: any;
  failureResponse?: string;
};

const statusStyles: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

const methodStyles: Record<string, string> = {
  momo: "bg-blue-100 text-blue-800",
  card: "bg-purple-100 text-purple-800",
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="w-4 h-4" />;
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "failed":
      return <XCircle className="w-4 h-4" />;
    default:
      return null;
  }
};

const getMethodIcon = (method?: string) => {
  switch (method) {
    case "momo":
      return <Smartphone className="w-4 h-4" />;
    case "card":
      return <CreditCard className="w-4 h-4" />;
    default:
      return <Receipt className="w-4 h-4" />;
  }
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "success" | "failed">("all");
  const [methodFilter, setMethodFilter] = useState<"all" | "momo" | "card">("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch payments from API
  const fetchPayments = async (page = 1, limit = PAGE_SIZE) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");

      const url = new URL(`${API_URL}/payment`);
      url.searchParams.append("page", String(page));
      url.searchParams.append("limit", String(limit));

      const res = await fetch(url.toString(), {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Failed to fetch payments");
      }

      const payload = await res.json();

      const data: Payment[] = payload?.data || [];
      const pagination = payload?.pagination || {};

      setPayments(data);
      setTotalPayments(pagination?.total ?? data.length);
      setTotalPages(pagination?.pages ?? 1);
      setCurrentPage(pagination?.page ?? page);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error fetching payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // client-side filter (within current page results)
  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const ref = p.reference || "";
      const customer = `${p.user?.firstName ?? ""} ${p.user?.lastName ?? ""}`.trim();
      const phone = p.user?.phone || p.order?.recipientPhone || "";

      const matchesSearch =
        !search ||
        ref.toLowerCase().includes(search.toLowerCase()) ||
        customer.toLowerCase().includes(search.toLowerCase()) ||
        phone.includes(search);

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesMethod = methodFilter === "all" || p.paymentMethod === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  const stats = {
    total: totalPayments,
    success: payments.filter((p) => p.status === "success").length,
    pending: payments.filter((p) => p.status === "pending").length,
    failed: payments.filter((p) => p.status === "failed").length,
  };

  // Export current page
  const exportCsvPayments = () => {
    if (!payments || payments.length === 0) return;

    const headers = [
      "Reference",
      "Customer",
      "User Phone",
      "Recipient Phone",
      "Method",
      "Amount",
      "Currency",
      "Status",
      "Paid At",
      "Created At",
    ];

    const rows = payments.map((p) => [
      p.reference ?? "",
      `${p.user?.firstName ?? ""} ${p.user?.lastName ?? ""}`.trim(),
      p.user?.phone ?? "",
      p.order?.recipientPhone ?? "",
      p.paymentMethod ?? "",
      p.amount ?? "",
      p.currency ?? "GHS",
      p.status ?? "",
      p.paidAt ? new Date(p.paidAt).toLocaleString() : "",
      p.createdAt ? new Date(p.createdAt).toLocaleString() : "",
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const now = new Date();
    const filename = `payments-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}.csv`;

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Payments Management">
      <AdminHeader
        title="Payments Management"
        subtitle="Track payment transactions, status, and method"
        actionButton={
          <button
            onClick={exportCsvPayments}
            disabled={payments.length === 0}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Payments", value: stats.total, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Success", value: stats.success, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending", value: stats.pending, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Failed", value: stats.failed, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                <Receipt className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by reference, customer, phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Methods</option>
            <option value="momo">MoMo</option>
            <option value="card">Card</option>
          </select>

          <div className="flex items-end gap-2 md:col-span-4">
            <button
              onClick={() => fetchPayments(currentPage)}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading payments...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.reference}</td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      <p>{`${p.user?.firstName ?? ""} ${p.user?.lastName ?? ""}`.trim() || "-"}</p>
                      <p className="text-xs text-gray-400">{p.user?.phone ?? "-"}</p>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {p.order?.recipientPhone ?? "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                          methodStyles[p.paymentMethod] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {getMethodIcon(p.paymentMethod)}
                        {p.paymentMethod?.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {p.currency ?? "GHS"} {Number(p.amount ?? 0).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(p.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[p.status] ?? ""}`}>
                          {p.status}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))
              )}
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
