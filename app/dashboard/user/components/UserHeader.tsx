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
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${baseUrl}/api/auth/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error(`Failed to fetch profile (${res.status})`);
        const data = await res.json();

        // Make sure we’re reading the correct data structure
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
    <header className="flex items-center justify-between bg-white border-b px-4 py-3 shadow-sm sticky top-0 z-30">
      <h1 className="text-lg font-semibold text-gray-800">User Dashboard</h1>

      <div className="flex items-center space-x-4">
        <button className="relative">
          <Bell className="w-5 h-5 text-gray-600 hover:text-blue-600" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full"></span>
        </button>

        {user?.avatar ? (
          <Image
            src={user.avatar}
            alt="User Avatar"
            width={36}
            height={36}
            className="rounded-full object-cover border"
          />
        ) : (
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
