"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          AcDataHub
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-10 text-gray-700 font-medium">
          <Link href="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link href="#features" className="hover:text-blue-600 transition">
            Features
          </Link>
          <Link href="/how-it-works" className="hover:text-blue-600 transition">
            How It Works
          </Link>
          <Link href="/bundles" className="hover:text-blue-600 transition">
            Bundles
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/login"
            className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-sm">
          <nav className="flex flex-col items-center space-y-4 py-6">
            <Link href="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="#features" onClick={() => setMenuOpen(false)}>
              Features
            </Link>
            <Link href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How It Works
            </Link>
            <Link href="/bundles" onClick={() => setMenuOpen(false)}>
              Bundles
            </Link>

            <div className="flex space-x-4 pt-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 border rounded-full hover:border-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
