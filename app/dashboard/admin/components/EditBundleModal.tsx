"use client";

import React from "react";

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
}

export default function EditBundleModal({
  isOpen,
  onClose,
  onSubmit,
  bundle,
  onBundleChange,
}: EditBundleModalProps) {
  if (!isOpen || !bundle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Edit Bundle</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Bundle Name"
              value={bundle.name}
              onChange={(e) =>
                onBundleChange({ ...bundle, name: e.target.value })
              }
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              required
              placeholder="Data Amount (e.g., 3GB, 500MB)"
              value={bundle.dataAmount || ""}
              onChange={(e) =>
                onBundleChange({ ...bundle, dataAmount: e.target.value })
              }
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="number"
              required
              placeholder="Price"
              value={bundle.price}
              onChange={(e) =>
                onBundleChange({ ...bundle, price: +e.target.value })
              }
              className="px-4 py-2 border rounded-lg"
            />
            <select
              value={bundle.telcoCode}
              onChange={(e) =>
                onBundleChange({ ...bundle, telcoCode: e.target.value })
              }
              className="px-4 py-2 border rounded-lg"
            >
              <option value="MTN">MTN</option>
              <option value="Vodafone">Vodafone</option>
              <option value="AirtelTigo">AirtelTigo</option>
              <option value="Telecel">Telecel</option>
            </select>
          </div>
          <textarea
            required
            placeholder="Description"
            value={bundle.description}
            onChange={(e) =>
              onBundleChange({ ...bundle, description: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
