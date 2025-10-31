import React from 'react';
import { MapPin, AlertTriangle, X } from 'lucide-react';

interface LocationVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  distance: number;
  locationName: string;
  requiredRadius: number;
}

export const LocationVerificationModal: React.FC<LocationVerificationModalProps> = ({
  isOpen,
  onClose,
  distance,
  locationName,
  requiredRadius
}) => {
  if (!isOpen) return null;

  const formatDistance = (dist: number): string => {
    if (dist >= 1000) {
      return `${(dist / 1000).toFixed(2)} km`;
    }
    return `${Math.round(dist)}m`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Location Verification Failed</h3>
              <p className="text-amber-100 text-sm">You're too far from the location</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-800 font-medium mb-2">
                  You are <span className="text-amber-600 font-bold text-lg">{formatDistance(distance)}</span> away from <span className="font-semibold">{locationName}</span>.
                </p>
                <p className="text-gray-600 text-sm">
                  You must be within <span className="font-semibold text-amber-600">{requiredRadius}m</span> of the location to verify.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              What to do:
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">1.</span>
                <span>Please visit the physical location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">2.</span>
                <span>Ensure you are within {requiredRadius}m of the premises</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">3.</span>
                <span>Try again once you reach the location</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
          >
            OK, I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
