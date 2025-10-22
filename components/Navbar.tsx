"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, User, LogOut, Settings, ShoppingBag, ChevronDown } from "lucide-react";
import Image from "next/image";

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setIsLoggedIn(true);
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setProfileOpen(false);
    router.push("/");
  };

  const getInitials = () => {
    if (!user) return "U";
    const firstInitial = user.firstName?.charAt(0).toUpperCase() || "";
    const lastInitial = user.lastName?.charAt(0).toUpperCase() || "";
    return firstInitial + lastInitial || "U";
  };

  const getFullName = () => {
    if (!user) return "User";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-40 h-12 md:w-48 md:h-14">
            <Image
              src="/logos/acdatalogo.png"
              alt="AcDataHub logo"
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <Link 
            href="/" 
            className="hover:text-blue-600 transition-colors duration-200 relative group"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full" />
          </Link>
          <Link 
            href="/how-it-works" 
            className="hover:text-blue-600 transition-colors duration-200 relative group"
          >
            How It Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full" />
          </Link>
          <Link 
            href="/bundles" 
            className="hover:text-blue-600 transition-colors duration-200 relative group"
          >
            Data Bundles
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full" />
          </Link>
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-slate-50 transition-colors duration-200 group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {getInitials()}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {user?.firstName || "User"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 animate-slideDown">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-gray-800">{getFullName()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 transition-colors duration-150"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 transition-colors duration-150"
                    >
                      <ShoppingBag className="w-4 h-4 text-gray-500" />
                      My Orders
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 transition-colors duration-150"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      Settings
                    </Link>
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
          <nav className="flex flex-col px-6 py-4 space-y-1">
            {/* User Info (Mobile) */}
            {isLoggedIn && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
                  {getInitials()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{getFullName()}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            )}

            <Link 
              href="/" 
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 text-gray-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/how-it-works" 
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 text-gray-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              How It Works
            </Link>
            <Link 
              href="/bundles" 
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 text-gray-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Data Bundles
            </Link>

            {isLoggedIn ? (
              <>
                <div className="border-t border-slate-100 my-2" />
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  My Orders
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
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
    </header>
  );
}