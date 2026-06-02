"use client";

import React from "react";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Order {
  _id: string;
  orderNumber: string;
  user?: string;
  bundle?: {
    _id?: string;
    name?: string;
    dataAmount?: number | string;
    price?: number;
    telcoCode?: string;
  };
  recipientPhone?: string;
  status?: string;
  paymentStatus?: string;
  telco?: string;
  paymentMethod?: string;
  deliveryStatus?: string;
  totalAmount?: number;
  currency?: string;
  createdAt: string;
  updatedAt?: string;
  paymentReference?: string;
  deliveredAt?: string;
  deliveryMessage?: string;
  deliveryReference?: string;
  transactionId?: string;
  metadata?: { recipientPhone?: string };
  recipient?: string;
  orderStatus?: string;
  orderNo?: string;
  __v?: number;
}

interface OrdersTableProps {
  orders: Order[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalOrders: number;
  setPage: (page: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const resolvePhone = (order: Order) =>
  order.metadata?.recipientPhone || order.recipientPhone || order.recipient || "—";

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  // order
  success:    { cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", label: "Success"    },
  completed:  { cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", label: "Completed"  },
  processing: { cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",          label: "Processing" },
  pending:    { cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",        label: "Pending"    },
  failed:     { cls: "bg-red-50 text-red-600 ring-1 ring-red-200",             label: "Failed"     },
  cancelled:  { cls: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",         label: "Cancelled"  },
  // payment
  paid:       { cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", label: "Paid"       },
  refunded:   { cls: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",    label: "Refunded"   },
  // delivery
  delivered:  { cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", label: "Delivered"  },
};

// payment "success" → "Paid"
const PAYMENT_LABEL_OVERRIDE: Record<string, string> = { success: "Paid" };

function StatusBadge({ status, type }: { status?: string; type: "order" | "payment" | "delivery" }) {
  const key = (status || "pending").toLowerCase();
  const found = STATUS_MAP[key];
  const rawLabel = found?.label ?? (key.charAt(0).toUpperCase() + key.slice(1));
  const label = type === "payment" ? (PAYMENT_LABEL_OVERRIDE[key] ?? rawLabel) : rawLabel;
  const cls = found?.cls ?? "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  totalOrders,
  startIndex,
  endIndex,
  setPage,
}: {
  page: number;
  totalPages: number;
  totalOrders: number;
  startIndex: number;
  endIndex: number;
  setPage: (p: number) => void;
}) {
  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || (n >= page - 1 && n <= page + 1)
  );

  return (
    <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-gray-500 order-2 sm:order-1">
        Showing{" "}
        <span className="font-semibold text-gray-700">{startIndex}</span>
        {" – "}
        <span className="font-semibold text-gray-700">{endIndex}</span>
        {" of "}
        <span className="font-semibold text-gray-700">{totalOrders}</span>
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </button>

        <div className="flex items-center gap-1">
          {pageNums.map((n, idx) => {
            const prev = pageNums[idx - 1];
            const showEllipsis = prev && n - prev > 1;
            return (
              <React.Fragment key={n}>
                {showEllipsis && (
                  <span className="px-1.5 text-xs text-gray-400">…</span>
                )}
                <button
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors
                    ${page === n
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {n}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrdersTable({
  orders,
  page,
  pageSize,
  totalPages,
  totalOrders,
  setPage,
}: OrdersTableProps) {
  const startIndex = totalOrders === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex   = Math.min(page * pageSize, totalOrders);

  // ── Empty state ────────────────────────────────────────────────────────────
  if (totalOrders === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-7 h-7 text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-700">No orders found</p>
        <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  // ── Mobile card list ───────────────────────────────────────────────────────
  const MobileCards = () => (
    <div className="block lg:hidden divide-y divide-gray-100">
      {orders.map((order) => (
        <div key={order._id} className="p-4 hover:bg-gray-50/60 transition-colors">
          {/* Order # + date */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Order</p>
              <p className="text-sm font-bold text-gray-900">{order.orderNumber || order.orderNo}</p>
            </div>
            <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
          </div>

          {/* Bundle */}
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-800">{order.bundle?.name || "—"}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {[order.bundle?.dataAmount, order.bundle?.telcoCode || order.telco]
                .filter(Boolean).join(" · ")}
            </p>
          </div>

          {/* Recipient + amount */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Recipient</p>
              <p className="text-xs font-semibold text-gray-800 break-all">{resolvePhone(order)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Amount</p>
              <p className="text-xs font-bold text-gray-900">
                {order.currency} {order.totalAmount != null ? order.totalAmount.toFixed(2) : "—"}
              </p>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            {[
              { label: "Order",    status: order.status || order.orderStatus, type: "order"    as const },
              { label: "Payment",  status: order.paymentStatus,               type: "payment"  as const },
              { label: "Delivery", status: order.deliveryStatus,              type: "delivery" as const },
            ].map(({ label, status, type }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <p className="text-[10px] text-gray-400">{label}</p>
                <StatusBadge status={status} type={type} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // ── Desktop table ──────────────────────────────────────────────────────────
  const DesktopTable = () => (
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {["Order #", "Bundle", "Recipient", "Amount", "Order", "Payment", "Delivery", "Date"].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-50/60 transition-colors group">
              <td className="px-5 py-3.5 text-sm font-semibold text-gray-800 whitespace-nowrap">
                {order.orderNumber || order.orderNo}
              </td>

              <td className="px-5 py-3.5">
                <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                  {order.bundle?.name || "—"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {[order.bundle?.dataAmount, order.bundle?.telcoCode || order.telco]
                    .filter(Boolean).join(" · ")}
                </p>
              </td>

              <td className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                {resolvePhone(order)}
              </td>

              <td className="px-5 py-3.5 text-sm font-semibold text-gray-800 whitespace-nowrap tabular-nums">
                {order.currency} {order.totalAmount != null ? order.totalAmount.toFixed(2) : "—"}
              </td>

              <td className="px-5 py-3.5">
                <StatusBadge status={order.status || order.orderStatus} type="order" />
              </td>

              <td className="px-5 py-3.5">
                <StatusBadge status={order.paymentStatus} type="payment" />
              </td>

              <td className="px-5 py-3.5">
                <StatusBadge status={order.deliveryStatus} type="delivery" />
              </td>

              <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                {formatDate(order.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="overflow-hidden">
      <MobileCards />
      <DesktopTable />
      <Pagination
        page={page}
        totalPages={totalPages}
        totalOrders={totalOrders}
        startIndex={startIndex}
        endIndex={endIndex}
        setPage={setPage}
      />
    </div>
  );
}