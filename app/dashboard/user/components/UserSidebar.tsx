"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  User,
  LogOut,
  X,
  History,
  Menu,
  FileText,
  ChevronRight,
} from "lucide-react";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/dashboard/user",         label: "Home",             icon: Home     },
  { href: "/dashboard/user/orders",  label: "Orders",           icon: History  },
  { href: "/dashboard/user/Afa",     label: "AFA Registration", icon: FileText },
  { href: "/dashboard/user/profile", label: "Profile",          icon: User     },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("");

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserSidebar() {
  const [open, setOpen]           = useState(false);
  const [userName, setUserName]   = useState("");
  const [userEmail, setUserEmail] = useState("");
  const router   = useRouter();
  const pathname = usePathname();

  // Read user info from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const u = JSON.parse(raw);
      const name = u.name || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "User";
      setUserName(name);
      setUserEmail(u.email || "");
    } catch {
      // silently ignore
    }
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleLogout = () => {
    ["authToken", "user", "token", "adminToken"].forEach((k) =>
      localStorage.removeItem(k)
    );

    try {
      ["authToken", "user", "token", "adminToken"].forEach((k) => {
        document.cookie = `${k}=; path=/; max-age=0`;
      });
    } catch (e) {
      console.warn("Could not clear cookies:", e);
    }

    window.dispatchEvent(new Event("userAuthChanged"));
    router.push("/login");
    setOpen(false);
  };

  const isActive = (href: string) =>
    href === "/dashboard/user"
      ? pathname === href
      : pathname.startsWith(href);

  const initials = getInitials(userName || "U");

  return (
    <>
      {/* ── Mobile hamburger ──────────────────────────────────────────────── */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-md border border-gray-100 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50 md:z-auto shadow-xl md:shadow-none transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* ── Brand header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">User Dashboard</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
       

        {/* ── Navigation ────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
            Menu
          </p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                      ${active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${active ? "text-white" : "text-gray-400"}`} />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Logout ────────────────────────────────────────────────────── */}
        <div className="px-3 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-red-500 transition-colors" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}