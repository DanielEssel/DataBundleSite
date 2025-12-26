"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  MessageCircle,
  Settings,
  Bell,
  Globe,
  CreditCard,
  BarChart3,
  Users,
  ShoppingBag,
  Package,
  Activity,
  TrendingUp,
  Edit,
  Key,
  LogOut,
  AlertCircle,
  Database,
  Server,
  Cpu,
  ShieldCheck,
  Eye
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

interface AdminProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: string;
  isverified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
  permissions?: string[];
  lastLogin?: string;
  loginHistory?: { date: string; ip: string; location?: string }[];
}

interface SystemStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeBundles: number;
  pendingOrders: number;
  todayRevenue: number;
  systemUptime: string;
  serverLoad: number;
}

export default function AdminProfilePage() {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    fetchAdminProfile(token);
    fetchSystemStats(token);
  }, [router]);

  const fetchAdminProfile = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch admin profile");
      const data = await res.json();
      setAdmin(data.data);
    } catch (err) {
      console.error(err);
      router.replace("/admin/login");
    }
  };

  const fetchSystemStats = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch system stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("adminToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Clear cookies
    try {
      document.cookie = `adminToken=; path=/; max-age=0`;
      document.cookie = `authToken=; path=/; max-age=0`;
      document.cookie = `user=; path=/; max-age=0`;
      document.cookie = `token=; path=/; max-age=0`;
    } catch (e) {
      console.warn("Could not clear cookies:", e);
    }

    // Notify other components
    window.dispatchEvent(new Event("userAuthChanged"));

    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  const fullName = `${admin.firstName || ""} ${admin.lastName || ""}`.trim() || "Admin";
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const permissions = admin.permissions || ["read", "write", "delete", "manage_users", "manage_bundles"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Profile</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Manage your account and monitor system performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSecurityModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <Key className="w-4 h-4" />
              Security
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Profile & Quick Stats */}
          <div className="lg:w-1/3 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex flex-col items-center text-center">
                {admin.avatar ? (
                  <div className="relative">
                    <Image
                      src={admin.avatar}
                      alt={fullName}
                      width={96}
                      height={96}
                      className="rounded-full object-cover border-4 border-blue-100"
                    />
                    <div className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-1 border-2 border-white">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold shadow-lg">
                      {initials}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-1 border-2 border-white">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                
                <h2 className="text-xl font-bold text-gray-900 mt-4">{fullName}</h2>
                <p className="text-gray-600 mt-1">{admin.email}</p>

                <div className="flex items-center gap-2 mt-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    admin.role === "super_admin" 
                      ? "bg-purple-100 text-purple-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {admin.role?.replace('_', ' ').toUpperCase() || "ADMIN"}
                  </div>
                  {admin.isverified ? (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                      <XCircle className="w-3 h-3" />
                      Unverified
                    </div>
                  )}
                </div>

                {/* Quick Info */}
                <div className="w-full mt-6 space-y-3">
                  {admin.phone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>{admin.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Joined {new Date(admin.createdAt || "").toLocaleDateString()}</span>
                  </div>
                  {admin.lastLogin && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Activity className="w-4 h-4 text-green-600" />
                      <span>Last login: {new Date(admin.lastLogin).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="w-full mt-6 space-y-2">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white py-2.5 px-4 rounded-lg font-medium transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-medium transition-all">
                    <Bell className="w-4 h-4" />
                    Notification Settings
                  </button>
                </div>
              </div>
            </div>

            {/* System Health */}
            {stats && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  System Health
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Server Load</span>
                      <span className={`text-sm font-medium ${
                        stats.serverLoad > 80 ? "text-red-600" : 
                        stats.serverLoad > 60 ? "text-amber-600" : "text-green-600"
                      }`}>
                        {stats.serverLoad}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          stats.serverLoad > 80 ? "bg-red-500" : 
                          stats.serverLoad > 60 ? "bg-amber-500" : "bg-green-500"
                        }`}
                        style={{ width: `${stats.serverLoad}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">System Uptime</span>
                      <span className="text-sm font-medium text-green-600">{stats.systemUptime}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: "99%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:w-2/3 space-y-6">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-200">
              <div className="flex space-x-1">
                {[
                  { id: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
                  { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
                  { id: "permissions", label: "Permissions", icon: <ShieldCheck className="w-4 h-4" /> },
                  { id: "security", label: "Security", icon: <Key className="w-4 h-4" /> },
                  { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats && [
                      { label: "Total Users", value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: "bg-blue-500", change: "+12%" },
                      { label: "Total Orders", value: stats.totalOrders, icon: <ShoppingBag className="w-5 h-5" />, color: "bg-green-500", change: "+8%" },
                      { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: <CreditCard className="w-5 h-5" />, color: "bg-purple-500", change: "+15%" },
                      { label: "Active Bundles", value: stats.activeBundles, icon: <Package className="w-5 h-5" />, color: "bg-orange-500", change: "+5%" },
                    ].map((stat, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                            <div className="text-white">{stat.icon}</div>
                          </div>
                          <span className="text-sm font-medium text-green-600">{stat.change}</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {[
                        { action: "Processed 25 new orders", time: "5 minutes ago", type: "order" },
                        { action: "Updated MTN bundle pricing", time: "2 hours ago", type: "bundle" },
                        { action: "Suspended user account: john.doe", time: "1 day ago", type: "user" },
                        { action: "Generated monthly revenue report", time: "2 days ago", type: "report" },
                        { action: "Added new admin user", time: "3 days ago", type: "admin" },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            activity.type === "order" ? "bg-green-100" :
                            activity.type === "bundle" ? "bg-blue-100" :
                            activity.type === "user" ? "bg-red-100" :
                            activity.type === "report" ? "bg-purple-100" : "bg-amber-100"
                          }`}>
                            {activity.type === "order" && <ShoppingBag className="w-4 h-4 text-green-600" />}
                            {activity.type === "bundle" && <Package className="w-4 h-4 text-blue-600" />}
                            {activity.type === "user" && <Users className="w-4 h-4 text-red-600" />}
                            {activity.type === "report" && <BarChart3 className="w-4 h-4 text-purple-600" />}
                            {activity.type === "admin" && <Shield className="w-4 h-4 text-amber-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-500">{activity.time}</p>
                          </div>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-4">Daily Performance</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Today's Revenue</span>
                            <span className="text-sm font-bold text-green-600">${stats.todayRevenue}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 bg-green-500 rounded-full" style={{ width: "75%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Pending Orders</span>
                            <span className="text-sm font-bold text-amber-600">{stats.pendingOrders}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 bg-amber-500 rounded-full" style={{ width: "30%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-4">System Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Database Size</span>
                          <span className="text-sm font-medium">2.4 GB</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">API Requests (24h)</span>
                          <span className="text-sm font-medium">12,456</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg Response Time</span>
                          <span className="text-sm font-medium text-green-600">124ms</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Error Rate</span>
                          <span className="text-sm font-medium text-green-600">0.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "permissions" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Admin Permissions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissions.map((permission, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {permission.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-bold text-blue-900 mb-2">Permission Guidelines</h4>
                        <ul className="space-y-2 text-sm text-blue-800">
                          <li>• Super Admins have full system access</li>
                          <li>• Content Admins can manage bundles and orders</li>
                          <li>• Support Admins can view user data and provide support</li>
                          <li>• Audit logs track all admin actions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <Key className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-600">Add an extra layer of security</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                          Enable
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">Session Management</p>
                            <p className="text-sm text-gray-600">Manage active sessions and devices</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                          View Sessions
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <Database className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">API Access</p>
                            <p className="text-sm text-gray-600">Manage API keys and access</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                          Manage Keys
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Login History */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Login History</h3>
                    <div className="space-y-3">
                      {admin.loginHistory ? (
                        admin.loginHistory.slice(0, 5).map((login, index) => (
                          <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{login.location || "Unknown Location"}</p>
                              <p className="text-sm text-gray-600">{login.ip} • {new Date(login.date).toLocaleString()}</p>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              login.location ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              {login.location ? "Normal" : "Unknown"}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No login history available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Notifications</label>
                        <div className="space-y-2">
                          {[
                            { label: "Order notifications", default: true },
                            { label: "System alerts", default: true },
                            { label: "Security alerts", default: true },
                            { label: "Marketing emails", default: false },
                            { label: "Weekly reports", default: true },
                          ].map((setting, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-900">{setting.label}</span>
                              <button className={`w-10 h-6 rounded-full transition-colors ${
                                setting.default ? "bg-blue-600" : "bg-gray-300"
                              }`}>
                                <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                                  setting.default ? "translate-x-6" : "translate-x-1"
                                }`}></div>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Preferences</label>
                        <div className="space-y-3">
                          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                            <option>Light Theme</option>
                            <option>Dark Theme</option>
                            <option>Auto (System)</option>
                          </select>
                          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                            <option>English</option>
                            <option>French</option>
                            <option>Spanish</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-1" />
                      <div>
                        <h4 className="font-bold text-red-900 mb-2">Danger Zone</h4>
                        <p className="text-sm text-red-800 mb-3">These actions are irreversible. Please proceed with caution.</p>
                        <div className="flex gap-3">
                          <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium">
                            Deactivate Account
                          </button>
                          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-green-500 p-3 rounded-xl">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Admin Support</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Need assistance? Contact the system administrator or technical support.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/233557424675"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl shadow-md transition-all font-medium"
            >
              <FaWhatsapp className="w-5 h-5" />
              <span>Contact Admin Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Edit Admin Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    defaultValue={admin.firstName}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    defaultValue={admin.lastName}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  defaultValue={admin.phone}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                <input
                  type="url"
                  defaultValue={admin.avatar}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Security Settings</h3>
              <button onClick={() => setShowSecurityModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <input type="checkbox" id="logoutAll" className="rounded border-gray-300" />
                  <label htmlFor="logoutAll" className="text-sm text-gray-700">
                    Log out from all other devices
                  </label>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSecurityModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}