"use client";

import React, { useEffect, useRef } from "react";
import { X, Package, Database, DollarSign, Wifi, FileText, Tag, ToggleRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Bundle = {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  telcoCode: string;
  dataAmount?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

interface EditBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  bundle: Bundle | null;
  onBundleChange: (bundle: Bundle) => void;
  loading?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TELCO_OPTIONS = [
  { value: "MTN",        label: "MTN",        color: "bg-yellow-400" },
  { value: "Vodafone",   label: "Vodafone",   color: "bg-red-500"    },
  { value: "AirtelTigo", label: "AirtelTigo", color: "bg-orange-500" },
  { value: "Telecel",    label: "Telecel",    color: "bg-blue-500"   },
];

// ─── Shared field wrapper ─────────────────────────────────────────────────────

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

const inputCls =
  "w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl outline-none transition-all placeholder:text-gray-300 hover:border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-400";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EditBundleModal({
  isOpen,
  onClose,
  onSubmit,
  bundle,
  onBundleChange,
  loading = false,
}: EditBundleModalProps) {
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && bundle) setTimeout(() => firstInputRef.current?.focus(), 80);
  }, [isOpen, bundle]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !bundle) return null;

  const isFormValid =
    String(bundle.name ?? "").trim().length > 0 &&
    String(bundle.description ?? "").trim().length > 0 &&
    String(bundle.dataAmount ?? "").trim().length > 0 &&
    String(bundle.telcoCode ?? "").trim().length > 0 &&
    Number(bundle.price) > 0;

  const activeTelco = TELCO_OPTIONS.find((t) => t.value === bundle.telcoCode);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="edit-bundle-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 id="edit-bundle-title" className="text-base font-semibold text-gray-900">
                Edit bundle
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">
                {bundle.name || "Unnamed bundle"}
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
          id="edit-bundle-form"
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Name + Data amount */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bundle name" icon={<Tag className="w-3.5 h-3.5" />}>
              <input
                ref={firstInputRef}
                type="text"
                required
                placeholder="e.g. MTN 3GB Weekly"
                value={bundle.name}
                disabled={loading}
                onChange={(e) => onBundleChange({ ...bundle, name: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Data amount" icon={<Database className="w-3.5 h-3.5" />}>
              <input
                type="text"
                required
                placeholder="e.g. 3GB"
                value={bundle.dataAmount ?? ""}
                disabled={loading}
                onChange={(e) => onBundleChange({ ...bundle, dataAmount: e.target.value })}
                className={inputCls}
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
                  required
                  step="0.01"
                  min={0}
                  placeholder="0.00"
                  value={bundle.price || ""}
                  disabled={loading}
                  onChange={(e) => onBundleChange({ ...bundle, price: Number(e.target.value) })}
                  className={`${inputCls} pl-7`}
                />
              </div>
            </Field>

            <Field label="Network" icon={<Wifi className="w-3.5 h-3.5" />}>
              <div className="relative">
                <span
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full pointer-events-none ${activeTelco?.color ?? "bg-gray-300"}`}
                />
                <select
                  required
                  value={bundle.telcoCode}
                  disabled={loading}
                  onChange={(e) => onBundleChange({ ...bundle, telcoCode: e.target.value })}
                  className={`${inputCls} pl-7 appearance-none cursor-pointer`}
                >
                  {TELCO_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </Field>
          </div>

          {/* Description */}
          <Field label="Description" icon={<FileText className="w-3.5 h-3.5" />}>
            <textarea
              required
              rows={3}
              placeholder="Describe this bundle — validity, restrictions, etc."
              value={bundle.description}
              disabled={loading}
              onChange={(e) => onBundleChange({ ...bundle, description: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </Field>

          {/* Active toggle */}
          <Field label="Visibility" icon={<ToggleRight className="w-3.5 h-3.5" />}>
            <button
              type="button"
              disabled={loading}
              onClick={() => onBundleChange({ ...bundle, isActive: !bundle.isActive })}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 text-left transition-all
                ${bundle.isActive
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
                } disabled:opacity-50`}
            >
              <div>
                <p className={`text-sm font-semibold ${bundle.isActive ? "text-emerald-700" : "text-gray-500"}`}>
                  {bundle.isActive ? "Active" : "Inactive"}
                </p>
                <p className={`text-xs mt-0.5 ${bundle.isActive ? "text-emerald-500" : "text-gray-400"}`}>
                  {bundle.isActive ? "Visible to users on the storefront" : "Hidden — not visible to users"}
                </p>
              </div>
              {/* Pill toggle */}
              <div className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${bundle.isActive ? "bg-emerald-500" : "bg-gray-200"}`}>
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${bundle.isActive ? "translate-x-4" : "translate-x-0"}`}
                />
              </div>
            </button>
          </Field>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
              <p className="text-sm text-blue-700 font-medium">Saving changes…</p>
            </div>
          )}
        </form>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400 truncate">
            {!isFormValid && !loading ? "Fill all required fields to continue" : ""}
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
              form="edit-bundle-form"
              disabled={!isFormValid || loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Package className="w-4 h-4" />
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}