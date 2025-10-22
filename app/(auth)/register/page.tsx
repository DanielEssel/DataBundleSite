"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Lock,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  User,
  Phone,
} from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [isFocused, setIsFocused] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    password: false,
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFocus = (field: string) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.status === 201) {
        setMessage(data.message || "Registration successful! Redirecting...");
        setMessageType("success");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error: any) {
      setMessage(error.message || "Something went wrong");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 bg-grid-slate-200/[0.4] bg-[size:40px_40px]" />
      <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-indigo-200/20 to-pink-200/20 rounded-full blur-3xl" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
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
        className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-500/10 rounded-2xl relative z-10 p-8 sm:p-10"
      >
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
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
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mt-4">
            Create Account 🚀
          </h1>
          <p className="text-slate-600 text-sm mt-2 font-medium">
            Join us and start your journey today
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Fields */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <User className="w-3 h-3 text-blue-600" />
                First Name
              </label>
              <div className="relative">
                <Input
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={form.firstName}
                  onChange={handleChange}
                  onFocus={() => handleFocus("firstName")}
                  onBlur={() => handleBlur("firstName")}
                  required
                  disabled={loading}
                  className={`pl-10 pr-4 py-2.5 text-base transition-all duration-200 ${
                    isFocused.firstName
                      ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg"
                      : "border-slate-200 hover:border-slate-300"
                  } rounded-xl bg-white/50 backdrop-blur-sm`}
                />
                <User
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                    isFocused.firstName ? "text-blue-600" : "text-slate-400"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <User className="w-3 h-3 text-blue-600" />
                Last Name
              </label>
              <div className="relative">
                <Input
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={handleChange}
                  onFocus={() => handleFocus("lastName")}
                  onBlur={() => handleBlur("lastName")}
                  required
                  disabled={loading}
                  className={`pl-10 pr-4 py-2.5 text-base transition-all duration-200 ${
                    isFocused.lastName
                      ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg"
                      : "border-slate-200 hover:border-slate-300"
                  } rounded-xl bg-white/50 backdrop-blur-sm`}
                />
                <User
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                    isFocused.lastName ? "text-blue-600" : "text-slate-400"
                  }`}
                />
              </div>
            </div>
          </motion.div>

          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Email Address
            </label>
            <div className="relative">
              <Input
                name="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                onFocus={() => handleFocus("email")}
                onBlur={() => handleBlur("email")}
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

          {/* Phone Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              Phone Number
            </label>
            <div className="relative">
              <Input
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={handleChange}
                onFocus={() => handleFocus("phone")}
                onBlur={() => handleBlur("phone")}
                required
                disabled={loading}
                className={`pl-11 pr-4 py-3 text-base transition-all duration-200 ${
                  isFocused.phone
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg"
                    : "border-slate-200 hover:border-slate-300"
                } rounded-xl bg-white/50 backdrop-blur-sm`}
              />
              <Phone
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  isFocused.phone ? "text-blue-600" : "text-slate-400"
                }`}
              />
            </div>
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              Password
            </label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
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

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
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
              className={`mt-6 flex items-start gap-3 p-4 rounded-xl border ${
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
          transition={{ delay: 0.5 }}
          className="mt-8 text-center space-y-4"
        >
          <div className="text-sm text-slate-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
            >
              Sign In
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