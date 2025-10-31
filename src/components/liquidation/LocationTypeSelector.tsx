/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LocationTypeSelectorProps {
  type: 'my assignments' | 'territory' | 'region' | 'zone' | 'state' | 'all' | null;
  setType: any;
}

const LocationTypeSelector: React.FC<LocationTypeSelectorProps> = ({ type, setType }) => {
  const { user } = useAuth();
  const [allTypes, setAllTypes] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.role) return;

    const role = user.role.toLowerCase();

    if (['admin', 'superadmin'].includes(role)) {
      setAllTypes(['territory', 'region', 'zone', 'state', 'all']);
    } else if (['mdo', 'so'].includes(role)) {
      setAllTypes(['my assignments', 'territory', 'state']);
    } else if (['tsm'].includes(role)) {
      setAllTypes(['my assignments', 'territory', 'region', 'state']);
    } else if (['rbh', 'rmm'].includes(role)) {
      setAllTypes(['my assignments', 'region', 'state', 'zone']);
    } else if (['zbh'].includes(role)) {
      setAllTypes(['my assignments', 'zone', 'state']);
    } else {
      setAllTypes(['territory', 'region', 'zone', 'state', 'all']);
    }
  }, [user]);

  return (
    <div className="w-full flex flex-wrap gap-2 items-center justify-start mt-2">
      {allTypes.map((t) => {
        const isActive = type === t;
        return (
          <button
            key={t}
            onClick={() => setType(t as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border active:scale-95 ${
              isActive
                ? 'bg-blue-600 text-white border-blue-700 shadow-md'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        );
      })}
    </div>
  );
};

export default LocationTypeSelector;
