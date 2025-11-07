"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

type MessageType = "success" | "error" | "";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("");

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) router.replace("/dashboard/user");
  }, [router]);

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Login failed");

      const token = data?.user?.token;
      const userData = data?.user?.user || {};

      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setMessage("Login successful! Redirecting...");
        setMessageType("success");

        setTimeout(() => router.replace("/dashboard/user"), 1000);
      }
    } catch (error: any) {
      setMessage(error.message || "An unexpected error occurred");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md mx-4 bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-8"
      >
        {/* Logo + Title */}
        <div className="text-center mb-6">
          <Image src="/logos/acdatalogo.png" alt="AcDataHub logo" width={80} height={80} className="mx-auto rounded-xl shadow-lg" priority />
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Welcome Back 👋</h1>
          <p className="text-slate-600 text-sm mt-2 font-medium">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" /> Email Address
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={loading}
                required
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" /> Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                disabled={loading}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading || !email || !password} className="w-full py-3 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`mt-4 p-4 rounded-xl border ${messageType === "success" ? "bg-green-50 border-green-300 text-green-700" : "bg-red-50 border-red-300 text-red-700"}`}>
              {messageType === "success" ? <CheckCircle className="inline w-5 h-5 mr-2" /> : <AlertCircle className="inline w-5 h-5 mr-2" />}
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account? <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">Join Us</a>
        </div>
      </motion.div>
    </section>
  );
}
