"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Bell, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserHeader() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Try localStorage first to avoid a round-trip on every page
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.firstName) {
          setUser(parsed);
          return;
        }
      }
    } catch {
      // fall through to API fetch
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Profile fetch failed (${res.status})`);
        const data = await res.json();
        setUser(data.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
  }, []);

  const firstName = user?.firstName || "";
  const initials  = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">

        {/* ── Left: greeting ──────────────────────────────────────────────── */}
        <div className="ml-10 sm:ml-0">
          <p className="text-xs text-gray-400 font-medium leading-none">
            {getGreeting()}
          </p>
          <h1 className="text-sm sm:text-base font-bold text-gray-900 mt-0.5 leading-none truncate max-w-[180px] sm:max-w-none">
            {firstName || "Welcome back"}
          </h1>
        </div>

        {/* ── Right: actions + avatar ──────────────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Notification bell */}
          <button
            aria-label="Notifications"
            className="relative p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {/* Unread dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
          </button>

          {/* Avatar + name */}
          <button className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors group">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt="Avatar"
                width={36}
                height={36}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                {initials}
              </div>
            )}

            {/* Name — hidden on very small screens */}
            {user && (
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate max-w-[100px]">
                  {firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-gray-400 truncate max-w-[100px]">
                  {user.email}
                </p>
              </div>
            )}

            <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
          </button>
        </div>
      </div>
    </header>
  );
}