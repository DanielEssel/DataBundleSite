"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Lock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();

  // ✅ FIX: Correct token extraction
  const token = Array.isArray(params?.token)
    ? params.token[0]
    : params?.token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  // Password strength helper
  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { label: "Weak", color: "bg-red-500" };
    if (password.length < 10) return { label: "Medium", color: "bg-yellow-500" };
    return { label: "Strong", color: "bg-green-500" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔍 Debug
    console.log("TOKEN:", token);

    if (!token) {
      setMessage("Invalid or missing reset token.");
      setMessageType("error");
      return;
    }

    if (!password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      setMessageType("error");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // ✅ FIX: Use newPassword to match backend
          body: JSON.stringify({
            token,
            newPassword: password,
          }),
        }
      );

      const data = await res.json();

      console.log("STATUS:", res.status);
      console.log("RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data?.message || "Reset failed");
      }

      setMessage("Password reset successful! Redirecting to login...");
      setMessageType("success");

      setTimeout(() => {
        router.replace("/auth/login");
      }, 2000);
    } catch (error: any) {
      setMessage(error.message || "An error occurred");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border shadow-2xl rounded-2xl p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto flex items-center justify-center bg-blue-100 rounded-full">
            <Lock className="text-blue-600 w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold mt-4">Reset Password</h1>
          <p className="text-sm text-slate-600 mt-2">
            Enter a new password for your account
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Password */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-blue-600" />
              New Password
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
                className="absolute right-3 top-2.5 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {password && (
              <div className="mt-2">
                <div className="h-2 w-full bg-gray-200 rounded">
                  <div
                    className={`h-2 rounded ${strength.color}`}
                    style={{
                      width:
                        password.length < 6
                          ? "30%"
                          : password.length < 10
                          ? "60%"
                          : "100%",
                    }}
                  />
                </div>
                <p className="text-xs mt-1 text-gray-500">
                  Password strength: {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-blue-600" />
              Confirm Password
            </label>

            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Submit */}
          <Button disabled={loading} className="w-full flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>

        {/* Message */}
        {message && (
          <div
            className={`mt-5 p-4 rounded-lg flex items-center gap-2 text-sm ${
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
          </div>
        )}

        {/* Back */}
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm"
            onClick={() => router.push("/auth/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    </section>
  );
}