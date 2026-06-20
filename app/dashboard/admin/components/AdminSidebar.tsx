"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  CreditCard,
  User,
  LogOut,
  ChevronRight,
  Home,
  Menu,
  X,
  Zap,
  Loader2,
} from "lucide-react";
import { authFetch } from "@/lib/authFetch";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard/admin",          icon: LayoutDashboard },
  { title: "Orders",    href: "/dashboard/admin/orders",   icon: ShoppingBag     },
  { title: "Users",     href: "/dashboard/admin/users",    icon: Users           },
  { title: "Payments",  href: "/dashboard/admin/payments", icon: CreditCard      },
  { title: "Bundles",   href: "/dashboard/admin/bundles",  icon: Package         },
  { title: "Profile",   href: "/dashboard/admin/profile",  icon: User            },
];

const PROVIDERS = [
  { value: "hubnet",      label: "Hubnet",      sub: "MTN only",      accent: "bg-blue-600"   },
  { value: "xpresportal", label: "XpresPortal", sub: "All networks",  accent: "bg-emerald-600" },
  { value: "spfastmtn",   label: "SPFastMTN",   sub: "MTN only",      accent: "bg-orange-500" },
] as const;

type ProviderValue = typeof PROVIDERS[number]["value"];

// ─── Provider Toggle ──────────────────────────────────────────────────────────

function ProviderToggle({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderValue>("hubnet");
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    authFetch(router, `${API_URL}/api/admin/get-provider`)
      .then((r) => r.json())
      .then((d) => d?.provider && setProvider(d.provider as ProviderValue))
      .catch(() => {});
  }, [router]);

  const handleChange = async (val: ProviderValue) => {
    if (val === provider || loading) return;
    setLoading(true);
    try {
      const res = await authFetch(router, `${API_URL}/api/admin/set-provider`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: val }),
      });
      if (res.ok) {
        setProvider(val);
        showToast(`Switched to ${val}`);
      } else {
        showToast("Failed to switch provider", false);
      }
    } catch {
      showToast("Failed to switch provider", false);
    } finally {
      setLoading(false);
    }
  };

  if (collapsed) return null;

  const active = PROVIDERS.find((p) => p.value === provider);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <Zap className="w-3.5 h-3.5 text-gray-400" />
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">API Provider</p>
      </div>

      <div className="space-y-1.5">
        {PROVIDERS.map((p) => {
          const isActive = provider === p.value;
          return (
            <button
              key={p.value}
              disabled={loading}
              onClick={() => handleChange(p.value)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all
                ${isActive
                  ? `${p.accent} text-white shadow-sm`
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
                } disabled:opacity-60`}
            >
              <div className="text-left">
                <p className="font-semibold leading-none">{p.label}</p>
                <p className={`text-[10px] mt-0.5 ${isActive ? "text-white/70" : "text-gray-400"}`}>{p.sub}</p>
              </div>
              {loading && isActive && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isActive && !loading && <span className="text-[10px] font-bold opacity-80">Active</span>}
            </button>
          );
        })}
      </div>

      {/* Inline toast */}
      {toast && (
        <p className={`text-xs font-medium mt-2 px-1 ${toast.ok ? "text-emerald-600" : "text-red-500"}`}>
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </p>
      )}
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export default function AdminSidebar() {
  const [open, setOpen]         = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleLogout = () => {
    localStorage.clear();
    ["authToken", "user"].forEach((k) => {
      document.cookie = `${k}=; path=/; max-age=0`;
    });
    window.dispatchEvent(new Event("userAuthChanged"));
    router.push("/login");
    setOpen(false);
  };

  const isActive = (href: string) =>
    href === "/dashboard/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* ── Mobile hamburger ─────────────────────────────────────────────── */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-md border border-gray-100 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen bg-white border-r border-gray-100 z-50 md:z-auto flex flex-col shadow-xl md:shadow-none transition-all duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        {/* ── Brand ──────────────────────────────────────────────────────── */}
        <div className={`flex items-center border-b border-gray-100 shrink-0 h-[61px] px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <Link href="/dashboard/admin" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 leading-none">Admin Panel</p>
                <p className="text-[10px] text-gray-400 mt-0.5">DataBundleSite</p>
              </div>
            </Link>
          )}

          <div className="flex items-center gap-1">
            {/* Collapse toggle — desktop only */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
            </button>

            {/* Close — mobile only */}
            <button
              onClick={() => setOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Nav ────────────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {!collapsed && (
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">
              Navigation
            </p>
          )}

          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ title, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    title={collapsed ? title : undefined}
                    className={`group flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                      ${collapsed ? "justify-center" : ""}
                      ${active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
                    {!collapsed && <span className="flex-1">{title}</span>}
                    {!collapsed && active && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Provider toggle */}
          <ProviderToggle collapsed={collapsed} />
        </nav>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="px-3 py-3 border-t border-gray-100 shrink-0 space-y-0.5">
          <Link
            href="/"
            title={collapsed ? "Back to Home" : undefined}
            className={`group flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all
              ${collapsed ? "justify-center" : ""}`}
          >
            <Home className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-gray-600" />
            {!collapsed && <span>Back to Home</span>}
          </Link>

          <button
            onClick={handleLogout}
            title={collapsed ? "Log out" : undefined}
            className={`group flex items-center gap-3 w-full px-2.5 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all
              ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-red-500 transition-colors" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}