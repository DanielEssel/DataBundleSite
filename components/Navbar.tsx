"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  ShoppingBag,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import Image from "next/image";

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isLoggedIn = Boolean(user);

  // Load user from localStorage on mount and listen for storage changes
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Failed to parse user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Load initially
    loadUser();

    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener("storage", loadUser);
    
    // Custom event for same-tab login/logout
    window.addEventListener("userAuthChanged", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("userAuthChanged", loadUser);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setProfileOpen(false);
    setMenuOpen(false);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new Event("userAuthChanged"));
    
    router.push("/");
  };

  const getInitials = () => {
    if (!user) return "U";
    const first = user.firstName?.charAt(0).toUpperCase() || "";
    const last = user.lastName?.charAt(0).toUpperCase() || "";
    return first + last || "U";
  };

  const getFullName = () => {
    if (!user) return "User";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Data Bundles", href: "/bundles" },
  ];

  const profileLinks = [
    { 
      name: "Dashboard", 
      href: "/dashboard/user", 
      icon: <LayoutDashboard className="w-4 h-4 text-blue-500" /> 
    },
    { 
      name: "My Orders", 
      href: "/dashboard/user/orders", 
      icon: <ShoppingBag className="w-4 h-4 text-gray-500" /> 
    },
    { 
      name: "My Profile", 
      href: "/dashboard/user/profile", 
      icon: <User className="w-4 h-4 text-gray-500" /> 
    },
    { 
      name: "Settings", 
      href: "/settings", 
      icon: <Settings className="w-4 h-4 text-gray-500" /> 
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-32 h-10 sm:w-40 sm:h-12 md:w-48 md:h-14">
            <Image
              src="/logos/acdatalogo.png"
              alt="AcDataHub logo"
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`hover:text-blue-600 transition-colors duration-200 relative group ${
                pathname === link.href ? "text-blue-600" : ""
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-blue-600 transition-all duration-200 ${
                pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
              }`} />
            </Link>
          ))}
        </nav>

        {/* Desktop Auth/Profile */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-slate-50 transition-colors duration-200 group"
              >
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {getInitials()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {user?.firstName || "User"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 animate-slideDown">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-gray-800">{getFullName()}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{user?.email}</p>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    {profileLinks.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 transition-colors duration-150"
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Get In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                Join Us
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-700 hover:bg-slate-50 rounded-lg transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg animate-slideDown">
          <nav className="flex flex-col px-4 sm:px-6 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* User Info */}
            {isLoggedIn && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-50 rounded-lg">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="avatar"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
                    {getInitials()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{getFullName()}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg transition-colors ${
                  pathname === link.href 
                    ? "bg-blue-50 text-blue-600 font-medium" 
                    : "text-gray-700 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Profile / Auth Links */}
            {isLoggedIn ? (
              <>
                <div className="border-t border-slate-100 my-2" />
                {profileLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left w-full mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 mt-2">
                <Link
                  href="/login"
                  className="px-4 py-2.5 text-center border border-slate-200 rounded-full hover:border-blue-600 hover:text-blue-600 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Get In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2.5 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  Join Us
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}