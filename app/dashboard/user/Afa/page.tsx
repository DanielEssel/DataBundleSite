
"use client";

import React, { useMemo, useState } from "react";
import { Clock, Package, ShieldCheck, Star, Phone, CheckCircle2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const FEE_GHS = 11.0;

const REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Central",
  "Eastern",
  "Western",
  "Western North",
  "Volta",
  "Oti",
  "Northern",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
];

const OCCUPATIONS = ["Farmer", "Trader", "Student", "Driver", "Teacher", "Nurse", "Other"];

const WHATSAPP_SUPPORT_NUMBER = "233555168047";
const WHATSAPP_CHANNEL_LINK = "https://chat.whatsapp.com/FWGf9yOAMFlG9102qPIha3";

type FormState = {
  fullName: string;
  dob: string; // yyyy-mm-dd
  phone: string;
  ghanaCard: string; // GHA-XXXXXXXXX-X
  region: string;
  occupation: string;
  town: string; // e.g., Adabraka, Accra
};

const initialState: FormState = {
  fullName: "",
  dob: "",
  phone: "",
  ghanaCard: "",
  region: "",
  occupation: "Farmer",
  town: "",
};

const normalizePhone = (v: string) => v.replace(/[^\d+]/g, "").trim();
const isValidGhanaCard = (v: string) => /^GHA-\d{9}-\d$/i.test(v.trim());
const formatGhanaCardHint = "Format: GHA-XXXXXXXXX-X (13 characters)";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-semibold text-gray-700">{children}</label>;
}

function Helper({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-500 mt-1">{children}</p>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white ${props.className || ""}`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white ${props.className || ""}`}
    />
  );
}

export default function AfaRegistrationPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const errors = useMemo(() => {
    const e: Record<keyof FormState, string> = {
      fullName: "",
      dob: "",
      phone: "",
      ghanaCard: "",
      region: "",
      occupation: "",
      town: "",
    };

    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.dob) e.dob = "Date of birth is required";

    const phone = normalizePhone(form.phone);
    const digits = phone.replace(/\D/g, "");
    const okPhone =
      (digits.startsWith("0") && digits.length === 10) ||
      (digits.startsWith("233") && digits.length === 12);

    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!okPhone) e.phone = "Enter a valid Ghana phone number (e.g., 0241234567)";

    if (!form.ghanaCard.trim()) e.ghanaCard = "Ghana Card ID is required";
    else if (!isValidGhanaCard(form.ghanaCard)) e.ghanaCard = "Ghana Card ID format is invalid";

    if (!form.region) e.region = "Please select your region";
    if (!form.occupation) e.occupation = "Please select occupation";
    if (!form.town.trim()) e.town = "Town/City is required";

    return e;
  }, [form]);

  const hasErrors = Object.values(errors).some(Boolean);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  // Stub submit — wire to your backend later
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) {
      showToast("Please fix the highlighted fields.", "error");
      return;
    }

    setSubmitting(true);
    try {
      // Replace with your real endpoint when ready:
      // const res = await fetch(`${API_BASE}/api/afa/register`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ ...form, fee: FEE_GHS }),
      // });
      // if (!res.ok) throw new Error((await res.json())?.message || "Registration failed");

      await new Promise((r) => setTimeout(r, 700)); // demo delay
      showToast("Registration submitted successfully!");
      setForm(initialState);
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || "Registration failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">AFA Package</h1>
          <p className="text-sm text-gray-600">
            Registration Form — <span className="font-semibold">Complete all fields</span> to register for the AFA bundle.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Registration Fee</p>
              <p className="text-sm font-bold text-gray-900">You need GHS {FEE_GHS.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* FORM (TOP) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-lg font-bold text-gray-900">Registration Form</h2>
            <p className="text-sm text-gray-600">Your information is secure and will only be used for registration.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    placeholder="e.g., Kwame Mensah"
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  />
                  {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
                  />
                  <Helper>mm/dd/yyyy</Helper>
                  {errors.dob && <p className="text-xs text-red-600 mt-1">{errors.dob}</p>}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Contact Information</h3>
              <div>
                <Label>Phone Number</Label>
                <Input
                  placeholder="e.g., 0241234567"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Identification */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Identification</h3>
              <div>
                <Label>Ghana Card ID</Label>
                <Input
                  placeholder="GHA-123456789-0"
                  value={form.ghanaCard}
                  onChange={(e) => setForm((p) => ({ ...p, ghanaCard: e.target.value.toUpperCase() }))}
                />
                <Helper>{formatGhanaCardHint}</Helper>
                {errors.ghanaCard && <p className="text-xs text-red-600 mt-1">{errors.ghanaCard}</p>}
              </div>
            </div>

            {/* Location & Occupation */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Location &amp; Occupation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Region</Label>
                  <Select
                    value={form.region}
                    onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
                  >
                    <option value="">Select your region</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                  {errors.region && <p className="text-xs text-red-600 mt-1">{errors.region}</p>}
                </div>

                <div>
                  <Label>Occupation</Label>
                  <Select
                    value={form.occupation}
                    onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))}
                  >
                    {OCCUPATIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                  {errors.occupation && <p className="text-xs text-red-600 mt-1">{errors.occupation}</p>}
                </div>

                <div className="md:col-span-2">
                  <Label>Town / City</Label>
                  <Input
                    placeholder="e.g., Adabraka, Accra"
                    value={form.town}
                    onChange={(e) => setForm((p) => ({ ...p, town: e.target.value }))}
                  />
                  {errors.town && <p className="text-xs text-red-600 mt-1">{errors.town}</p>}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Your information is secure and will only be used for registration
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Submit Registration
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* INFO (DOWN / BELOW FORM) */}
        <div className="mt-6 space-y-6">
          {/* Lifetime benefits */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-gray-900">Lifetime benefits await</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <p className="font-bold text-gray-900">Monthly Benefits</p>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 250 mins onnet calls</li>
                  <li>• 30 mins offnet calls</li>
                  <li>• 500 mins CUG calls</li>
                  <li>• 25 SMS messages</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <p className="font-bold text-gray-900">Exclusive Perks</p>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• One-time lifetime registration</li>
                  <li>• Unlimited calls with AFA members</li>
                  <li>• Renew via *1848#</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="font-bold text-gray-900 mb-2">How to Activate</p>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal pl-5">
                  <li>Dial *1848#</li>
                  <li>Select: Buy AFA Bundle</li>
                  <li>Choose your offer</li>
                  <li>Confirm &amp; enter MoMo PIN</li>
                  <li>Get SMS confirmation</li>
                </ol>
              </div>
            </div>
          </div>

          {/* WhatsApp / Support */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm text-gray-600 mb-3">Need help?</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold"
              >
                <FaWhatsapp className="w-5 h-5" />
                Contact Support
              </a>

              <a
                href={WHATSAPP_CHANNEL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-3 rounded-lg font-semibold"
              >
                Join WhatsApp Channel
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <p className="flex items-center gap-2">
            {toast.type === "success" ? "✓" : "✕"} {toast.message}
          </p>
        </div>
      )}
    </div>
  );
}