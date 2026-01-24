"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, User, LogOut, Settings } from "lucide-react";
import { apiCache, CACHE_TTL } from "@/lib/cache";

interface UserProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role: string;
  isverified?: boolean;
}

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserProfile?: boolean;
  actionButton?: React.ReactNode;
  onSearch?: (query: string) => void;
}

export default function AdminHeader({
  title,
  subtitle,
  showSearch = true,
  showNotifications = true,
  showUserProfile = true,
  actionButton,
  onSearch
}: AdminHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const data = await apiCache.getOrFetch(
          'admin-profile',
          () => fetch(`${API_BASE}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(r => r.json()),
          CACHE_TTL.LONG
        );

        setUser(data.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [API_BASE]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const userName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Admin"
    : "Admin";

  const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Administrator";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Left Section - Title */}
      <div className="flex-1">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
        )}
      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search Bar */}
        {showSearch && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              onChange={handleSearch}
              className="pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm w-56"
            />
          </div>
        )}

        {/* Notifications */}
        {showNotifications && (
          <button className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors" title="Notifications">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
          </button>
        )}

        {/* User Profile */}
        {showUserProfile && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">{loading ? "Loading..." : userName}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 animate-slide-down">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{user?.email || "No email"}</p>
                </div>
                <div className="p-2 space-y-1">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("authToken");
                      localStorage.removeItem("user");
                      apiCache.clear();
                      router.push("/login");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {actionButton && (
          <div className="ml-1">
            {actionButton}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}