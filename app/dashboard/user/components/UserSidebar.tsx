"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, User, LogOut } from "lucide-react";

export default function UserSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 bg-blue-600 text-white p-2 rounded-lg z-50"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r p-5 z-40 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="font-bold text-xl mb-8 text-blue-600">My Account</h2>

        <nav className="space-y-4">
          <Link
            href="/dashboard/user"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>

          <Link
            href="/dashboard/user/orders"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <ShoppingBag className="w-5 h-5" />
            My Orders
          </Link>

          <Link
            href="/dashboard/user/profile"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <User className="w-5 h-5" />
            Profile
          </Link>

          <button className="flex items-center gap-2 text-gray-700 hover:text-red-600">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}
