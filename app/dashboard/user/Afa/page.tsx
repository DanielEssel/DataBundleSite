"use client";

import React, { useMemo, useState } from "react";
import {
  Clock, Package, ShieldCheck, Star, Phone,
  CheckCircle2, MapPin, User, CreditCard, Loader2,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

// ─── Constants ────────────────────────────────────────────────────────────────

const FEE_GHS = 16.0;

const REGIONS = [
  "Greater Accra", "Ashanti", "Central", "Eastern",
  "Western", "Western North", "Volta", "Oti",
  "Northern", "Savannah", "North East", "Upper East",
  "Upper West", "Bono", "Bono East", "Ahafo",
];

const OCCUPATIONS = ["Farmer", "Trader", "Student", "Driver", "Teacher", "Nurse", "Other"];

const WHATSAPP_SUPPORT_NUMBER = "233555168047";
const WHATSAPP_CHANNEL_LINK   = "https://chat.whatsapp.com/FWGf9yOAMFlG9102qPIha3";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  fullName:   string;
  dob:        string;
  phone:      string;
  ghanaCard:  string;
  region:     string;
  occupation: string;
  town:       string;
};

const initialState: FormState = {
  fullName: "", dob: "", phone: "", ghanaCard: "",
  region: "", occupation: "Farmer", town: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizePhone  = (v: string) => v.replace(/[^\d+]/g, "").trim();
const isValidGhanaCard = (v: string) => /^GHA-\d{9}-\d$/i.test(v.trim());

// ─── Shared field components ──────────────────────────────────────────────────

function Field({
  label,
  icon,
  error,
  helper,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </label>
      {children}
      {helper && !error && <p className="text-xs text-gray-400">{helper}</p>}
      {error  && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

const inputCls = (hasError?: boolean) =>
  `w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border rounded-xl outline-none transition-all
  placeholder:text-gray-300
  ${hasError
    ? "border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-400"
    : "border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
  }`;

// ─── Benefit card ─────────────────────────────────────────────────────────────

function BenefitCard({
  icon,
  title,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-4 ${accent}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <p className="text-sm font-bold text-gray-900">{title}</p>
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AfaRegistrationPage() {
  const [form, setForm]           = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [toast, setToast]           = useState<{ type: "success" | "error"; message: string } | null>(null);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const errors = useMemo(() => {
    const e = {} as Record<keyof FormState, string>;

    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.dob)             e.dob      = "Date of birth is required";

    const digits = normalizePhone(form.phone).replace(/\D/g, "");
    const okPhone = (digits.startsWith("0") && digits.length === 10) ||
                    (digits.startsWith("233") && digits.length === 12);

    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!okPhone)      e.phone = "Enter a valid Ghana number (e.g. 0241234567)";

    if (!form.ghanaCard.trim())          e.ghanaCard = "Ghana Card ID is required";
    else if (!isValidGhanaCard(form.ghanaCard)) e.ghanaCard = "Format should be GHA-XXXXXXXXX-X";

    if (!form.region)          e.region     = "Please select your region";
    if (!form.occupation)      e.occupation = "Please select an occupation";
    if (!form.town.trim())     e.town       = "Town / City is required";

    return e;
  }, [form]);

  const hasErrors = Object.values(errors).some(Boolean);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) { showToast("Please fix the highlighted fields.", "error"); return; }

    setSubmitting(true);
    try {
      // Replace with real endpoint:
      // const res = await fetch(`${API_BASE}/api/afa/register`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ ...form, fee: FEE_GHS }),
      // });
      // if (!res.ok) throw new Error((await res.json())?.message || "Registration failed");

      await new Promise((r) => setTimeout(r, 900));
      setSubmitted(true);
      showToast("Registration submitted successfully!");
      setForm(initialState);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm max-w-sm w-full p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">Registration submitted!</p>
            <p className="text-sm text-gray-500 mt-1">
              We've received your AFA registration. You'll be notified once it's confirmed.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <FaWhatsapp className="w-4 h-4" /> Contact support
            </a>
            <button
              onClick={() => setSubmitted(false)}
              className="text-sm text-blue-600 hover:underline underline-offset-2 font-medium"
            >
              Submit another registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-6">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">AFA Registration</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Complete all fields to register for the AFA bundle package
          </p>
        </div>

        {/* ── Fee + security row ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
            <div className="p-2 bg-blue-50 rounded-xl shrink-0">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Registration fee</p>
              <p className="text-base font-bold text-gray-900">GHS {FEE_GHS.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
            <div className="p-2 bg-emerald-50 rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Your data is secure</p>
              <p className="text-sm font-semibold text-gray-700">Used only for registration</p>
            </div>
          </div>
        </div>

        {/* ── Registration form ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Personal Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">All fields are required</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

            {/* Personal info */}
            <section className="space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Personal Information
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full name" icon={<User className="w-3.5 h-3.5" />} error={errors.fullName}>
                  <input
                    placeholder="e.g. Kwame Mensah"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    className={inputCls(!!errors.fullName)}
                  />
                </Field>

                <Field label="Date of birth" error={errors.dob} helper="Day / Month / Year">
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => set("dob", e.target.value)}
                    className={inputCls(!!errors.dob)}
                  />
                </Field>
              </div>
            </section>

            {/* Contact */}
            <section className="space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contact
              </p>
              <Field label="Phone number" icon={<Phone className="w-3.5 h-3.5" />} error={errors.phone}>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="e.g. 0241234567"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputCls(!!errors.phone)}
                />
              </Field>
            </section>

            {/* Identification */}
            <section className="space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Identification
              </p>
              <Field
                label="Ghana Card ID"
                icon={<CreditCard className="w-3.5 h-3.5" />}
                error={errors.ghanaCard}
                helper="Format: GHA-XXXXXXXXX-X"
              >
                <input
                  placeholder="GHA-123456789-0"
                  value={form.ghanaCard}
                  onChange={(e) => set("ghanaCard", e.target.value.toUpperCase())}
                  className={inputCls(!!errors.ghanaCard)}
                  maxLength={15}
                />
              </Field>
            </section>

            {/* Location & occupation */}
            <section className="space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Location &amp; Occupation
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Region" icon={<MapPin className="w-3.5 h-3.5" />} error={errors.region}>
                  <select
                    value={form.region}
                    onChange={(e) => set("region", e.target.value)}
                    className={inputCls(!!errors.region)}
                  >
                    <option value="">Select region…</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>

                <Field label="Occupation" error={errors.occupation}>
                  <select
                    value={form.occupation}
                    onChange={(e) => set("occupation", e.target.value)}
                    className={inputCls(!!errors.occupation)}
                  >
                    {OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Town / City" icon={<MapPin className="w-3.5 h-3.5" />} error={errors.town}>
                    <input
                      placeholder="e.g. Adabraka, Accra"
                      value={form.town}
                      onChange={(e) => set("town", e.target.value)}
                      className={inputCls(!!errors.town)}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gray-100">
              {hasErrors && (
                <p className="text-xs text-red-500 font-medium">
                  Fill all required fields to continue
                </p>
              )}
              <div className="sm:ml-auto">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Submit Registration
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ── Benefits ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-semibold text-gray-900">Lifetime benefits await</h3>
          </div>

          <BenefitCard
            icon={<Phone className="w-4 h-4 text-blue-600" />}
            title="Monthly Benefits"
            accent="bg-blue-50 border-blue-100"
          >
            <ul className="space-y-1">
              {["250 mins onnet calls", "30 mins offnet calls", "500 mins CUG calls", "25 SMS messages"].map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </BenefitCard>

          <BenefitCard
            icon={<Star className="w-4 h-4 text-amber-500" />}
            title="Exclusive Perks"
            accent="bg-amber-50 border-amber-100"
          >
            <ul className="space-y-1">
              {["One-time lifetime registration", "Unlimited calls with AFA members", "Renew via *1848#"].map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </BenefitCard>

          <BenefitCard
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            title="How to Activate"
            accent="bg-emerald-50 border-emerald-100"
          >
            <ol className="space-y-1">
              {[
                "Dial *1848#",
                "Select: Buy AFA Bundle",
                "Choose your offer",
                "Confirm & enter MoMo PIN",
                "Get SMS confirmation",
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </BenefitCard>
        </div>

        {/* ── Support ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Need help?</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <FaWhatsapp className="w-4 h-4" />
              Contact Support
            </a>
            <a
              href={WHATSAPP_CHANNEL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <FaWhatsapp className="w-4 h-4 text-green-500" />
              Join Channel
            </a>
          </div>
        </div>
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-in fade-in slide-in-from-bottom-4 duration-300 z-50 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}