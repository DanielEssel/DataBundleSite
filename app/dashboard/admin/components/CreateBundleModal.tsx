"use client";

import React, { useEffect, useRef } from "react";
import { X, Package, DollarSign, Wifi, Database, FileText, Tag } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NewBundle = {
  name: string;
  description: string;
  price: number;
  telcoCode: string;
  dataAmount: string;
  category: "regular" | "bigdata";
};

interface CreateBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  bundle: NewBundle;
  onBundleChange: (bundle: NewBundle) => void;
  mode?: "create" | "edit";
  loading?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TELCO_OPTIONS = [
  { value: "MTN",       label: "MTN",       color: "bg-yellow-400" },
  { value: "Vodafone",  label: "Vodafone",  color: "bg-red-500"    },
  { value: "AirtelTigo",label: "AirtelTigo",color: "bg-orange-500" },
  { value: "Telecel",   label: "Telecel",   color: "bg-blue-500"   },
];

const CATEGORY_OPTIONS: { value: "regular" | "bigdata"; label: string; description: string }[] = [
  { value: "regular", label: "Regular",  description: "Standard daily/weekly bundles" },
  { value: "bigdata", label: "Big Data", description: "High-volume monthly plans"     },
];

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = (hasError?: boolean) =>
  `w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border rounded-xl outline-none transition-all
  placeholder:text-gray-300
  ${hasError
    ? "border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-400"
    : "border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 hover:border-gray-300"
  }`;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CreateBundleModal({
  isOpen,
  onClose,
  onSubmit,
  bundle,
  onBundleChange,
  mode = "create",
  loading = false,
}: CreateBundleModalProps) {
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first field on open
  useEffect(() => {
    if (isOpen) setTimeout(() => firstInputRef.current?.focus(), 80);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, loading, onClose]);

  const isFormValid =
    bundle.name.trim() &&
    bundle.description.trim() &&
    bundle.dataAmount.trim() &&
    bundle.telcoCode &&
    bundle.price > 0;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="bundle-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 id="bundle-modal-title" className="text-base font-semibold text-gray-900">
                {mode === "edit" ? "Edit bundle" : "Create bundle"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {mode === "edit" ? "Update bundle details" : "Add a new data bundle offering"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Form body ───────────────────────────────────────────────────── */}
        <form
          id="bundle-form"
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Name + Data amount */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bundle name" icon={<Tag className="w-3.5 h-3.5" />}>
              <input
                ref={firstInputRef}
                type="text"
                placeholder="e.g. MTN 3GB Daily"
                value={bundle.name}
                required
                disabled={loading}
                onChange={(e) => onBundleChange({ ...bundle, name: e.target.value })}
                className={inputCls()}
              />
            </Field>

            <Field label="Data amount" icon={<Database className="w-3.5 h-3.5" />}>
              <input
                type="text"
                placeholder="e.g. 3GB"
                value={bundle.dataAmount}
                required
                disabled={loading}
                onChange={(e) => onBundleChange({ ...bundle, dataAmount: e.target.value })}
                className={inputCls()}
              />
            </Field>
          </div>

          {/* Price + Network */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (GHS)" icon={<DollarSign className="w-3.5 h-3.5" />}>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none select-none">
                  ₵
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={bundle.price || ""}
                  required
                  disabled={loading}
                  onChange={(e) => onBundleChange({ ...bundle, price: Number(e.target.value) })}
                  className={`${inputCls()} pl-7`}
                />
              </div>
            </Field>

            <Field label="Network" icon={<Wifi className="w-3.5 h-3.5" />}>
              <div className="relative">
                {/* Telco colour dot */}
                <span
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full pointer-events-none
                    ${TELCO_OPTIONS.find((t) => t.value === bundle.telcoCode)?.color ?? "bg-gray-300"}`}
                />
                <select
                  value={bundle.telcoCode}
                  disabled={loading}
                  onChange={(e) => onBundleChange({ ...bundle, telcoCode: e.target.value })}
                  className={`${inputCls()} pl-7 appearance-none cursor-pointer`}
                >
                  {TELCO_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </Field>
          </div>

          {/* Category */}
          <Field label="Category">
            <div className="grid grid-cols-2 gap-3">
              {CATEGORY_OPTIONS.map((opt) => {
                const active = bundle.category === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={loading}
                    onClick={() => onBundleChange({ ...bundle, category: opt.value })}
                    className={`flex flex-col items-start px-4 py-3 rounded-xl border-2 text-left transition-all
                      ${active
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                      } disabled:opacity-50`}
                  >
                    <span className={`text-sm font-semibold ${active ? "text-blue-700" : "text-gray-700"}`}>
                      {opt.label}
                    </span>
                    <span className={`text-xs mt-0.5 ${active ? "text-blue-500" : "text-gray-400"}`}>
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Description */}
          <Field label="Description" icon={<FileText className="w-3.5 h-3.5" />}>
            <textarea
              placeholder="Describe this bundle — validity, restrictions, etc."
              rows={3}
              required
              disabled={loading}
              value={bundle.description}
              onChange={(e) => onBundleChange({ ...bundle, description: e.target.value })}
              className={`${inputCls()} resize-none`}
            />
          </Field>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
              <p className="text-sm text-blue-700 font-medium">
                {mode === "edit" ? "Saving changes…" : "Creating bundle…"}
              </p>
            </div>
          )}
        </form>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-3">
          {/* Validation hint */}
          <p className="text-xs text-gray-400 truncate">
            {!isFormValid && !loading ? "Fill all fields to continue" : ""}
          </p>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="bundle-form"
              disabled={!isFormValid || loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Package className="w-4 h-4" />
              {loading
                ? mode === "edit" ? "Saving…" : "Creating…"
                : mode === "edit" ? "Save changes" : "Create bundle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}