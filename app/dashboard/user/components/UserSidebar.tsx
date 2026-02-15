"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, User, LogOut, X, History, Menu } from "lucide-react";

export default function UserSidebar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

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
      {/* Mobile Toggle (Hamburger) */}
      <button
        className="md:hidden fixed top-4 left-4 text-blue-600 p-2 bg-white rounded-lg shadow-md z-50 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Open Sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar Overlay (for mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-screen w-64 bg-white border-r flex flex-col z-50 md:z-auto shadow-xl md:shadow-none transition-transform duration-300 ease-in-out 
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header Section - Compact on mobile */}
        <div className="p-4 md:p-5 border-b relative flex-shrink-0">
          {/* Close button for mobile */}
          <button
            onClick={() => setOpen(false)}
            className="md:hidden absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="font-bold text-lg md:text-xl text-blue-600 pr-8 md:pr-0">
            User Dashboard
          </h2>
        </div>

        {/* Navigation Section - Scrollable if needed */}
        <nav className="flex-1 overflow-y-auto p-4 md:p-5">
          <div className="space-y-1.5 md:space-y-2">
            <Link
              href="/dashboard/user"
              className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Home</span>
            </Link>

            <Link
              href="/dashboard/user/orders"
              className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              <History className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Orders</span>
            </Link>
            <Link
              href="/dashboard/user/AFA_Registration"
              className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              <User className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">AFA Registration</span>
            </Link>

            <Link
              href="/dashboard/user/profile"
              className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              <User className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Profile</span>
            </Link>
          </div>
        </nav>

        {/* Logout Section - Stays at bottom */}
        <div className="p-4 md:p-5 border-t flex-shrink-0 bg-gray-50 md:bg-transparent">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}