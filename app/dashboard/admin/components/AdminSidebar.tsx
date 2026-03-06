"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Home,
  CreditCard,
  MessageSquare,
  Shield,
} from "lucide-react";
import { authFetch } from "@/lib/authFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Reusable Provider Toggle Component
function ProviderToggle({ router }: { router: any }) {
  const [provider, setProvider] = useState("hubnet");
  const [loading, setLoading] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.className = `fixed bottom-4 right-4 p-3 rounded-lg text-white shadow-lg ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  useEffect(() => {
    authFetch(router, `${API_URL}/api/admin/get-provider`)
      .then((res) => res.json())
      .then((data) => data?.provider && setProvider(data.provider))
      .catch(() => {});
  }, [router]);

  const handleChange = async (newProvider: string) => {
    setLoading(true);
    try {
      const res = await authFetch(router, `${API_URL}/api/admin/set-provider`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: newProvider }),
      });
      if (res.ok) {
        setProvider(newProvider);
        showToast(`Provider switched to ${newProvider}`);
      } else {
        showToast("Failed to switch provider", "error");
      }
    } catch {
      showToast("Failed to switch provider", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 mt-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">API Provider</h3>
      <div className="flex flex-col gap-2">
        <button
          disabled={loading}
          onClick={() => handleChange("hubnet")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
            provider === "hubnet"
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Hubnet (MTN only)
        </button>
        <button
          disabled={loading}
          onClick={() => handleChange("xpresportal")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
            provider === "xpresportal"
              ? "bg-green-600 text-white shadow"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          XpresPortal (All networks)
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Current: <span className="font-semibold">{provider}</span>
      </p>
    </div>
  );
}

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (open && !target.closest("aside") && !target.closest("button[aria-label='menu']")) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const menuItems = [
    { title: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: "Orders", href: "/dashboard/admin/orders", icon: <ShoppingBag className="w-5 h-5" /> },
    { title: "Users", href: "/dashboard/admin/users", icon: <Users className="w-5 h-5" /> },
    { title: "Payments", href: "/dashboard/admin/payments", icon: <CreditCard className="w-5 h-5" /> },
    { title: "Bundles", href: "/dashboard/admin/bundles", icon: <Package className="w-5 h-5" /> },
    { title: "Profile", href: "/dashboard/admin/profile", icon: <MessageSquare className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = `authToken=; path=/; max-age=0`;
    document.cookie = `user=; path=/; max-age=0`;
    window.dispatchEvent(new Event("userAuthChanged"));
    router.push("/login");
    setOpen(false);
  };

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg z-50 shadow-lg"
        onClick={() => setOpen(!open)}
        aria-label="menu"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed md:static top-0 left-0 h-screen bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 z-40 transition-all duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${collapsed ? "w-20" : "w-64"}`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className={`flex items-center justify-between ${collapsed ? "flex-col" : ""}`}>
            <Link href="/dashboard/admin" className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""}`}>
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              {!collapsed && (
                <div>
                  <h2 className="font-bold text-xl text-gray-900">Admin Panel</h2>
                  <p className="text-xs text-gray-500">DataBundleSite</p>
                </div>
              )}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:block p-2 hover:bg-gray-100 rounded-lg"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? "" : "rotate-180"}`} />
            </button>
          </div>
        </div>

        <nav className="p-4 overflow-y-auto h-[calc(100vh-200px)]">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group
                      ${isActive
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100"
                        : "text-gray-700 hover:bg-gray-100"}
                      ${collapsed ? "justify-center" : ""}`}
                  >
                    <span className={isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="font-medium flex-1">{item.title}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Provider Toggle */}
          {!collapsed && <ProviderToggle router={router} />}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className={`${collapsed ? "flex justify-center" : ""}`}>
            <Link
              href="/"
              className={`flex items-center gap-3 text-gray-700 hover:text-blue-600 ${collapsed ? "justify-center" : ""}`}
            >
              <Home className="w-5 h-5" />
              {!collapsed && <span className="text-sm">Back to Home</span>}
            </Link>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 text-red-600 hover:text-red-800 mt-3 ${collapsed ? "justify-center" : ""}`}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}