"use client";

import React from "react";
import { X, Package, DollarSign, Wifi } from "lucide-react";

export type NewBundle = {
  name: string;
  description: string;
  price: number;
  telcoCode: string;
  dataAmount: string;
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

export default function CreateBundleModal({
  isOpen,
  onClose,
  onSubmit,
  bundle,
  onBundleChange,
  mode = "create",
  loading = false,
}: CreateBundleModalProps) {
  if (!isOpen) return null;

  const isFormValid =
    bundle.name.trim() &&
    bundle.description.trim() &&
    bundle.dataAmount.trim() &&
    bundle.telcoCode &&
    bundle.price > 0;

  const TELCO_OPTIONS = ["MTN", "Vodafone", "AirtelTigo", "Telecel"];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              {mode === "edit" ? "Edit Bundle" : "Create Bundle"}
            </h2>
            <p className="text-blue-100 text-xs">
              {mode === "edit" ? "Update data bundle" : "Add a new data bundle"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Bundle Name"
              value={bundle.name}
              required
              onChange={(e) =>
                onBundleChange({ ...bundle, name: e.target.value })
              }
              className="input"
            />

            <input
              type="text"
              placeholder="Data Amount (e.g. 3GB)"
              value={bundle.dataAmount}
              required
              onChange={(e) =>
                onBundleChange({ ...bundle, dataAmount: e.target.value })
              }
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-green-600" />
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Price"
                value={bundle.price}
                required
                onChange={(e) =>
                  onBundleChange({
                    ...bundle,
                    price: Number(e.target.value),
                  })
                }
                className="input pl-9"
              />
            </div>

            <div className="relative">
              <Wifi className="absolute left-3 top-2.5 w-4 h-4 text-blue-600" />
              <select
                value={bundle.telcoCode}
                onChange={(e) =>
                  onBundleChange({ ...bundle, telcoCode: e.target.value })
                }
                className="input pl-9"
              >
                {TELCO_OPTIONS.map((telco) => (
                  <option key={telco} value={telco}>
                    {telco}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            placeholder="Bundle description"
            rows={3}
            value={bundle.description}
            required
            onChange={(e) =>
              onBundleChange({ ...bundle, description: e.target.value })
            }
            className="input resize-none"
          />

          <div className="flex gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded-lg py-2 font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`flex-1 py-2 rounded-lg font-semibold text-white ${
                isFormValid
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading
                ? "Processing..."
                : mode === "edit"
                ? "Update"
                : "Create"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          outline: none;
        }
        .input:focus {
          border-color: #2563eb;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
