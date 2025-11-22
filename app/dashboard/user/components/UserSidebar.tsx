"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, User, LogOut, X, History, Menu } from "lucide-react";

export default function UserSidebar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // ✅ Clear auth token
    localStorage.removeItem("authToken");

    // Optional: clear any other saved user data
    localStorage.removeItem("user");

    // ✅ Redirect to login page (or homepage)
    router.push("/");

    // ✅ Close sidebar (for mobile)
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
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-white border-r flex flex-col z-50 md:z-auto shadow-xl md:shadow-none transition-transform duration-300 ease-in-out 
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header Section */}
        <div className="p-5 border-b relative flex-shrink-0">
          {/* Close button for mobile */}
          <button
            onClick={() => setOpen(false)}
            className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="font-bold text-xl text-blue-600">User Dashboard</h2>
        </div>

        {/* Navigation Section - Scrollable if needed */}
        <nav className="flex-1 overflow-y-auto p-5">
          <div className="space-y-2">
            <Link
              href="/dashboard/user"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>

            <Link
              href="/dashboard/user/orders"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              <History className="w-5 h-5" />
              <span className="font-medium">Orders</span>
            </Link>

            <Link
              href="/dashboard/user/profile"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>
          </div>
        </nav>

        {/* Logout Section - Stays at bottom */}
        <div className="p-5 border-t flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}