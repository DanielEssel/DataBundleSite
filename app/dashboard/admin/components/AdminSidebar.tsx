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

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar on mobile when clicking outside
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
    {
      title: "Dashboard",
      href: "/dashboard/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: null,
    },
    {
      title: "Orders",
      href: "/dashboard/admin/orders",
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: null,
    },
    {
      title: "Users",
      href: "/dashboard/admin/users",
      icon: <Users className="w-5 h-5" />,
      badge: null,
    },
    {
      title: "Bundles",
      href: "/dashboard/admin/bundles",
      icon: <Package className="w-5 h-5" />,
      badge: null,
    },
    {
      title: "Profile",
      href: "/dashboard/admin/profile",
      icon: <MessageSquare className="w-5 h-5" />,
      badge: null,
    }
  ];

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");

    // Clear cookies
    try {
      document.cookie = `authToken=; path=/; max-age=0`;
      document.cookie = `user=; path=/; max-age=0`;
      document.cookie = `token=; path=/; max-age=0`;
      document.cookie = `adminToken=; path=/; max-age=0`;
    } catch (e) {
      console.warn("Could not clear cookies:", e);
    }

    // Notify other components/tabs
    window.dispatchEvent(new Event("userAuthChanged"));

    // Redirect to login and close sidebar
    router.push("/login");
    setOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg z-50 shadow-lg"
        onClick={() => setOpen(!open)}
        aria-label="menu"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-screen bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 
          z-40 transition-all duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Sidebar Header */}
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

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-200px)]">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group
                      ${isActive 
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100" 
                        : "text-gray-700 hover:bg-gray-100"
                      }
                      ${collapsed ? "justify-center" : ""}
                    `}
                  >
                    <span className={isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="font-medium flex-1">{item.title}</span>
                        {item.badge && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
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