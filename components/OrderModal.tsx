"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Phone,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ExternalLink,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderModalProps {
  bundleId: string;
  bundleName: string;
  price: number;
  isOpen: boolean;
  onClose: () => void;
}

type Step = "form" | "success" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isValidPhone = (phone: string) =>
  /^(\+233|0)[0-9]{9}$/.test(phone.trim());

/** Format a raw number as user types: insert spaces for readability */
const formatPhoneDisplay = (raw: string) => {
  // Strip everything except digits and leading +
  const cleaned = raw.replace(/(?!^\+)[^\d]/g, "");
  return cleaned;
};

// ─── Step screens ─────────────────────────────────────────────────────────────

function SuccessScreen({ paymentUrl }: { paymentUrl: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center space-y-5">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full animate-ping opacity-60" />
      </div>
      <div>
        <p className="text-base font-bold text-gray-900">Order placed!</p>
        <p className="text-sm text-gray-500 mt-1">Redirecting you to Paystack to complete payment…</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
        <Loader2 className="w-3 h-3 animate-spin" />
        Taking you to payment
      </div>
      <a
        href={paymentUrl}
        className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline underline-offset-2 font-medium"
      >
        <ExternalLink className="w-3 h-3" />
        Click here if not redirected
      </a>
    </div>
  );
}

function ErrorScreen({
  message,
  onRetry,
  onClose,
}: {
  message: string;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <p className="text-base font-bold text-gray-900">Something went wrong</p>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{message}</p>
      </div>
      <div className="flex gap-3 w-full">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold"
        >
          Cancel
        </Button>
        <Button
          onClick={onRetry}
          className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrderModal({
  bundleId,
  bundleName,
  price,
  isOpen,
  onClose,
}: OrderModalProps) {
  const router = useRouter();

  const [step, setStep]                     = useState<Step>("form");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [loading, setLoading]               = useState(false);
  const [errorMsg, setErrorMsg]             = useState("");
  const [paymentUrl, setPaymentUrl]         = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setRecipientPhone("");
      setLoading(false);
      setErrorMsg("");
      setPaymentUrl("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const phoneValid = isValidPhone(recipientPhone);
  const canSubmit  = phoneValid && !loading;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientPhone(formatPhoneDisplay(e.target.value));
  };

  const handleOrder = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrorMsg("Please log in to continue.");
      setStep("error");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bundleId,
          recipientPhone: recipientPhone.trim(),
          paymentMethod: "momo",
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("authToken");
        setErrorMsg("Session expired. Please log in again.");
        setStep("error");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create order.");
      }

      const url = data.data?.payment?.authorizationUrl;
      if (!url) throw new Error("Missing payment URL from server.");

      setPaymentUrl(url);
      setStep("success");
      setTimeout(() => (window.location.href = url), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(msg);
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setStep("form");
    setErrorMsg("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={loading ? undefined : onClose}>
      <DialogContent className="p-0 w-[95vw] max-w-md mx-auto border-none shadow-2xl rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto">

        {/* Non-form steps — no header chrome needed */}
        {step === "success" && <SuccessScreen paymentUrl={paymentUrl} />}
        {step === "error"   && <ErrorScreen message={errorMsg} onRetry={handleRetry} onClose={onClose} />}

        {/* ── Form step ─────────────────────────────────────────────────── */}
        {step === "form" && (
          <>
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold text-gray-900">
                  Complete purchase
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  Enter the recipient number to proceed
                </p>
              </DialogHeader>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mt-4">
                {["Enter number", "Pay"].map((label, i) => {
                  const done   = i === 0 && phoneValid;
                  const active = (i === 0 && !phoneValid) || (i === 1 && phoneValid);
                  return (
                    <React.Fragment key={label}>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                          ${done    ? "bg-emerald-500 text-white"
                          : active  ? "bg-blue-600 text-white"
                          :           "bg-gray-100 text-gray-400"}`}>
                          {done ? "✓" : i + 1}
                        </div>
                        <span className={`text-[10px] font-medium hidden sm:block transition-colors
                          ${done ? "text-emerald-600" : active ? "text-blue-600" : "text-gray-400"}`}>
                          {label}
                        </span>
                      </div>
                      {i < 1 && <div className={`flex-1 h-px transition-colors ${done ? "bg-emerald-300" : "bg-gray-100"}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-5 space-y-4 bg-white">

              {/* Order summary */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                  <span className="text-xs font-medium text-gray-500">Bundle</span>
                  <span className="text-sm font-semibold text-gray-800 text-right max-w-[65%] leading-snug">
                    {bundleName}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-500">Total</span>
                  <span className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
                    ₵{price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Phone input */}
              <div className="space-y-2">
                <label
                  htmlFor="recipient-phone"
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide"
                >
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  Recipient phone number
                </label>
                <div className="relative">
                  <Input
                    id="recipient-phone"
                    ref={inputRef}
                    type="tel"
                    inputMode="numeric"
                    placeholder="0551234567"
                    value={recipientPhone}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    maxLength={13}
                    className={`pr-10 py-5 text-base font-medium tracking-wide rounded-xl border-2 transition-all outline-none
                      ${recipientPhone && !phoneValid
                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30"
                        : phoneValid
                          ? "border-emerald-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-emerald-50/30"
                          : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      }`}
                  />
                  {recipientPhone && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 transition-all">
                      {phoneValid
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        : <AlertCircle  className="w-5 h-5 text-red-400" />}
                    </span>
                  )}
                </div>
                <p className={`text-xs leading-relaxed transition-colors
                  ${recipientPhone && !phoneValid ? "text-red-500" : "text-gray-400"}`}>
                  {recipientPhone && !phoneValid
                    ? "Must be a valid Ghanaian number starting with 0 or +233"
                    : "Enter the number that should receive the data bundle"}
                </p>
              </div>


              {/* Important notice */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <span className="text-base leading-none mt-0.5">⚠️</span>
                <div>
                  <p className="text-xs font-bold text-amber-800">Important Notice</p>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    Make sure the number entered is correct. There will be{" "}
                    <span className="font-bold">no reversal or refund</span> after completing the transaction.
                  </p>
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                <p className="text-xs text-gray-500">
                  Secured by <span className="font-semibold text-gray-700">Paystack</span> · end-to-end encrypted
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  onClick={onClose}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 py-5 text-sm font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleOrder}
                  disabled={!canSubmit}
                  className="flex-1 py-5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Pay ₵{price.toFixed(2)}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>

              {/* Disabled pay button hint */}
              {!canSubmit && !loading && (
                <p className="text-center text-xs text-gray-400">
                  Enter a valid phone number to continue
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}