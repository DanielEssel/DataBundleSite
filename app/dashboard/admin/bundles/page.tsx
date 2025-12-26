"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../mainPage";
import AdminHeader from "../components/AdminHeader";
import CreateBundleModal from "../components/CreateBundleModal";
import EditBundleModal from "../components/EditBundleModal";
import ViewBundleModal from "../components/ViewBundleModal";
import { 
  Search, Filter, Plus, Edit, Trash2, Eye, Download, Clock, RefreshCw, XCircle
} from "lucide-react";

const PAGE_SIZE = 10;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

type Bundle = {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  telcoCode: string;
  dataAmount?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [totalBundles, setTotalBundles] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState("");
  const [telcoFilter, setTelcoFilter] = useState("all");
  const [selectedBundles, setSelectedBundles] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditBundle, setCurrentEditBundle] = useState<Bundle | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [currentViewBundle, setCurrentViewBundle] = useState<Bundle | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedTelcoFilter, setAppliedTelcoFilter] = useState("all");

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{ id: string; name: string } | null>(null);

  const [newBundle, setNewBundle] = useState({
    name: "",
    description: "",
    price: 0,
    dataAmount: "",
    telcoCode: "MTN" as string,
  });

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // CSV Export
  const exportCsv = () => {
    if (!bundles.length) return;
    const headers = [
      "Bundle Name",
      "Description",
      "Data Amount",
      "Price",
      "Telco Code",
      "Active",
      "Created At",
    ];

    const rows = bundles.map((b) => [
      b.name ?? "",
      b.description ?? "",
      b.dataAmount ?? "",
      b.price ?? "",
      b.telcoCode ?? "",
      b.isActive ? "Yes" : "No",
      b.createdAt ? new Date(b.createdAt).toLocaleString() : "",
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bundles_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Bundles exported successfully");
  };

  // Fetch bundles from API
  const fetchBundles = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (page === 1) setLoading(true);

      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
      });

      if (appliedSearch) params.append("search", appliedSearch);
      if (appliedTelcoFilter !== "all") params.append("telcoCode", appliedTelcoFilter);

      console.log("📡 Fetching bundles with params:", params.toString());

      const res = await fetch(`${API_URL}/api/bundles/admin?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const payload = await res.json();

      if (!res.ok) {
        setError(payload?.message || "Failed to fetch bundles");
        setBundles([]);
        setTotalBundles(0);
        return;
      }

      const bundlesArray = payload?.data || [];
      setBundles(bundlesArray);
      
      // Parse pagination from API response
      if (payload?.pagination) {
        setTotalBundles(payload.pagination.totalCount || bundlesArray.length);
        setTotalPages(payload.pagination.totalPages || 1);
        setCurrentPage(payload.pagination.page || page);
      } else {
        // Fallback for different response structures
        setTotalBundles(bundlesArray.length);
        setTotalPages(1);
        setCurrentPage(1);
      }

      setError("");
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setBundles([]);
      setTotalBundles(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch bundles on mount and when filters change
  useEffect(() => {
    fetchBundles(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch, appliedTelcoFilter]);

  // Select / Bulk Actions
  const toggleBundleSelection = (id: string) => {
    setSelectedBundles(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBundles.length === bundles.length) {
      setSelectedBundles([]);
    } else {
      setSelectedBundles(bundles.map(b => b._id || b.id || ""));
    }
  };

  const handleSearch = () => {
    setAppliedSearch(search);
    setCurrentPage(1);
  };

  const handleTelcoFilter = (telco: string) => {
    setAppliedTelcoFilter(telco);
    setTelcoFilter(telco);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setTelcoFilter("all");
    setAppliedSearch("");
    setAppliedTelcoFilter("all");
    setCurrentPage(1);
    console.log("🗑️ Filters cleared");
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchBundles(newPage);
  };

  const handleRefresh = () => {
    fetchBundles(currentPage, true);
  };

  const handleDeleteBundle = async (id: string) => {
    // Show confirmation dialog
    const bundleToDelete = bundles.find(b => (b._id || b.id) === id);
    if (bundleToDelete) {
      setConfirmDialog({ id, name: bundleToDelete.name });
    }
  };

  const confirmDelete = async () => {
    if (!confirmDialog) return;
    const id = confirmDialog.id;
    setConfirmDialog(null);

    try {
      // Optimistic UI: remove immediately
      const removedBundle = bundles.find(b => (b._id || b.id) === id);
      setBundles(prev => prev.filter(b => (b._id || b.id) !== id));
      setSelectedBundles(prev => prev.filter(x => x !== id));

      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/bundles/${id}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!res.ok) {
        // Rollback optimistic update on error
        if (removedBundle) {
          setBundles(prev => [...prev, removedBundle]);
        }
        const payload = await res.json();
        showToast(payload?.message || "Failed to delete bundle", "error");
        return;
      }

      showToast("Bundle deleted successfully");
    } catch (err) {
      console.error(err);
      // Rollback
      const removedBundle = bundles.find(b => (b._id || b.id) === id);
      if (removedBundle) {
        setBundles(prev => [...prev, removedBundle]);
      }
      showToast("Error deleting bundle", "error");
    }
  };

  const handleAddBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/bundles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(newBundle),
      });

      if (!res.ok) {
        const payload = await res.json();
        showToast(payload?.message || "Failed to create bundle", "error");
        return;
      }

      setShowCreateModal(false);
      setNewBundle({ name: "", description: "", price: 0, dataAmount: "", telcoCode: "MTN" });
      fetchBundles(1);
      showToast("Bundle created successfully");
    } catch (err) {
      console.error(err);
      showToast("Error creating bundle", "error");
    }
  };

  const handleEditBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditBundle) return;
    try {
      const token = localStorage.getItem("authToken");
      const bundleId = currentEditBundle._id || currentEditBundle.id;
      
      // Optimistic UI: update immediately
      const oldBundles = bundles;
      setBundles(prev => prev.map(b => (b._id || b.id) === bundleId ? currentEditBundle : b));

      const res = await fetch(`${API_URL}/api/bundles/${bundleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(currentEditBundle),
      });

      if (!res.ok) {
        // Rollback optimistic update
        setBundles(oldBundles);
        const payload = await res.json();
        showToast(payload?.message || "Failed to update bundle", "error");
        return;
      }

      setShowEditModal(false);
      setCurrentEditBundle(null);
      showToast("Bundle updated successfully");
    } catch (err) {
      console.error(err);
      showToast("Error updating bundle", "error");
    }
  };

  return (
    <AdminLayout title="Bundles Management">
      <AdminHeader
        title="Data Bundles"
        subtitle="Manage your data bundle offerings"
        actionButton={
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={exportCsv}
              disabled={!bundles.length}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Bundle
            </button>
          </div>
        }
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 flex items-start gap-3">
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold mb-1">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bundles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={telcoFilter}
            onChange={e => handleTelcoFilter(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="all">All Telcos</option>
            <option value="MTN">MTN</option>
            <option value="Vodafone">Vodafone</option>
            <option value="AirtelTigo">AirtelTigo</option>
            <option value="Telecel">Telecel</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
            {(appliedSearch || appliedTelcoFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4 px-2">
        <p className="text-sm text-gray-600">
          Showing <span className="font-bold text-gray-900">{bundles.length}</span> of{" "}
          <span className="font-bold text-gray-900">{totalBundles}</span> bundle(s) on page <span className="font-bold text-gray-900">{currentPage}</span>
        </p>
        {totalPages > 1 && (
          <p className="text-xs text-gray-500">
            {totalPages} total page{totalPages !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Bundles Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedBundles.length === bundles.length && bundles.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Bundle Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Telco</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Loading bundles...
                </td>
              </tr>
            ) : bundles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No bundles found
                </td>
              </tr>
            ) : (
              bundles.map(b => (
                <tr key={b._id || b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedBundles.includes(b._id || b.id || "")}
                      onChange={() => toggleBundleSelection(b._id || b.id || "")}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{b.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{b.description}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{b.dataAmount}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">₵{typeof b.price === 'number' ? b.price.toFixed(2) : b.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      b.telcoCode === 'MTN' ? 'bg-yellow-100 text-yellow-800' :
                      b.telcoCode === 'Vodafone' ? 'bg-red-100 text-red-800' :
                      b.telcoCode === 'AirtelTigo' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {b.telcoCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => { setCurrentViewBundle(b); setShowViewModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setCurrentEditBundle(b); setShowEditModal(true); }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBundle(b._id || b.id || "")}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">
              Showing <span className="font-bold text-gray-900">{(currentPage - 1) * PAGE_SIZE + 1}</span>-<span className="font-bold text-gray-900">{Math.min(currentPage * PAGE_SIZE, totalBundles)}</span> of <span className="font-bold text-gray-900">{totalBundles}</span> bundles
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              title="First page"
            >
              ⟨⟨
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              title="Previous page"
            >
              ⟨
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                const pageNum = currentPage <= 3 ? idx + 1 : currentPage + idx - 2;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <span className="px-2 py-2 text-gray-500">...</span>
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              title="Next page"
            >
              ⟩
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              title="Last page"
            >
              ⟩⟩
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="page-input" className="text-sm text-gray-600 font-medium">Go to page:</label>
            <input
              id="page-input"
              type="number"
              min="1"
              max={totalPages}
              defaultValue={currentPage}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const pageNum = parseInt((e.target as HTMLInputElement).value);
                  if (pageNum >= 1 && pageNum <= totalPages) {
                    handlePageChange(pageNum);
                  }
                }
              }}
              className="w-16 px-2 py-2 border rounded-lg text-sm text-center"
              placeholder={currentPage.toString()}
            />
          </div>
        </div>
      )}

      {/* Create Bundle Modal */}
      <CreateBundleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleAddBundle}
        bundle={newBundle}
        onBundleChange={setNewBundle}
      />

      {/* Edit Bundle Modal */}
      {showEditModal && currentEditBundle && (
      <EditBundleModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditBundle}
        bundle={currentEditBundle}
        onBundleChange={setCurrentEditBundle}
      />
      )}

      {/* View Bundle Modal */}
      <ViewBundleModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        bundle={currentViewBundle}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          <p className="flex items-center gap-2">
            {toast.type === 'success' ? '✓' : '✕'} {toast.message}
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{confirmDialog.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
