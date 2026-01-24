"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

import AdminSidebar from "./components/AdminSidebar";
import { getTokenExpiryMs, isTokenExpired, logout } from "@/lib/jwtAuth";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

export default function AdminLayout({
  children,
  title = "Admin Dashboard",
  showHeader = true,
}: AdminLayoutProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ✅ Admin auth guard + auto logout
  useEffect(() => {
    let timer: number | undefined;

    const runAuthGuard = () => {
      const token = localStorage.getItem("authToken");
      const user = localStorage.getItem("user");

      // ❌ Not logged in
      if (!token || !user) {
        router.replace("/login");
        return;
      }

      // ❌ Token expired
      if (isTokenExpired(token)) {
        logout(router);
        return;
      }

      // ❌ Not admin
      try {
        const userData = JSON.parse(user);
        if (userData?.role !== "admin") {
          router.replace("/dashboard/user");
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

    // ✅ Sync logout across tabs / components
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
