"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Bell } from "lucide-react";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export default function UserHeader() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return console.warn("⚠️ No token found — please log in first.");

        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${baseUrl}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch profile (${res.status})`);
        const data = await res.json();
        setUser(data.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
  }, []);

  const initials =
    user
      ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
      : "U";

  return (
    <header className="flex items-center justify-between bg-white border-b px-3 sm:px-6 py-3 sm:py-4 shadow-sm sticky top-0 z-30 w-full">
      {/* Left Section - Title */}
      <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 truncate max-w-[60%] sm:max-w-none ml-10 sm:ml-0">
        My Dashboard
      </h1>

      {/* Right Section */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        {/* Notification */}
        <button
          aria-label="Notifications"
          className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition"
        >
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hover:text-blue-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
        </button>

        {/* Avatar / Initials */}
        {user?.avatar ? (
          <Image
            src={user.avatar}
            alt="User Avatar"
            width={40}
            height={40}
            className="rounded-full object-cover border w-8 h-8 sm:w-10 sm:h-10"
          />
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-sm sm:text-base">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
