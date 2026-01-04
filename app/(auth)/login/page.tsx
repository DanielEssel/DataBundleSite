"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

type MessageType = "success" | "error" | "";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("");

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

      if (!res.ok) {
        throw new Error(data?.message || "Login failed");
      }

      const token = data?.user?.token;
      const userData = data?.user?.user;

      if (!token || !userData) {
        throw new Error("Invalid login response");
      }

      // ✅ Save to localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // ✅ Save to cookies (for middleware)
      document.cookie = `authToken=${token}; path=/; max-age=${
        60 * 60 * 24 * 7
      }; SameSite=Lax`;
      document.cookie = `user=${encodeURIComponent(
        JSON.stringify(userData)
      )}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      setMessage("Login successful! Redirecting...");
      setMessageType("success");

      const redirectPath =
        userData.role === "admin"
          ? "/dashboard/admin"
          : "/dashboard/user";

      setTimeout(() => {
        router.replace(redirectPath);
      }, 800);
    } catch (error: any) {
      setMessage(error.message || "An unexpected error occurred");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md mx-4 bg-white/90 backdrop-blur-xl border shadow-2xl rounded-2xl p-8"
      >
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <Image
            src="/logos/acdatalogo.png"
            alt="AcDataHub logo"
            width={80}
            height={80}
            className="mx-auto rounded-xl shadow-lg"
            priority
          />
          <h1 className="text-2xl font-bold mt-4">Welcome Back 👋</h1>
          <p className="text-sm text-slate-600 mt-2">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" /> Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" /> Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => router.push("/auth/forgot-password")}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <Button disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Register */}
          <div className="text-center text-sm text-slate-600">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="font-semibold text-blue-600 hover:underline"
            >
              Create one
            </button>
          </div>
        </form>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
                messageType === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
