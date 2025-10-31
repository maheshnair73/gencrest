/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

export interface NewRetailerData {
  name: string;
  outletName: string;
  phone: string;
  address: string;
  pincode: string;
  market: string;
}

interface AddRetailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (retailer: NewRetailerData) => void;
  existingRetailers?: Array<{ name: string; phone?: string; outletName?: string; code?: string }>;
}

interface DuplicateWarning {
  type: 'exact' | 'similar' | 'phone';
  message: string;
  matches: Array<{ name: string; phone?: string; code?: string }>;
}

export const AddRetailerModal: React.FC<AddRetailerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingRetailers = [],
}) => {
  const [formData, setFormData] = useState<NewRetailerData>({
    name: "",
    outletName: "",
    phone: "",
    address: "",
    pincode: "",
    market: "",
  });
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null);
  const [confirmOverride, setConfirmOverride] = useState(false);

  if (!isOpen) return null;

  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9\s]/g, '');
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = normalizeString(str1);
    const s2 = normalizeString(str2);

    if (s1 === s2) return 1;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = (s1: string, s2: string): number => {
      const costs: number[] = [];
      for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
          if (i === 0) {
            costs[j] = j;
          } else if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
        if (i > 0) costs[s2.length] = lastValue;
      }
      return costs[s2.length];
    };

    return (longer.length - editDistance(longer, shorter)) / longer.length;
  };

  const checkForDuplicates = (name: string, phone: string) => {
    if (!name.trim() || existingRetailers.length === 0) {
      setDuplicateWarning(null);
      return;
    }

    const normalizedName = normalizeString(name);
    const normalizedPhone = phone.replace(/\D/g, '');

    const exactMatches: typeof existingRetailers = [];
    const similarMatches: typeof existingRetailers = [];
    const phoneMatches: typeof existingRetailers = [];

    existingRetailers.forEach((retailer) => {
      const existingNormalizedName = normalizeString(retailer.name);
      const existingPhone = (retailer.phone || '').replace(/\D/g, '');

      if (existingNormalizedName === normalizedName) {
        exactMatches.push(retailer);
      } else {
        const similarity = calculateSimilarity(name, retailer.name);
        if (similarity > 0.8) {
          similarMatches.push(retailer);
        }
      }

      if (normalizedPhone && existingPhone && normalizedPhone === existingPhone) {
        phoneMatches.push(retailer);
      }
    });

    if (exactMatches.length > 0) {
      setDuplicateWarning({
        type: 'exact',
        message: `A retailer with this exact name already exists. This might be a duplicate entry.`,
        matches: exactMatches,
      });
    } else if (phoneMatches.length > 0) {
      setDuplicateWarning({
        type: 'phone',
        message: `This phone number is already registered with another retailer.`,
        matches: phoneMatches,
      });
    } else if (similarMatches.length > 0) {
      setDuplicateWarning({
        type: 'similar',
        message: `Found similar retailer names. Please verify this is not a duplicate.`,
        matches: similarMatches,
      });
    } else {
      setDuplicateWarning(null);
    }
  };

  useEffect(() => {
    if (formData.name || formData.phone) {
      const timeoutId = setTimeout(() => {
        checkForDuplicates(formData.name, formData.phone);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setDuplicateWarning(null);
    }
  }, [formData.name, formData.phone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setConfirmOverride(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.outletName.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.pincode.trim() || !formData.market.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    if (duplicateWarning && duplicateWarning.type !== 'similar' && !confirmOverride) {
      alert(`Cannot proceed: ${duplicateWarning.message}\n\nPlease check existing retailers or confirm this is intentional.`);
      return;
    }

    if (duplicateWarning && duplicateWarning.type === 'similar' && !confirmOverride) {
      const confirmed = window.confirm(
        `${duplicateWarning.message}\n\nExisting retailers:\n${duplicateWarning.matches.map(m => `- ${m.name} (${m.code || 'No code'})`).join('\n')}\n\nDo you want to proceed anyway?`
      );
      if (!confirmed) return;
      setConfirmOverride(true);
    }

    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-800">Add New Retailer</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {duplicateWarning && (
            <div className={`p-4 rounded-lg border ${
              duplicateWarning.type === 'exact' || duplicateWarning.type === 'phone'
                ? 'bg-red-50 border-red-300'
                : 'bg-yellow-50 border-yellow-300'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                  duplicateWarning.type === 'exact' || duplicateWarning.type === 'phone'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`} />
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    duplicateWarning.type === 'exact' || duplicateWarning.type === 'phone'
                      ? 'text-red-800'
                      : 'text-yellow-800'
                  }`}>
                    {duplicateWarning.type === 'exact' && 'Duplicate Retailer Detected'}
                    {duplicateWarning.type === 'phone' && 'Phone Number Already Exists'}
                    {duplicateWarning.type === 'similar' && 'Similar Retailers Found'}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    duplicateWarning.type === 'exact' || duplicateWarning.type === 'phone'
                      ? 'text-red-700'
                      : 'text-yellow-700'
                  }`}>
                    {duplicateWarning.message}
                  </p>
                  <div className="mt-2 space-y-1">
                    {duplicateWarning.matches.map((match, idx) => (
                      <div key={idx} className={`text-sm font-medium ${
                        duplicateWarning.type === 'exact' || duplicateWarning.type === 'phone'
                          ? 'text-red-900'
                          : 'text-yellow-900'
                      }`}>
                        • {match.name} {match.code && `(Code: ${match.code})`} {match.phone && `- ${match.phone}`}
                      </div>
                    ))}
                  </div>
                  {duplicateWarning.type === 'similar' && (
                    <label className="flex items-center gap-2 mt-3">
                      <input
                        type="checkbox"
                        checked={confirmOverride}
                        onChange={(e) => setConfirmOverride(e.target.checked)}
                        className="rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-yellow-800 font-medium">
                        I confirm this is a new retailer, not a duplicate
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Retailer Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Outlet Name *</label>
            <input
              name="outletName"
              value={formData.outletName}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Outlet Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Retailer Address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Mobile Number"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Pincode *</label>
              <input
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Pincode"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Market *</label>
              <input
                name="market"
                value={formData.market}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Market"
                required
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-lg text-white font-medium ${
                loading
                  ? "bg-orange-300 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {loading ? "Saving..." : "Save Retailer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
