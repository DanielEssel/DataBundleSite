"use client";

import React from "react";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

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
  status?: string; // Main order status: "pending", "processing", "failed", "success", "cancelled"
  paymentStatus?: string; // Payment status: "pending", "paid", "failed", "refunded"
  telco?: string;
  paymentMethod?: string;
  deliveryStatus?: string; // Delivery status: "pending", "delivered", "failed"
  totalAmount?: number;
  currency?: string;
  createdAt: string;
  updatedAt?: string;
  paymentReference?: string;
  deliveredAt?: string;
  deliveryMessage?: string;
  deliveryReference?: string;
  transactionId?: string;
  metadata?: {
    recipientPhone?: string;
  };
  recipient?: string;
  orderStatus?: string; // Backwards compatibility
  orderNo?: string; // Backwards compatibility
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

/** Status badge with correct color mapping for each status type */
function StatusBadge({ status, type }: { status?: string; type: 'order' | 'payment' | 'delivery' }) {
  const s = (status || "pending").toLowerCase();

  // Different mappings for different status types
  if (type === 'order') {
    // Order status: "pending", "processing", "failed", "success", "cancelled"
    const map: Record<string, string> = {
      success: "bg-green-100 text-green-700",
      completed: "bg-green-100 text-green-700",
      processing: "bg-blue-100 text-blue-700",
      pending: "bg-yellow-100 text-yellow-700",
      failed: "bg-red-100 text-red-700",
      cancelled: "bg-red-100 text-red-700",
    };

    const label =
      s === "success" ? "Success" :
      s === "completed" ? "Completed" :
      s === "processing" ? "Processing" :
      s === "pending" ? "Pending" :
      s === "failed" ? "Failed" :
      s === "cancelled" ? "Cancelled" :
      s.charAt(0).toUpperCase() + s.slice(1);

    const cls = map[s] || map.pending;

    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${cls}`}>
        {label}
      </span>
    );
  }

  if (type === 'payment') {
    // Payment status: "pending", "paid", "failed", "refunded"
    const map: Record<string, string> = {
      paid: "bg-green-100 text-green-700",
      success: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      failed: "bg-red-100 text-red-700",
      refunded: "bg-orange-100 text-orange-700",
    };

    const label =
      s === "paid" ? "Paid" :
      s === "success" ? "Paid" :
      s === "pending" ? "Pending" :
      s === "failed" ? "Failed" :
      s === "refunded" ? "Refunded" :
      s.charAt(0).toUpperCase() + s.slice(1);

    const cls = map[s] || map.pending;

    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${cls}`}>
        {label}
      </span>
    );
  }

  // Delivery status: "pending", "delivered", "failed"
  const map: Record<string, string> = {
    delivered: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };

  
  const label =
    s === "delivered" ? "Delivered" :
    s === "pending" ? "Pending" :
    s === "failed" ? "Failed" :
    s.charAt(0).toUpperCase() + s.slice(1);

  const cls = map[s] || map.pending;

  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${cls}`}>
      {label}
    </span>
  );
}

export default function OrdersTable({
  orders,
  page,
  pageSize,
  totalPages,
  totalOrders,
  setPage,
}: OrdersTableProps) {
  const startIndex = totalOrders === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalOrders);

  if (totalOrders === 0) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border p-8 sm:p-12 text-center">
        <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">No orders found</h3>
        <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-blue-200">
      {/* Mobile Card View */}
      <div className="block lg:hidden p-4 space-y-4">
        {orders.map((order) => {
          const recipientPhone =
            order?.metadata?.recipientPhone ||
            order?.recipientPhone ||
            order?.recipient ||
            "N/A";

          return (
            <div 
              key={order._id} 
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Header with Order Number and Date */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Order #</p>
                    <p className="font-bold text-gray-900 text-sm">{order.orderNumber || order.orderNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Date</p>
                    <p className="text-xs text-gray-700 font-medium">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Bundle Info - Prominent */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Bundle Details
                  </p>
                  <p className="font-bold text-gray-900 text-base mb-1">
                    {order.bundle?.name || "N/A"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="bg-white px-2 py-1 rounded border border-gray-200">
                      {order.bundle?.dataAmount || "N/A"}
                    </span>
                    <span className="bg-white px-2 py-1 rounded border border-gray-200">
                      {order.bundle?.telcoCode || order.telco || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Recipient and Amount - Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                      Recipient
                    </p>
                    <p className="text-sm font-bold text-gray-900 break-all">
                      {recipientPhone}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                      Amount
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {order.currency} {order.totalAmount != null ? order.totalAmount.toFixed(2) : "—"}
                    </p>
                  </div>
                </div>

                {/* Status Badges - Grid Layout */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Status
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1.5">Order</p>
                      <StatusBadge status={order.status || order.orderStatus} type="order" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1.5">Payment</p>
                      <StatusBadge status={order.paymentStatus} type="payment" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1.5">Delivery</p>
                      <StatusBadge status={order.deliveryStatus} type="delivery" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="max-h-[530px] overflow-y-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {[  
                  "Order #",
                  "Bundle",
                  "Recipient",
                  "Amount",
                  "Order",
                  "Payment",
                  "Delivery",
                  "Date",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const recipientPhone =
                  order?.metadata?.recipientPhone ||
                  order?.recipientPhone ||
                  order?.recipient ||
                  "N/A";

                return (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber || order.orderNo}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-gray-900">
                          {order.bundle?.name || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.bundle?.dataAmount || "N/A"} • {order.bundle?.telcoCode || order.telco || "N/A"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900">{recipientPhone}</td>

                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {order.currency ?? ""} {order.totalAmount != null ? order.totalAmount.toFixed(2) : ""}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={order.status || order.orderStatus} type="order" />
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={order.paymentStatus} type="payment" />
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={order.deliveryStatus} type="delivery" />
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                     {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50">
        {/* Mobile Pagination */}
        <div className="flex flex-col sm:hidden gap-3">
          <p className="text-xs text-gray-600 text-center">
            Showing <span className="font-semibold">{startIndex}</span> -{" "}
            <span className="font-semibold">{endIndex}</span> of{" "}
            <span className="font-semibold">{totalOrders}</span>
          </p>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>

            <span className="px-3 py-2 text-sm font-medium text-gray-700">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop Pagination */}
        <div className="hidden sm:flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{startIndex}</span> -{" "}
            <span className="font-semibold">{endIndex}</span> of{" "}
            <span className="font-semibold">{totalOrders}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        page === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-white border hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === page - 2 || pageNum === page + 2) {
                  return (
                    <span key={pageNum} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}