"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email address.");
      setMessageType("error");
      return;
    }

    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Failed to send reset email");
      }

      setMessage(
        "If an account exists with this email, a reset link has been sent."
      );
      setMessageType("success");

    } catch (error: any) {
      setMessage(error.message || "Something went wrong. Please try again.");
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
            <Mail className="text-blue-600 w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold mt-4">
            Forgot Password
          </h1>

          <p className="text-sm text-slate-600 mt-2">
            Enter your email address and we’ll send you a reset link
          </p>

        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="text-sm font-semibold flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-blue-600" />
              Email Address
            </label>

            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || messageType === "success"}
              required
            />
          </div>

          <Button
            disabled={loading || messageType === "success"}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Sending Reset Link..." : "Send Reset Link"}
          </Button>

        </form>

        {/* Message */}
        {message && (
          <div
            className={`mt-5 p-4 rounded-lg flex items-center gap-2 text-sm ${messageType === "success"
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
            onClick={() => router.push("/login")}
          >
            Back to Login
          </button>
        </div>

      </div>
    </section>
  );
}