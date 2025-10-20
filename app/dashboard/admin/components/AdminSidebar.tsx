"use client";
import { useState } from "react";
import Link from "next/link";

export default function UserSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 bg-blue-600 text-white p-2 rounded-lg z-50"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>
      <aside
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-white border-r p-4 z-40 transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="font-bold text-lg mb-6">User Panel</h2>
        <nav className="space-y-3">
          <Link href="/dashboard/user" className="block hover:text-blue-600">Dashboard</Link>
          <Link href="/dashboard/user/orders" className="block hover:text-blue-600">My Orders</Link>
          <Link href="/dashboard/user/profile" className="block hover:text-blue-600">Profile</Link>
        </nav>
      </aside>
    </>
  );
}
