import React, { useState, useEffect } from 'react';
import { Search, Plus, Building2, MapPin, Phone } from 'lucide-react';
import { MOCK_RETAILERS, type MockRetailer } from '../../data/mockData';

interface MobileRetailerSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (retailer: { id: string; code: string; name: string; phone: string; address: string }) => void;
  selectedRetailerIds?: string[];
}

export const MobileRetailerSelector: React.FC<MobileRetailerSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedRetailerIds = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRetailers, setFilteredRetailers] = useState<MockRetailer[]>(MOCK_RETAILERS);

  useEffect(() => {
    const filtered = MOCK_RETAILERS.filter(retailer =>
      retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.phone.includes(searchTerm) ||
      retailer.territory.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRetailers(filtered);
  }, [searchTerm]);

  const handleSelect = (retailer: MockRetailer) => {
    if (!selectedRetailerIds.includes(retailer.id)) {
      onSelect({
        id: retailer.id,
        code: retailer.code,
        name: retailer.name,
        phone: retailer.phone,
        address: retailer.address
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Select Retailer</h2>
          <button onClick={onClose} className="text-white">
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
          <input
            type="text"
            placeholder="Search by name, code, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredRetailers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Building2 className="w-16 h-16 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-semibold">No retailers found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRetailers.map(retailer => {
              const isSelected = selectedRetailerIds.includes(retailer.id);
              return (
                <button
                  key={retailer.id}
                  onClick={() => handleSelect(retailer)}
                  disabled={isSelected}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-gray-100 border-gray-300 opacity-60'
                      : 'bg-white border-gray-200 active:border-blue-500 active:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 flex-1">{retailer.name}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                      {retailer.code}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 ml-7">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{retailer.territory}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{retailer.phone}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{retailer.address}</p>
                  </div>
                  {isSelected && (
                    <div className="mt-2 text-center">
                      <span className="inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full font-medium">
                        Already Selected
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
