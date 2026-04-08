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
  User,
  Users,
  Shield,
  TrendingUp,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  isverified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const roleStyles: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800",
  user: "bg-blue-100 text-blue-800",
  agent: "bg-green-100 text-green-800",
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{ userId: string; name: string } | null>(null);
  

  const USERS_PER_PAGE = 20; // default from API



  // Delete user handler
  // Show dialog, then delete on confirm
  const handleDeleteUser = (userId: string, name: string) => {
    setConfirmDialog({ userId, name });
  };

  const confirmDeleteUser = async () => {
    if (!confirmDialog) return;
    const userId = confirmDialog.userId;
    setConfirmDialog(null);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/auth/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setToast({ message: payload?.message || "Failed to delete user", type: "error" });
        return;
      }
      setUsers(prev => prev.filter(u => u._id !== userId));
      setToast({ message: "User deleted successfully", type: "success" });
    } catch (err) {
      setToast({ message: "Error deleting user", type: "error" });
    }
    setTimeout(() => setToast(null), 3000);
  };

  // Filtering (client-side) - kept simple while pagination is server-driven
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || "").includes(search);

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesVerified =
      verifiedFilter === "all" ||
      (verifiedFilter === "verified" ? !!u.isverified : !u.isverified);

    return matchesSearch && matchesRole && matchesVerified;
  });

  const paginatedUsers = filteredUsers; // server returns page; here page array is set directly

  const stats = {
    total: totalUsers,
    verified: users.filter((u) => u.isverified).length,
    admins: users.filter((u) => u.role === "admin").length,
    agents: users.filter((u) => u.role === "agent").length,
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === paginatedUsers.length) setSelected([]);
    else setSelected(paginatedUsers.map((u) => u._id));
  };

  const getStatusBadge = (user: User) => {
    return user.isverified ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Verified
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
        <XCircle className="w-3 h-3" />
        Not Verified
      </span>
    );
  };

  // Fetch users from API
  const fetchUsers = async (page = 1, limit = USERS_PER_PAGE) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const url = new URL(`${API_URL}/api/auth/users`);
      url.searchParams.append("page", String(page));
      url.searchParams.append("limit", String(limit));

      const res = await fetch(url.toString(), {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Failed to fetch users");
      }

      const payload = await res.json();
      const data: User[] = payload?.data || [];
      const pagination = payload?.pagination || {};

      setUsers(data);
      setTotalUsers(pagination?.total ?? data.length);
      setTotalPages(pagination?.pages ?? 1);
      setCurrentPage(pagination?.page ?? page);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    // fetchUsers will be triggered by useEffect
  };

  // CSV export for users
  const exportCsvUsers = () => {
    if (!users || users.length === 0) return;
    const headers = ["First Name", "Last Name", "Email", "Phone", "Role", "Verified", "Created At"];
    const rows = users.map(u => [
      u.firstName ?? "",
      u.lastName ?? "",
      u.email ?? "",
      u.phone ?? "",
      u.role ?? "",
      u.isverified ? "Yes" : "No",
      u.createdAt ? new Date(u.createdAt).toLocaleString() : "",
    ]);

    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const filename = `users-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}.csv`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Users Management">
      <AdminHeader
        title="Users Management"
        subtitle="Monitor and manage all user accounts"
        actionButton={
            <button onClick={exportCsvUsers} disabled={users.length === 0} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users", value: stats.total, color: "text-blue-600", bg: "bg-blue-50", icon: <Users className="w-5 h-5 text-blue-600" /> },
          { label: "Verified Users", value: stats.verified, color: "text-green-600", bg: "bg-green-50", icon: <CheckCircle className="w-5 h-5 text-green-600" /> },
          { label: "Admin Users", value: stats.admins, color: "text-purple-600", bg: "bg-purple-50", icon: <Shield className="w-5 h-5 text-purple-600" /> },
          { label: "Agents", value: stats.agents, color: "text-orange-600", bg: "bg-orange-50", icon: <User className="w-5 h-5 text-orange-600" /> },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>{s.icon}</div>
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
              placeholder="Search by name, email, phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="agent">Agent</option>
          </select>
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selected.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Verified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(u._id)}
                        onChange={() => toggleSelect(u._id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <p>{u.email}</p>
                      <p className="text-xs text-gray-400">{u.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleStyles[u.role ?? 'user']}`}>
                        {(u.role ? (u.role.charAt(0).toUpperCase() + u.role.slice(1)) : 'User')}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(u)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                        <button
                          onClick={() => handleDeleteUser(u._id, `${u.firstName} ${u.lastName}`)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                            {/* Confirmation Dialog (global, not per row) */}
                            {confirmDialog && (
                              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 animate-fade-in">
                                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                                  <h3 className="text-xl font-bold mb-2 text-gray-900">Delete User</h3>
                                  <p className="text-gray-600 mb-6 text-sm">
                                    Are you sure you want to delete <span className="font-semibold">{confirmDialog.name}</span>? This action cannot be undone.
                                  </p>
                                  <div className="flex justify-end gap-3 mt-6">
                                    <button
                                      onClick={() => setConfirmDialog(null)}
                                      className="px-5 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-sm"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={confirmDeleteUser}
                                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Toast Notification (global, not per row) */}
                            {toast && (
                              <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 ${
                                toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                              }`}>
                                <p className="flex items-center gap-2">
                                  {toast.type === 'success' ? '✓' : '✕'} {toast.message}
                                </p>
                              </div>
                            )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {totalUsers === 0 ? 0 : ((currentPage - 1) * USERS_PER_PAGE) + 1} to {Math.min(currentPage * USERS_PER_PAGE, totalUsers)} of {totalUsers}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
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
