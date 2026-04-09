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
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-2xl font-bold mb-2 text-gray-900">Edit Data Bundle</h3>
          <p className="text-gray-500 mb-6 text-sm">Update the details of your bundle below. Fields marked with <span className='text-red-500'>*</span> are required.</p>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Bundle Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MTN 3GB Weekly"
                  value={bundle.name}
                  onChange={e => onBundleChange({ ...bundle, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Data Amount <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3GB, 500MB"
                  value={bundle.dataAmount || ""}
                  onChange={e => onBundleChange({ ...bundle, dataAmount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Price (₵) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  step= "0.01"
                  min={0}
                  placeholder="e.g. 20"
                  value={bundle.price}
                  onChange={e => onBundleChange({ ...bundle, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Telco <span className="text-red-500">*</span></label>
                <select
                  value={bundle.telcoCode}
                  onChange={e => onBundleChange({ ...bundle, telcoCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="MTN">MTN</option>
                  <option value="Vodafone">Vodafone</option>
                  <option value="AirtelTigo">AirtelTigo</option>
                  <option value="Telecel">Telecel</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Description <span className="text-red-500">*</span></label>
              <textarea
                required
                placeholder="Describe this bundle..."
                value={bundle.description}
                onChange={e => onBundleChange({ ...bundle, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[60px]"
              />
            </div>
            <div className="flex items-center gap-3 mt-2">
              <input
                id="isActive"
                type="checkbox"
                checked={!!bundle.isActive}
                onChange={e => onBundleChange({ ...bundle, isActive: e.target.checked })}
                className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active (Visible to users)</label>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
