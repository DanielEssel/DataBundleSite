"use client";

import React from "react";
import { X } from "lucide-react";

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

interface ViewBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundle: Bundle | null;
}

export default function ViewBundleModal({
  isOpen,
  onClose,
  bundle,
}: ViewBundleModalProps) {
  if (!isOpen || !bundle) return null;

  const getTelcoColor = (telcoCode: string) => {
    switch (telcoCode) {
      case "MTN":
        return "bg-yellow-100 text-yellow-800";
      case "Vodafone":
        return "bg-red-100 text-red-800";
      case "AirtelTigo":
        return "bg-blue-100 text-blue-800";
      case "Telecel":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Bundle Details</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Bundle Name</p>
              <p className="text-gray-900 font-semibold">{bundle.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Data Amount</p>
              <p className="text-gray-900 font-semibold">{bundle.dataAmount || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Price</p>
              <p className="text-gray-900 font-semibold">₵{typeof bundle.price === 'number' ? bundle.price.toFixed(2) : bundle.price}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Telco</p>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getTelcoColor(bundle.telcoCode)}`}>
                {bundle.telcoCode}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 font-medium">Description</p>
            <p className="text-gray-900 whitespace-pre-wrap">{bundle.description}</p>
          </div>

          {bundle.isActive !== undefined && (
            <div>
              <p className="text-sm text-gray-500 font-medium">Status</p>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${bundle.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {bundle.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          )}

          {bundle.createdAt && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 font-medium">Created</p>
                <p className="text-gray-900 text-sm">{new Date(bundle.createdAt).toLocaleString()}</p>
              </div>
              {bundle.updatedAt && (
                <div>
                  <p className="text-sm text-gray-500 font-medium">Updated</p>
                  <p className="text-gray-900 text-sm">{new Date(bundle.updatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
