"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/dashboard/user/components/UserSidebar";
import Header from "@/app/dashboard/user/components/UserHeader";

import { getTokenExpiryMs, isTokenExpired, logout } from "@/lib/jwtAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    let timer: number | undefined;

    const runAuthGuard = () => {
      const token = localStorage.getItem("authToken");
      const user = localStorage.getItem("user");

      // ✅ Not logged in
      if (!token || !user) {
        router.replace("/login");
        return;
      }

      // ✅ Token expired
      if (isTokenExpired(token)) {
        logout(router);
        return;
      }

      // ✅ User role protection (user routes only)
      try {
        const userData = JSON.parse(user);
        if (userData?.role === "admin") {
          router.replace("/dashboard/admin");
          return;
        }
      } catch {
        router.replace("/login");
        return;
      }

      // ✅ Auto logout exactly at expiry time
      const expMs = getTokenExpiryMs(token);
      if (expMs) {
        const msLeft = expMs - Date.now();
        timer = window.setTimeout(() => logout(router), Math.max(msLeft, 0));
      }
    };

    runAuthGuard();

    // ✅ Sync logout across tabs/components
    const onAuthChanged = () => {
      const token = localStorage.getItem("authToken");
      if (!token) router.replace("/login");
    };
    window.addEventListener("userAuthChanged", onAuthChanged);

    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("userAuthChanged", onAuthChanged);
    };
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Fixed positioning on mobile, static on desktop */}
      <div className="fixed inset-y-0 left-0 z-40 lg:static lg:z-auto">
        <Sidebar />
      </div>

      {/* Main content area - Add left margin on desktop to account for sidebar */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-0">
        {/* Static Header */}
        <Header />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
