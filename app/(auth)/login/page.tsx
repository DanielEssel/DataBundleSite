"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [isFocused, setIsFocused] = useState({ email: false, password: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || data.message || "Login failed");

      const token = data?.user?.token;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(data?.user?.user || {}));
        setMessage("Login successful! Redirecting...");
        setMessageType("success");
        setTimeout(() => (window.location.href = "/bundles"), 1500);
      }
    } catch (error: any) {
      setMessage(error.message || "An unexpected error occurred");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="h-screen w-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 bg-grid-slate-200/[0.4] bg-[size:40px_40px]" />
      <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-indigo-200/20 to-pink-200/20 rounded-full blur-3xl" />

      {/* Floating particles - contained within viewport */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-300/30 rounded-full"
            initial={{ y: 0, x: Math.random() * 100 }}
            animate={{
              y: [0, -100, 0],
              x: [Math.random() * 100, Math.random() * 100 + 50],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md mx-4 bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-500/10 rounded-2xl relative z-10 p-8"
      >
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <div className="relative inline-flex">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/logos/acdatalogo.png"
                alt="AcDataHub logo"
                width={80}
                height={80}
                className="mx-auto rounded-xl shadow-lg"
                priority
              />
            </motion.div>
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mt-4">
            Welcome Back 👋
          </h1>
          <p className="text-slate-600 text-sm mt-2 font-medium">
            Sign in to access your dashboard
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Email Address
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() =>
                  setIsFocused((prev) => ({ ...prev, email: true }))
                }
                onBlur={() =>
                  setIsFocused((prev) => ({ ...prev, email: false }))
                }
                required
                disabled={loading}
                className={`pl-11 pr-4 py-3 text-base transition-all duration-200 ${
                  isFocused.email
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg"
                    : "border-slate-200 hover:border-slate-300"
                } rounded-xl bg-white/50 backdrop-blur-sm`}
              />
              <Mail
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  isFocused.email ? "text-blue-600" : "text-slate-400"
                }`}
              />
            </div>
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() =>
                  setIsFocused((prev) => ({ ...prev, password: true }))
                }
                onBlur={() =>
                  setIsFocused((prev) => ({ ...prev, password: false }))
                }
                required
                disabled={loading}
                className={`pl-11 pr-12 py-3 text-base transition-all duration-200 ${
                  isFocused.password
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg"
                    : "border-slate-200 hover:border-slate-300"
                } rounded-xl bg-white/50 backdrop-blur-sm`}
              />
              <Lock
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  isFocused.password ? "text-blue-600" : "text-slate-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Forgot Password */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-right"
          >
            <a
              href="/forgot-password"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
            >
              Forgot password?
              <ArrowRight className="w-3 h-3" />
            </a>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </div>
              )}
            </Button>
          </motion.div>
        </form>

        {/* Alert Messages */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`mt-4 flex items-start gap-3 p-4 rounded-xl border ${
                messageType === "success"
                  ? "bg-green-50/80 border-green-200 shadow-green-500/10"
                  : "bg-red-50/80 border-red-200 shadow-red-500/10"
              } backdrop-blur-sm`}
            >
              {messageType === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <p
                className={`text-sm font-medium ${
                  messageType === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center space-y-3"
        >
          <div className="text-sm text-slate-600">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
            >
              Join Us
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-3 h-3" />
            <span>Your data is encrypted & secure</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
