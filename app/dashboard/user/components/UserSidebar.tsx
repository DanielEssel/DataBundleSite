"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, User, LogOut, X, History } from "lucide-react";

export default function UserSidebar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // ✅ Clear auth token
    localStorage.removeItem("authToken");

    // Optional: clear any other saved user data
    localStorage.removeItem("user");

    // ✅ Redirect to login page (or homepage)
    router.push("/login");

    // ✅ Close sidebar (for mobile)
    setOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle (Hamburger) */}
      <button
        className="md:hidden fixed top-3 left-3 text-blue-600 p-2 font-bold z-40"
        onClick={() => setOpen(true)}
        aria-label="Open Sidebar"
      >
        ☰
      </button>

      {/* Sidebar Overlay (for mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-white border-r p-5 z-40 shadow-md md:shadow-none transition-transform duration-300 ease-in-out 
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-bold text-xl mb-8 text-blue-600">User</h2>

        <nav className="space-y-6">
          <Link
            href="/dashboard/user"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            onClick={() => setOpen(false)}
          >
            <Home className="w-5 h-5" />
            Home
          </Link>

          <Link
            href="/dashboard/user/orders"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            onClick={() => setOpen(false)}
          >
            <History className="w-5 h-5" />
            Orders
          </Link>

          <Link
            href="/dashboard/user/profile"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            onClick={() => setOpen(false)}
          >
            <User className="w-5 h-5" />
            Profile
          </Link>

          {/* ✅ Working Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}
