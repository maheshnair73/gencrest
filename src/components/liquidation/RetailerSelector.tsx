import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Building2 } from 'lucide-react';
import { MOCK_RETAILERS, type MockRetailer } from '../../data/mockData';

interface RetailerSelectorProps {
  onSelect: (retailer: { id: string; code: string; name: string; phone: string; address: string }) => void;
  onAddNew: () => void;
  selectedRetailerIds?: string[];
}

export const RetailerSelector: React.FC<RetailerSelectorProps> = ({
  onSelect,
  onAddNew,
  selectedRetailerIds = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRetailers, setFilteredRetailers] = useState<MockRetailer[]>(MOCK_RETAILERS);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = MOCK_RETAILERS.filter(retailer =>
      !selectedRetailerIds.includes(retailer.id) &&
      (retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.phone.includes(searchTerm))
    );
    setFilteredRetailers(filtered);
  }, [searchTerm, selectedRetailerIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (retailer: MockRetailer) => {
    onSelect({
      id: retailer.id,
      code: retailer.code,
      name: retailer.name,
      phone: retailer.phone,
      address: retailer.address
    });
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleAddNew = () => {
    onAddNew();
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search retailer by name, code, or phone..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
          <button
            onClick={handleAddNew}
            className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-green-50 border-b border-gray-200 text-green-700 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Retailer</span>
          </button>

          {filteredRetailers.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No retailers found</p>
            </div>
          ) : (
            <div>
              {filteredRetailers.map(retailer => (
                <button
                  key={retailer.id}
                  onClick={() => handleSelect(retailer)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-gray-900 text-sm">{retailer.name}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      {retailer.code}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 ml-5">
                    <div>{retailer.phone}</div>
                    <div className="truncate">{retailer.address}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
